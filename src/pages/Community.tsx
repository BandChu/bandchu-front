import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import { ChevronRight } from "lucide-react";

const Community = () => {
  const navigate = useNavigate();

  const boards = [
    { id: "notice", name: "공지", description: "1028 오아시스 내한 일정 관련 공지" },
    { id: "companion", name: "동행 게시판", description: "실리카겔 단콘 동좌 → 참실 택시 팝" },
    { id: "free", name: "자유 게시판", description: "김완주 사랑해" },
    { id: "chat", name: "잡담 게시판", description: "오아시스 콘서트 티켓 2장 팝니오..." },
    { id: "review", name: "후기 게시판", description: "리듬어 라이브 미쳤다.." },
    { id: "qna", name: "Q&A 게시판", description: "티켓팅 꿀팁 좀 알려주세요" },
  ];

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
