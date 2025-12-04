
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import BottomNav from "@/components/BottomNav";
import { Plus, Search, Settings } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getChatRooms, ChatRoom } from "@/lib/chatstore";

const Chatting = () => {
  const navigate = useNavigate();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);

  useEffect(() => {
    const loadRooms = () => {
      setChatRooms(getChatRooms());
    };
    loadRooms();
    
    // Listen for storage changes (when new chat is created)
    window.addEventListener("storage", loadRooms);
    window.addEventListener("focus", loadRooms);
    
    return () => {
      window.removeEventListener("storage", loadRooms);
      window.removeEventListener("focus", loadRooms);
    };
  }, []);

  const getTimeAgo = (dateString?: string) => {
    if (!dateString) return "";
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return "방금 전";
    if (diffMins < 60) return `${diffMins}분 전`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}시간 전`;
    return `${Math.floor(diffHours / 24)}일 전`;
  };
const sortedRooms = [...chatRooms].sort((a, b) => {
  const timeA = new Date(a.lastMessageTime || a.createdAt).getTime();
  const timeB = new Date(b.lastMessageTime || b.createdAt).getTime();
  return timeB - timeA; // 최신 순
});

const filteredRooms = sortedRooms.filter(room =>
  room.username.toLowerCase().includes(searchQuery.toLowerCase())
);

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
        {chatRooms.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
            <p>채팅방이 없습니다</p>
            <p className="text-sm mt-2">게시판에서 친구를 추가하고 채팅을 시작해보세요</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {sortedRooms.map((room) => (
              <button
                key={room.id}
                onClick={() => navigate(`/chat/${room.username}?user=${room.username}&board=${encodeURIComponent(room.board)}`)}
                className="w-full px-4 py-4 flex items-center gap-3 hover:bg-accent transition-colors text-left"
              >
                <Avatar className="w-12 h-12">
                  <AvatarImage src="" />
                  <AvatarFallback>{room.username.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-semibold text-foreground">{room.username}</h3>
                    <span className="text-xs text-muted-foreground">
                      {getTimeAgo(room.lastMessageTime || room.createdAt)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground truncate">
                      {room.lastMessage || `${room.board} 글에서 보낸 사용자`}
                    </p>
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
        )}
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
              {filteredRooms.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">검색 결과가 없습니다</p>
              ) : (
                filteredRooms.map((room) => (
                  <button
                    key={room.id}
                    onClick={() => {
                      navigate(`/chat/${room.username}?user=${room.username}&board=${encodeURIComponent(room.board)}`);
                      setSearchOpen(false);
                    }}
                    className="w-full p-4 flex items-center gap-3 hover:bg-accent rounded-lg transition-colors text-left"
                  >
                    <Avatar className="w-12 h-12">
                      <AvatarImage src="" />
                      <AvatarFallback>{room.username.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-medium text-foreground">{room.username}</h3>
                      <p className="text-xs text-muted-foreground">{room.board}</p>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <BottomNav />
    </div>
  );
};

export default Chatting;
