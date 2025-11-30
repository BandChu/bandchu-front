import { useState } from "react";
import { useNavigate } from "react-router-dom";
import BottomNav from "@/components/BottomNav";
import { Plus, Search, Settings } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const Chatting = () => {
  const navigate = useNavigate();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const chatRooms = [
    { id: "1", name: "roseinseo", lastMessage: "자유 게시판 ** 글에서 보낸 사용자", time: "2분 전", unread: 2 },
    { id: "2", name: "haril_lemon", lastMessage: "동행 게시판 && 글에서 보낸 사용자", time: "10분 전", unread: 0 },
    { id: "3", name: "m_cylin01", lastMessage: "자유 게시판 (( 글에서 보낸 사용자", time: "1시간 전", unread: 0 },
  ];

  const searchResults = [
    { id: "room1", name: "실리카겔 팬 채팅방", type: "group" },
    { id: "room2", name: "실리카겔 굿즈 채팅방", type: "group" },
    { id: "room3", name: "실리카겔 (개인 채팅을 위해)", type: "private" },
  ].filter(room => room.name.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="sticky top-0 bg-background border-b border-border z-40">
        <div className="max-w-screen-xl mx-auto px-4 h-16 flex items-center justify-between">
          <h1 className="text-xl font-bold">채팅</h1>
          <div className="flex items-center gap-3">
            <button className="p-2 hover:bg-accent rounded-full transition-colors">
              <Plus className="w-6 h-6" />
            </button>
            <button 
              onClick={() => setSearchOpen(true)}
              className="p-2 hover:bg-accent rounded-full transition-colors"
            >
              <Search className="w-6 h-6" />
            </button>
            <button className="p-2 hover:bg-accent rounded-full transition-colors">
              <Settings className="w-6 h-6" />
            </button>
          </div>
        </div>
      </header>

      {/* Chat List */}
      <main className="max-w-screen-xl mx-auto">
        <div className="divide-y divide-border">
          {chatRooms.map((room) => (
            <button
              key={room.id}
              onClick={() => navigate(`/chat/${room.id}`)}
              className="w-full px-4 py-4 flex items-center gap-3 hover:bg-accent transition-colors text-left"
            >
              <Avatar className="w-12 h-12">
                <AvatarImage src="" />
                <AvatarFallback>{room.name.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-semibold text-foreground">{room.name}</h3>
                  <span className="text-xs text-muted-foreground">{room.time}</span>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground truncate">{room.lastMessage}</p>
                  {room.unread > 0 && (
                    <span className="ml-2 bg-primary text-primary-foreground text-xs font-medium px-2 py-0.5 rounded-full">
                      {room.unread}
                    </span>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      </main>

      {/* Search Dialog */}
      <Dialog open={searchOpen} onOpenChange={setSearchOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>채팅방 찾기</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="검색어를 입력하세요"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
            />
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {searchResults.map((result) => (
                <button
                  key={result.id}
                  onClick={() => {
                    navigate(`/chat/${result.id}`);
                    setSearchOpen(false);
                  }}
                  className="w-full p-4 flex items-center gap-3 hover:bg-accent rounded-lg transition-colors text-left"
                >
                  <Avatar className="w-12 h-12">
                    <AvatarImage src="" />
                    <AvatarFallback>{result.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-medium text-foreground">{result.name}</h3>
                    <p className="text-xs text-muted-foreground">
                      {result.type === "group" ? "그룹 채팅" : "개인 채팅"}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <BottomNav />
    </div>
  );
};

export default Chatting;
