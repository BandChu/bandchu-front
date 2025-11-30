import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft, Plus, Search, Heart, MessageCircle } from "lucide-react";
import BottomNav from "@/components/BottomNav";

const PostDetail = () => {
  const { boardId, postId } = useParams();
  const navigate = useNavigate();
  const [liked, setLiked] = useState(false);

  const post = {
    title: "김완주 사랑해",
    author: "lemonson03",
    date: "2025.11.10",
    content: `넵
실리카겔은 전과 기라도 결혼 드립은 맞이지 열광한지 도저도 못간거지 결리잘볼걸이
가나다라
마바사아자차
타파하하하`,
  };

  const comments = [
    {
      id: 1,
      author: "이어캔 소스캐",
      content: "깨저라 정화수월",
      date: "11.09 22:07",
      likes: 5,
    },
    {
      id: 2,
      author: "고조 사토루",
      content: "주츠시키런만 아가",
      date: "11.09 22:01",
      likes: 3,
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
            <h1 className="text-lg font-bold">자유 게시판</h1>
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

      <main className="max-w-screen-xl mx-auto px-4 py-6">
        <div className="bg-card rounded-lg p-4 mb-6">
          <h1 className="text-xl font-bold text-foreground mb-3">{post.title}</h1>
          <div className="text-sm text-muted-foreground mb-4">
            {post.author} · {post.date}
          </div>
          <div className="text-foreground whitespace-pre-wrap mb-6">{post.content}</div>
          <button
            onClick={() => setLiked(!liked)}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            <Heart className={`w-5 h-5 ${liked ? "fill-primary text-primary" : ""}`} />
            <span>좋아요</span>
          </button>
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-bold text-muted-foreground">댓글</h2>
          {comments.map((comment) => (
            <div key={comment.id} className="bg-card rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-muted flex-shrink-0" />
                <div className="flex-1">
                  <div className="font-semibold text-foreground mb-1">{comment.author}</div>
                  <div className="text-sm text-foreground mb-2">{comment.content}</div>
                  <div className="text-xs text-muted-foreground mb-2">{comment.date}</div>
                  <div className="flex items-center gap-4">
                    <button className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors">
                      <Heart className="w-4 h-4" />
                      <span>{comment.likes}</span>
                    </button>
                    <button className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors">
                      <MessageCircle className="w-4 h-4" />
                      <span>답글</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
      <BottomNav />
    </div>
  );
};

export default PostDetail;
