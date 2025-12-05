import { useParams, useNavigate, useLocation } from "react-router-dom";
import { ChevronLeft, Plus, Search, MessageSquare, User, Clock } from "lucide-react";
import { useState, useEffect } from "react";
import BottomNav from "@/components/BottomNav";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getPostsByType, boardIdToPostType, PostListItem } from "@/lib/api/posts";

const BoardList = () => {
  const { boardId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [posts, setPosts] = useState<PostListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const boardNames: Record<string, string> = {
    notice: "공지",
    companion: "동행 게시판",
    free: "자유 게시판",
    market: "거래 게시판",
    review: "후기 게시판",
    join: "모집 게시판",
    artist: "아티스트 게시판",
  };

  useEffect(() => {
    const fetchPosts = async () => {
      if (!boardId) return;

      const postType = boardIdToPostType[boardId];
      if (!postType) {
        setError("잘못된 게시판입니다.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await getPostsByType(postType);
        setPosts(response.posts);
        setError(null);
      } catch (err) {
        console.error("게시글 로딩 실패:", err);
        setPosts([]);
        setError(null); // 게시글이 없는 경우로 처리
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [boardId, location.pathname]); // location.pathname 추가하여 페이지로 돌아올 때마다 새로고침

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 60000);
    
    if (diff < 1) return "방금 전";
    if (diff < 60) return `${diff}분 전`;
    if (diff < 1440) return `${Math.floor(diff / 60)}시간 전`;
    if (diff < 10080) return `${Math.floor(diff / 1440)}일 전`;
    
    return `${date.getMonth() + 1}월 ${date.getDate()}일`;
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="bg-background/95 backdrop-blur-sm border-b border-border/50 sticky top-0 z-40">
        <div className="max-w-screen-xl mx-auto px-4 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button 
              onClick={() => navigate(-1)} 
              className="p-1.5 hover:bg-muted/50 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-foreground" />
            </button>
            <h1 className="text-lg font-semibold text-foreground">{boardNames[boardId || ""] || "게시판"}</h1>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => navigate(`/board/${boardId}/create`)}
              className="p-2 hover:bg-muted/50 rounded-lg transition-colors"
            >
              <Plus className="w-5 h-5 text-foreground" />
            </button>
            <button className="p-2 hover:bg-muted/50 rounded-lg transition-colors">
              <Search className="w-5 h-5 text-foreground" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-screen-xl mx-auto px-4 py-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin mb-3"></div>
            <p className="text-sm text-muted-foreground">로딩 중...</p>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center py-20">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <MessageSquare className="w-8 h-8 text-primary" />
            </div>
            <p className="text-base font-semibold text-foreground mb-1">아직 게시글이 없습니다</p>
            <p className="text-sm text-muted-foreground text-center mb-6">첫 번째 게시글을 작성해보세요!</p>
            <Button
              onClick={() => navigate(`/board/${boardId}/create`)}
              className="h-10 px-5 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm text-sm font-medium"
            >
              <Plus className="w-4 h-4 mr-1.5" />
              게시글 작성하기
            </Button>
          </div>
        ) : (
          <div className="space-y-2 pt-2">
            {posts.map((post) => (
              <button
                key={post.postId}
                onClick={() => navigate(`/board/${boardId}/post/${post.postId}`)}
                className="w-full p-4 bg-card rounded-xl border border-border/50 hover:bg-primary/3 hover:border-primary/30 transition-all duration-150 shadow-sm hover:shadow-md text-left group"
              >
                {/* 게시판 태그 */}
                <div className="mb-2">
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-primary/10 text-primary">
                    {boardNames[boardId || ""] || "게시판"}
                  </span>
                </div>

                {/* 제목 */}
                <h3 className="font-semibold text-base text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                  {post.title}
                </h3>

                {/* 메타 정보 */}
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Avatar className="w-4 h-4">
                      <AvatarFallback className="bg-primary/10 text-primary text-[8px]">
                        <User className="w-2.5 h-2.5" />
                      </AvatarFallback>
                    </Avatar>
                    <span>사용자</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{formatDate(post.createdAt)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MessageSquare className="w-3 h-3" />
                    <span>댓글</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </main>
      <BottomNav />
    </div>
  );
};

export default BoardList;