import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Plus, Settings, MessageCircle, X, User, Users, EyeOff, Eye } from "lucide-react";
import { useLocation } from "react-router-dom";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import EmptyState from "@/components/EmptyState";
import BottomNav from "@/components/BottomNav";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { getChatRoomList, createChatRoom } from "@/lib/api/chat";
import { ChatRoomSummary, RoomType } from "@/types/chat";

const Chatting = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchOpen, setSearchOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [chatRooms, setChatRooms] = useState<ChatRoomSummary[]>([]);
  const [allChatRooms, setAllChatRooms] = useState<ChatRoomSummary[]>([]); // 전체 채팅방 목록 (숨겨진 것 포함)
  const [loading, setLoading] = useState(true);
  const [hiddenRoomsDialogOpen, setHiddenRoomsDialogOpen] = useState(false);

  const handleLogoClick = () => {
    const accessToken = localStorage.getItem('accessToken');
    if (accessToken) {
      navigate("/");
    } else {
      navigate("/auth");
    }
  };
  
  // 숨겨진 채팅방 ID 목록 (로컬 스토리지에 저장)
  const getHiddenRoomIds = (): number[] => {
    const hidden = localStorage.getItem('hiddenChatRooms');
    return hidden ? JSON.parse(hidden) : [];
  };
  
  const setHiddenRoomIds = (ids: number[]) => {
    localStorage.setItem('hiddenChatRooms', JSON.stringify(ids));
  };

  // 채팅방 생성 폼
  const [roomName, setRoomName] = useState("");
  const [roomType, setRoomType] = useState<RoomType>(RoomType.GROUP);
  const [memberIds, setMemberIds] = useState("");

  // 채팅방 목록 로드
  const loadChatRooms = async () => {
    try {
      setLoading(true);
      const response = await getChatRoomList();
      const hiddenIds = getHiddenRoomIds();
      // 전체 목록 저장
      setAllChatRooms(response.rooms);
      // 숨겨진 채팅방 제외
      const visibleRooms = response.rooms.filter(room => !hiddenIds.includes(room.roomId));
      setChatRooms(visibleRooms);
    } catch (error) {
      console.error('Failed to load chat rooms:', error);
      toast.error('채팅방 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadChatRooms();
  }, []);

  // 채팅방 숨기기 (프론트엔드만)
  const handleHideChatRoom = (roomId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    
    // 숨겨진 목록에 추가
    const hiddenIds = getHiddenRoomIds();
    if (!hiddenIds.includes(roomId)) {
      hiddenIds.push(roomId);
      setHiddenRoomIds(hiddenIds);
    }
    
    // 목록에서 제거
    setChatRooms(prev => prev.filter(room => room.roomId !== roomId));
    toast.success('채팅방이 숨겨졌습니다.');
  };

  // 숨긴 채팅방 다시 보이기
  const handleUnhideChatRoom = async (roomId: number) => {
    const hiddenIds = getHiddenRoomIds();
    const updatedIds = hiddenIds.filter(id => id !== roomId);
    setHiddenRoomIds(updatedIds);
    
    // 목록 다시 로드하여 최신 상태로 업데이트
    try {
      const response = await getChatRoomList();
      const newHiddenIds = getHiddenRoomIds();
      setAllChatRooms(response.rooms);
      const visibleRooms = response.rooms.filter(room => !newHiddenIds.includes(room.roomId));
      setChatRooms(visibleRooms);
      toast.success('채팅방이 다시 표시됩니다.');
    } catch (error) {
      console.error('Failed to reload chat rooms:', error);
      toast.error('채팅방 목록을 불러오는데 실패했습니다.');
    }
  };

  // 숨겨진 채팅방 목록 가져오기
  const getHiddenRooms = (): ChatRoomSummary[] => {
    const hiddenIds = getHiddenRoomIds();
    return allChatRooms.filter(room => hiddenIds.includes(room.roomId));
  };

  // 채팅방 생성
  const handleCreateChatRoom = async () => {
    if (roomType === RoomType.GROUP && !roomName.trim()) {
      toast.error('그룹 채팅방 이름을 입력하세요.');
      return;
    }

    if (!memberIds.trim()) {
      toast.error('초대할 사용자 ID를 입력하세요.');
      return;
    }

    try {
      const memberIdList = memberIds
        .split(',')
        .map(id => parseInt(id.trim()))
        .filter(id => !isNaN(id));

      if (memberIdList.length === 0) {
        toast.error('유효한 사용자 ID를 입력하세요.');
        return;
      }

      await createChatRoom({
        roomType,
        name: roomType === RoomType.GROUP ? roomName : null,
        memberIds: memberIdList,
      });

      toast.success('채팅방이 생성되었습니다.');
      setCreateOpen(false);
      setRoomName("");
      setMemberIds("");
      loadChatRooms();
    } catch (error) {
      console.error('Failed to create chat room:', error);
      toast.error('채팅방 생성에 실패했습니다.');
    }
  };

  // 시간 포맷팅
  const formatTime = (dateString: string | null) => {
    if (!dateString) return '';

    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return '방금 전';
    if (diffInMinutes < 60) return `${diffInMinutes}분 전`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}시간 전`;

    return `${date.getMonth() + 1}월 ${date.getDate()}일`;
  };

  // 검색 필터링
  const searchResults = chatRooms.filter(room => {
    const searchLower = searchQuery.toLowerCase();
    return (
      room.name?.toLowerCase().includes(searchLower) ||
      room.lastMessage?.toLowerCase().includes(searchLower)
    );
  });

  const renderDefaultAvatar = (room: ChatRoomSummary) => {
    if (room.roomType === RoomType.GROUP) {
      return (
        <Avatar className="w-12 h-12 ring-1 ring-gray-100 group-hover:ring-gray-200 transition-all duration-200">
          <AvatarFallback className="bg-gradient-to-br from-purple-400 to-purple-500 text-white">
            <Users className="w-6 h-6" />
          </AvatarFallback>
        </Avatar>
      );
    } else {
      return (
        <Avatar className="w-12 h-12 ring-1 ring-gray-100 group-hover:ring-gray-200 transition-all duration-200">
          <AvatarFallback className="bg-gradient-to-br from-gray-300 to-gray-400 text-white">
            <User className="w-6 h-6" />
          </AvatarFallback>
        </Avatar>
      );
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background border-b border-border px-6 py-4">
        <div className="flex items-center justify-between max-w-screen-xl mx-auto">
          <div className="flex items-center gap-4">
            <h1 
              className="text-2xl font-bold text-foreground cursor-pointer" 
              onClick={handleLogoClick} 
              style={{ fontFamily: '"Stereofidelic", sans-serif' }}
            >
              BANDCHU
            </h1>
            <span className="text-lg font-semibold text-muted-foreground">채팅</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setCreateOpen(true)}
              className="p-2 hover:bg-accent rounded-full transition-colors"
              aria-label="새 채팅방 만들기"
            >
              <Plus className="w-6 h-6" />
            </button>
            <button
              onClick={() => setSearchOpen(true)}
              className="p-2 hover:bg-accent rounded-full transition-colors"
              aria-label="채팅방 검색"
            >
              <Search className="w-6 h-6" />
            </button>
            <button 
              onClick={() => setHiddenRoomsDialogOpen(true)}
              className="p-2 hover:bg-accent rounded-full transition-colors relative"
              aria-label="설정"
            >
              <Settings className="w-6 h-6" />
              {getHiddenRoomIds().length > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-purple-500 rounded-full"></span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Chat List */}
      <div className="max-w-screen-xl mx-auto">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <p className="text-muted-foreground">로딩 중...</p>
          </div>
        ) : chatRooms.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-4">
            <EmptyState 
              icon={MessageCircle}
              message="아직 채팅방이 없습니다"
              description="새로운 대화를 시작해보세요"
            />
            <Button onClick={() => setCreateOpen(true)} className="mt-6">
              <Plus className="w-4 h-4 mr-2" />
              새 채팅 시작하기
            </Button>
          </div>
        ) : (
          searchResults.map((room) => (
            <div
              key={room.roomId}
              className="group flex items-center gap-4 p-4 hover:bg-purple-100/60 active:bg-purple-200/60 cursor-pointer transition-all duration-200 border-b border-gray-100/80 relative rounded-lg mx-2 my-0.5 hover:shadow-sm"
            >
              <div
                onClick={() => navigate(`/chat/${room.roomId}`)}
                className="flex items-center gap-4 flex-1 min-w-0"
              >
                {renderDefaultAvatar(room)}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-semibold truncate text-gray-900 group-hover:text-purple-700 transition-colors duration-200">
                      {room.name || `채팅방 ${room.roomId}`}
                    </h3>
                    <span className="text-xs text-gray-400 group-hover:text-gray-500 ml-2 whitespace-nowrap transition-colors duration-200">
                      {formatTime(room.updatedAt)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 truncate group-hover:text-gray-700 transition-colors duration-200">
                    {room.lastMessage || '메시지가 없습니다'}
                  </p>
                </div>
                {room.unreadCount > 0 && (
                  <div className="bg-purple-500 text-white text-xs font-semibold rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0 shadow-sm group-hover:bg-purple-600 transition-colors duration-200">
                    {room.unreadCount}
                  </div>
                )}
              </div>
              <button
                onClick={(e) => handleHideChatRoom(room.roomId, e)}
                className="opacity-0 group-hover:opacity-100 transition-all duration-200 p-2.5 hover:bg-purple-100 rounded-lg text-gray-500 hover:text-purple-600 flex-shrink-0 active:scale-95 hover:shadow-sm"
                aria-label="채팅방 숨기기"
              >
                <EyeOff className="w-5 h-5" />
              </button>
            </div>
          ))
        )}
      </div>

      {/* Search Dialog */}
      <Dialog open={searchOpen} onOpenChange={setSearchOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>채팅 검색</DialogTitle>
          </DialogHeader>
          <Input
            placeholder="채팅방 또는 메시지 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="mb-4"
          />
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {searchResults.map((room) => (
              <div
                key={room.roomId}
                onClick={() => {
                  navigate(`/chatting/${room.roomId}`);
                  setSearchOpen(false);
                }}
                className="p-3 hover:bg-accent rounded-lg cursor-pointer transition-colors"
              >
                <h4 className="font-medium">{room.name || `채팅방 ${room.roomId}`}</h4>
                <p className="text-sm text-muted-foreground truncate">
                  {room.lastMessage || '메시지가 없습니다'}
                </p>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Chat Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>새 채팅방 만들기</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="chatType">채팅 타입</Label>
              <Select
                value={roomType}
                onValueChange={(value) => setRoomType(value as RoomType)}
              >
                <SelectTrigger id="chatType">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={RoomType.DIRECT}>1:1 채팅</SelectItem>
                  <SelectItem value={RoomType.GROUP}>그룹 채팅</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {roomType === RoomType.GROUP && (
              <div>
                <Label htmlFor="roomName">채팅방 이름</Label>
                <Input
                  id="roomName"
                  value={roomName}
                  onChange={(e) => setRoomName(e.target.value)}
                  placeholder="채팅방 이름을 입력하세요"
                />
              </div>
            )}

            <div>
              <Label htmlFor="memberIds">초대할 사용자 ID</Label>
              <Input
                id="memberIds"
                value={memberIds}
                onChange={(e) => setMemberIds(e.target.value)}
                placeholder="예: 2, 3, 4 (쉼표로 구분)"
              />
              <p className="text-xs text-muted-foreground mt-1">
                초대할 사용자의 ID를 쉼표로 구분하여 입력하세요
              </p>
            </div>

            <Button onClick={handleCreateChatRoom} className="w-full">
              채팅방 만들기
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* 숨긴 채팅방 관리 다이얼로그 */}
      <Dialog open={hiddenRoomsDialogOpen} onOpenChange={setHiddenRoomsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <EyeOff className="w-5 h-5 text-gray-500" />
              숨긴 채팅방
            </DialogTitle>
          </DialogHeader>
          <div className="max-h-96 overflow-y-auto">
            {getHiddenRooms().length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Eye className="w-12 h-12 text-gray-300 mb-3" />
                <p className="text-sm text-gray-500">숨긴 채팅방이 없습니다</p>
              </div>
            ) : (
              <div className="space-y-2">
                {getHiddenRooms().map((room) => (
                  <div
                    key={room.roomId}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    {renderDefaultAvatar(room)}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-sm truncate">
                        {room.name || `채팅방 ${room.roomId}`}
                      </h4>
                      <p className="text-xs text-gray-500 truncate">
                        {room.lastMessage || '메시지가 없습니다'}
                      </p>
                    </div>
                    <Button
                      onClick={() => handleUnhideChatRoom(room.roomId)}
                      variant="outline"
                      size="sm"
                      className="flex-shrink-0"
                    >
                      <Eye className="w-4 h-4 mr-1.5" />
                      다시 보기
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <BottomNav />
    </div>
  );
};

export default Chatting;