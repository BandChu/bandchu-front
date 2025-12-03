import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft, Plus, Search } from "lucide-react";
import { useState, useEffect } from "react";
import BottomNav from "@/components/BottomNav";
import { getPostsByType, boardIdToPostType, PostListItem } from "@/lib/api/posts";

const BoardList = () => {
  const { boardId } = useParams();
  const navigate = useNavigate();
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
  }, [boardId]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="bg-background border-b border-border sticky top-0 z-40">
        <div className="max-w-screen-xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="text-foreground">
              <ChevronLeft className="w-6 h-6" />
            </button>
            <h1 className="text-lg font-bold">{boardNames[boardId || ""] || "게시판"}</h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate(`/board/${boardId}/create`)}
              className="text-foreground"
            >
              <Plus className="w-6 h-6" />
            </button>
            <button className="text-foreground">
              <Search className="w-6 h-6" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-screen-xl mx-auto px-4 py-4">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <p className="text-muted-foreground">로딩 중...</p>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center py-20">
            <p className="text-destructive">{error}</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
            <p className="text-lg mb-2">아직 게시글이 없습니다</p>
            <p className="text-sm">첫 번째 게시글을 작성해보세요!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {posts.map((post) => (
              <button
                key={post.postId}
                onClick={() => navigate(`/board/${boardId}/post/${post.postId}`)}
                className="w-full p-4 bg-card rounded-lg hover:bg-accent transition-colors text-left"
              >
                <h3 className="font-semibold text-foreground mb-2">{post.title}</h3>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>{formatDate(post.createdAt)}</span>
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