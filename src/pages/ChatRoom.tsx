import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Send, Plus, MessageCircle, User, Users } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { getMessages, sendMessage as sendMessageApi, updateReadStatus, getChatRoomDetail } from "@/lib/api/chat"; // 🔥 getChatRoomDetail 추가
import { ChatMessage, MessageType, ChatRoomDetail } from "@/types/chat"; // 🔥 ChatRoomDetail 추가
import { getWebSocketClient } from "@/lib/websocket";
import { jwtDecode } from "jwt-decode";
import BottomNav from "@/components/BottomNav";
import EmptyState from "@/components/EmptyState";

interface JwtPayload {
  sub: string;
  role: string;
  tokenType: string;
}

const ChatRoom = () => {
  const navigate = useNavigate();
  const { roomId } = useParams();
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [roomDetail, setRoomDetail] = useState<ChatRoomDetail | null>(null); // 🔥 추가
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const wsClient = useRef(getWebSocketClient());

  const getCurrentUserId = (): number => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      toast.error('로그인이 필요합니다.');
      navigate('/login');
      return 0;
    }

    try {
      const decoded = jwtDecode<JwtPayload>(token);
      return parseInt(decoded.sub);
    } catch (error) {
      toast.error('인증 오류가 발생했습니다.');
      navigate('/login');
      return 0;
    }
  };

  const currentUserId = getCurrentUserId();

  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  // 🔥 채팅방 정보 로드
  const loadRoomDetail = async () => {
    if (!roomId) return;

    try {
      const detail = await getChatRoomDetail(parseInt(roomId));
      setRoomDetail(detail);
    } catch (error) {
      console.error('Failed to load room detail:', error);
    }
  };

  // 🔥 발신자 이름 가져오기
  const getSenderName = (senderId: number): string => {
    if (!roomDetail) return '사용자';
    
    const member = roomDetail.members?.find(m => m.userId === senderId);
    return member?.username || '사용자';
  };

  // 메시지 목록 로드 및 읽음 처리
  const loadMessages = async () => {
    if (!roomId) return;

    try {
      setLoading(true);
      const response = await getMessages(parseInt(roomId));
      setMessages(response.messages);

      setTimeout(() => {
        scrollToBottom('auto');
        setIsInitialLoad(false);
      }, 100);

      // 읽음 처리: 메시지가 있으면 마지막 메시지를 읽음으로 표시
      if (response.messages.length > 0) {
        const lastMessage = response.messages[response.messages.length - 1];

        try {
          await updateReadStatus(parseInt(roomId), {
            lastReadMessageId: lastMessage.messageId
          });
        } catch (error) {
          // 읽음 처리 실패는 조용히 처리
        }
      }
    } catch (error) {
      console.error('Failed to load messages:', error);
      toast.error('메시지를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // WebSocket 구독
  useEffect(() => {
    if (!roomId) return;

    setIsInitialLoad(true);
    loadRoomDetail(); // 🔥 채팅방 정보 로드
    loadMessages();

    const client = wsClient.current;
    const roomIdNum = parseInt(roomId || '0');

    client.connect().then(() => {
      client.subscribe(roomIdNum, (newMessage: ChatMessage) => {
        setMessages(prev => [...prev, newMessage]);

        // 새 메시지 수신 시 자동 읽음 처리
        updateReadStatus(roomIdNum, { lastReadMessageId: newMessage.messageId })
          .catch(() => {
            // 읽음 처리 실패는 조용히 처리
          });
      });
    });

    return () => {
      client.unsubscribe(roomIdNum);
    };
  }, [roomId]);

  // 새 메시지 추가 시 부드럽게 스크롤 (초기 로드 제외)
  useEffect(() => {
    if (!isInitialLoad && messages.length > 0) {
      scrollToBottom('smooth');
    }
  }, [messages, isInitialLoad]);

  const handleSend = async () => {
    if (!message.trim() || !roomId || sending) return;

    try {
      setSending(true);
      await sendMessageApi(parseInt(roomId), {
        messageType: MessageType.TEXT,
        content: message.trim(),
        fileUrl: null,
      });

      setMessage("");
    } catch (error) {
      console.error('Failed to send message:', error);
      toast.error('메시지 전송에 실패했습니다.');
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-muted-foreground">로딩 중...</div>
      </div>
    );
  }

  if (!currentUserId) {
    return null;
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header - 🔥 채팅방 이름 표시 */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-xl border-b border-gray-100 px-6 py-4">
        <div className="flex items-center gap-4 max-w-screen-xl mx-auto">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors -ml-2"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <Avatar className="w-10 h-10 flex-shrink-0 ring-2 ring-gray-100">
              <AvatarFallback className="bg-gradient-to-br from-gray-100 to-gray-200">
                {roomDetail?.roomType === 'GROUP' ? (
                  <Users className="w-5 h-5 text-gray-500" />
                ) : (
                  <User className="w-5 h-5 text-gray-500" />
                )}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <h1 className="font-semibold text-gray-900 truncate">
                {roomDetail?.name || `채팅방 ${roomId}`}
              </h1>
              <p className="text-xs text-gray-500">
                {roomDetail?.members ? `${roomDetail.members.length}명` : '온라인'}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Messages - 🔥 발신자 이름 표시 */}
      <div 
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto px-4 py-6 space-y-3 pb-32"
      >
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full min-h-[60vh]">
            <EmptyState 
              icon={MessageCircle}
              message="아직 메시지가 없습니다"
              description="첫 메시지를 보내 대화를 시작해보세요"
            />
          </div>
        ) : (
          messages.map((msg, index) => {
            const isMine = msg.senderId === currentUserId;
            const prevMsg = index > 0 ? messages[index - 1] : null;
            const showSenderName = !isMine && (prevMsg?.senderId !== msg.senderId);

            return (
              <div
                key={msg.messageId}
                className={`flex gap-2.5 ${isMine ? 'flex-row-reverse' : 'flex-row'}`}
              >
                {!isMine && (
                  <Avatar className="w-8 h-8 flex-shrink-0 ring-1 ring-gray-100">
                    <AvatarFallback className="bg-gradient-to-br from-gray-100 to-gray-200">
                      <User className="w-4 h-4 text-gray-500" />
                    </AvatarFallback>
                  </Avatar>
                )}

                <div className={`flex flex-col gap-1 ${isMine ? 'items-end' : 'items-start'} max-w-[75%]`}>
                  {/* 🔥 발신자 이름 (연속된 메시지가 아닐 때만 표시) */}
                  {showSenderName && (
                    <span className="text-xs text-gray-500 font-medium px-1">
                      {getSenderName(msg.senderId)}
                    </span>
                  )}
                  
                  <div
                    className={`rounded-2xl px-4 py-2.5 shadow-sm ${
                      isMine
                        ? 'bg-purple-500 text-white rounded-br-sm'
                        : 'bg-white text-gray-900 rounded-bl-sm border border-gray-100'
                    }`}
                  >
                    {msg.messageType === MessageType.TEXT && (
                      <p className="text-[15px] leading-relaxed whitespace-pre-wrap break-words">
                        {msg.content}
                      </p>
                    )}
                    {msg.messageType === MessageType.IMAGE && msg.fileUrl && (
                      <img
                        src={msg.fileUrl}
                        alt="Uploaded"
                        className="max-w-full rounded-lg"
                      />
                    )}
                  </div>
                  <span className="text-[11px] text-gray-400 px-1">
                    {formatTime(msg.createdAt)}
                  </span>
                </div>
              </div>
            );
          })
        )}
        {/* 스크롤 타겟 */}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="fixed bottom-[72px] left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-gray-100 px-4 py-3 z-40">
        <div className="max-w-screen-xl mx-auto flex items-center gap-2">
          <button className="p-2.5 hover:bg-gray-100 rounded-full transition-colors text-gray-500 hover:text-gray-700">
            <Plus className="w-5 h-5" />
          </button>
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="메시지를 입력하세요..."
            className="flex-1 bg-gray-50 border-gray-200 focus-visible:ring-purple-500 focus-visible:ring-2 rounded-full px-4 h-11"
            disabled={sending}
          />
          <Button
            onClick={handleSend}
            disabled={!message.trim() || sending}
            size="icon"
            className="shrink-0 w-11 h-11 rounded-full bg-purple-500 hover:bg-purple-600 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Send className="w-5 h-5" />
          </Button>
        </div>
      </div>
      <BottomNav />
    </div>
  );
};

export default ChatRoom;