import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft, Plus, Search } from "lucide-react";
import BottomNav from "@/components/BottomNav";

const BoardList = () => {
  const { boardId } = useParams();
  const navigate = useNavigate();

  const boardNames: Record<string, string> = {
    notice: "공지",
    companion: "동행 게시판",
    free: "자유 게시판",
    chat: "잡담 게시판",
    review: "후기 게시판",
    qna: "Q&A 게시판",
  };

  // TODO: API 연동 시 실제 데이터로 교체
  const posts: { id: number; title: string; author: string; date: string; likes: number; comments: number }[] = [];

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
        {posts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
            <p className="text-lg mb-2">아직 게시글이 없습니다</p>
            <p className="text-sm">첫 번째 게시글을 작성해보세요!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {posts.map((post) => (
              <button
                key={post.id}
                onClick={() => navigate(`/board/${boardId}/post/${post.id}`)}
                className="w-full p-4 bg-card rounded-lg hover:bg-accent transition-colors text-left"
              >
                <h3 className="font-semibold text-foreground mb-2">{post.title}</h3>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>
                    {post.author} · {post.date}
                  </span>
                  <span>
                    ❤️ {post.likes} · 💬 {post.comments}
                  </span>
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