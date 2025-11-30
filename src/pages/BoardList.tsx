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

  const posts = [
    {
      id: 1,
      title: "김완주 사랑해",
      author: "lemonson03",
      date: "2025.11.10",
      likes: 24,
      comments: 5,
    },
    {
      id: 2,
      title: "오아시스 내한 일정 확정!",
      author: "oasis_fan",
      date: "2025.11.09",
      likes: 156,
      comments: 32,
    },
    {
      id: 3,
      title: "실리카겔 단콘 후기",
      author: "silica_lover",
      date: "2025.11.08",
      likes: 89,
      comments: 18,
    },
  ];

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
            <button className="text-foreground">
              <Plus className="w-6 h-6" />
            </button>
            <button className="text-foreground">
              <Search className="w-6 h-6" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-screen-xl mx-auto px-4 py-4">
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
      </main>
      <BottomNav />
    </div>
  );
};

export default BoardList;
