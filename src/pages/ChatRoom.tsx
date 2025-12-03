
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ChevronLeft, Plus, Search, Settings, Smile, ThumbsUp, Send } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { getOrCreateChatRoom, addMessageToRoom, ChatMessage } from "@/lib/chatstore";

const ChatRoom = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  
  const username = searchParams.get("user") || "Unknown";
  const board = searchParams.get("board") || "";

  useEffect(() => {
    if (username && board) {
      const room = getOrCreateChatRoom(username, board);
      setMessages(room.messages);
    }
  }, [username, board]);

  const handleSend = () => {
    if (message.trim() && username) {
      const newMessage: ChatMessage = {
        id: Date.now(),
        sender: "나",
        text: message,
        time: new Date().toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" }),
        isMine: true,
      };
      
      addMessageToRoom(username, newMessage);
      setMessages(prev => [...prev, newMessage]);
      setMessage("");
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 bg-background border-b border-border z-40">
        <div className="max-w-screen-xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/chatting")}
              className="p-2 hover:bg-accent rounded-full transition-colors"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <Avatar className="w-10 h-10">
              <AvatarImage src="" />
              <AvatarFallback>{username.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <h1 className="text-lg font-semibold">{username}</h1>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 hover:bg-accent rounded-full transition-colors">
              <Plus className="w-6 h-6" />
            </button>
            <button className="p-2 hover:bg-accent rounded-full transition-colors">
              <Search className="w-6 h-6" />
            </button>
            <button className="p-2 hover:bg-accent rounded-full transition-colors">
              <Settings className="w-6 h-6" />
            </button>
          </div>
        </div>
      </header>

      {/* Messages */}
      <main className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-screen-xl mx-auto space-y-4">
          {messages.length === 0 && (
            <div className="text-center text-muted-foreground py-10">
              <p>{board} 글에서 시작된 채팅입니다</p>
              <p className="text-sm mt-2">첫 메시지를 보내보세요!</p>
            </div>
          )}
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-2 ${msg.isMine ? "flex-row-reverse" : "flex-row"}`}
            >
              {!msg.isMine && (
                <Avatar className="w-10 h-10">
                  <AvatarImage src="" />
                  <AvatarFallback>{msg.sender.charAt(0)}</AvatarFallback>
                </Avatar>
              )}
              <div className={`flex flex-col ${msg.isMine ? "items-end" : "items-start"}`}>
                <div
                  className={`max-w-xs px-4 py-2 rounded-2xl ${
                    msg.isMine
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-foreground"
                  }`}
                >
                  <p className="text-sm">{msg.text}</p>
                </div>
                <span className="text-xs text-muted-foreground mt-1">{msg.time}</span>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Input Area */}
      <div className="sticky bottom-0 bg-background border-t border-border">
        <div className="max-w-screen-xl mx-auto px-4 py-3">
          <div className="flex items-center gap-2">
            <button className="p-2 hover:bg-accent rounded-full transition-colors">
              <Plus className="w-6 h-6 text-muted-foreground" />
            </button>
            <div className="flex-1 flex items-center gap-2 bg-muted rounded-full px-4 py-2">
              <Input
                placeholder="Aa"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSend()}
                className="flex-1 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 p-0"
              />
              <button className="p-1 hover:bg-accent rounded-full transition-colors">
                <Smile className="w-5 h-5 text-primary" />
              </button>
            </div>
            {message.trim() ? (
              <button
                onClick={handleSend}
                className="p-2 hover:bg-accent rounded-full transition-colors"
              >
                <Send className="w-6 h-6 text-primary" />
              </button>
            ) : (
              <button className="p-2 hover:bg-accent rounded-full transition-colors">
                <ThumbsUp className="w-6 h-6 text-primary" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatRoom;
