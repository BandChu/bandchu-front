import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import { ChevronRight } from "lucide-react";
import { 
  getAllPosts, 
  PostListItem, 
  postTypeToBoardName, 
  postTypeToBoardId 
} from "@/lib/api/posts";

interface BoardItem {
  id: string;
  name: string;
  description: string;
}

const Community = () => {
  const navigate = useNavigate();
  const [boards, setBoards] = useState<BoardItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        const response = await getAllPosts();
        
        // API 응답을 게시판 목록으로 변환
        const boardList: BoardItem[] = response.posts.map((post: PostListItem) => ({
          id: postTypeToBoardId[post.postType] || post.postType.toLowerCase(),
          name: postTypeToBoardName[post.postType] || post.postType,
          description: post.title,
        }));
        
        setBoards(boardList);
        setError(null);
      } catch (err) {
        console.error("게시글 로딩 실패:", err);
        setError("게시글을 불러오는데 실패했습니다.");
        // 에러 시 기본 게시판 표시
        setBoards([
          { id: "free", name: "자유 게시판", description: "아직 게시글이 없습니다" },
          { id: "companion", name: "동행 게시판", description: "아직 게시글이 없습니다" },
          { id: "review", name: "후기 게시판", description: "아직 게시글이 없습니다" },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header />
      <main className="max-w-screen-xl mx-auto px-4 py-6">
        <div className="flex items-center gap-4 mb-6">
          <button className="px-4 py-2 rounded-full bg-primary text-primary-foreground text-sm font-medium">
            현재 순위
          </button>
          <button className="px-4 py-2 rounded-full text-muted-foreground text-sm">
            1. 실리카겔
          </button>
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4">게시판 목록</h2>
          
          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="w-full p-4 bg-card rounded-lg animate-pulse">
                  <div className="h-4 bg-muted rounded w-1/4 mb-2" />
                  <div className="h-3 bg-muted rounded w-3/4" />
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>{error}</p>
              <button 
                onClick={() => window.location.reload()} 
                className="mt-2 text-primary underline"
              >
                다시 시도
              </button>
            </div>
          ) : boards.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              아직 게시글이 없습니다
            </div>
          ) : (
            <div className="space-y-2">
              {boards.map((board) => (
                <button
                  key={board.id}
                  onClick={() => navigate(`/board/${board.id}`)}
                  className="w-full flex items-center justify-between p-4 bg-card rounded-lg hover:bg-accent transition-colors text-left"
                >
                  <div>
                    <h3 className="font-semibold text-foreground">{board.name}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{board.description}</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-center gap-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="w-20 h-20 rounded-full bg-muted flex items-center justify-center"
            >
              <span className="text-xs text-muted-foreground">Artist {i}</span>
            </div>
          ))}
        </div>
      </main>
      <BottomNav />
    </div>
  );
};

export default Community;