import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Plus, Settings, MessageCircle, User, Users, EyeOff, Eye } from "lucide-react";
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
  const [allChatRooms, setAllChatRooms] = useState<ChatRoomSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [hiddenRoomsDialogOpen, setHiddenRoomsDialogOpen] = useState(false);

  const handleLogoClick = () => {
    const accessToken = localStorage.getItem("accessToken");
    navigate(accessToken ? "/" : "/auth");
  };

  // 숨긴 채팅방 ID 관리
  const getHiddenRoomIds = (): number[] => {
    const hidden = localStorage.getItem("hiddenChatRooms");
    return hidden ? JSON.parse(hidden) : [];
  };

  const setHiddenRoomIds = (ids: number[]) => {
    localStorage.setItem("hiddenChatRooms", JSON.stringify(ids));
  };

  // 채팅방 생성 폼
  const [roomName, setRoomName] = useState("");
  const [roomType, setRoomType] = useState<RoomType>(RoomType.GROUP);
  const [memberIds, setMemberIds] = useState("");

  // 🚀 채팅방 불러오기
  const loadChatRooms = async () => {
    try {
      setLoading(true);
      const response = await getChatRoomList();
      const hiddenIds = getHiddenRoomIds();

      setAllChatRooms(response.rooms);
      setChatRooms(response.rooms.filter(room => !hiddenIds.includes(room.roomId)));
    } catch (error) {
      toast.error("채팅방 목록을 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadChatRooms();
  }, []);

  // 채팅방 숨김
  const handleHideChatRoom = (roomId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const hiddenIds = getHiddenRoomIds();

    if (!hiddenIds.includes(roomId)) {
      hiddenIds.push(roomId);
      setHiddenRoomIds(hiddenIds);
    }
    setChatRooms(prev => prev.filter(room => room.roomId !== roomId));
  };

  // 숨긴 채팅방 복구
  const handleUnhideChatRoom = async (roomId: number) => {
    const newIds = getHiddenRoomIds().filter(id => id !== roomId);
    setHiddenRoomIds(newIds);
    loadChatRooms();
  };

  const getHiddenRooms = () => {
    const hiddenIds = getHiddenRoomIds();
    return allChatRooms.filter(room => hiddenIds.includes(room.roomId));
  };

  // 채팅방 생성 API
const handleCreateChatRoom = async () => {
  if (roomType === RoomType.GROUP && !roomName.trim()) {
    toast.error("채팅방 이름을 입력하세요");
    return;
  }
  if (!memberIds.trim()) {
    toast.error("사용자 ID를 입력하세요");
    return;
  }

  try {
    const ids = memberIds
      .split(",")
      .map(id => parseInt(id.trim()))
      .filter(id => !isNaN(id));

    const room = await createChatRoom({
      roomType,
      name: roomType === RoomType.GROUP ? roomName : null,
      memberIds: ids,
    });

    if (!room?.roomId || isNaN(room.roomId)) {
      console.error("유효하지 않은 응답:", room);
      toast.error("채팅방 정보를 불러올 수 없습니다");
      return;
    }

    toast.success("채팅방으로 이동합니다");
    setCreateOpen(false);
    setRoomName("");
    setMemberIds("");
    
    navigate(`/chatrooms/${room.roomId}`);    
  } catch (err) {
    console.error("채팅방 생성 실패:", err);
    toast.error("채팅방 생성 실패");
  }
};

  // 시간 포맷팅
  const formatTime = (dateString: string | null) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 60000);

    if (diff < 1) return "방금 전";
    if (diff < 60) return `${diff}분 전`;
    if (diff < 1440) return `${Math.floor(diff / 60)}시간 전`;

    return `${date.getMonth() + 1}월 ${date.getDate()}일`;
  };

  // ⭐ 검색 필터링
  const searchResults = chatRooms.filter(room => {
    const q = searchQuery.toLowerCase();
    return (
      room.name?.toLowerCase().includes(q) ||
      room.lastMessage?.toLowerCase().includes(q)
    );
  });

  // ⭐ 최신 순 정렬
  const sortedRooms = [...searchResults].sort((a, b) => {
    const timeA = new Date(a.updatedAt).getTime();
    const timeB = new Date(b.updatedAt).getTime();
    return timeB - timeA;
  });

  // 기본 아바타
  const renderDefaultAvatar = (room: ChatRoomSummary) => (
    <Avatar className="w-12 h-12 ring-1 ring-primary/10">
      <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
        {room.roomType === RoomType.GROUP ? <Users className="w-5 h-5" /> : <User className="w-5 h-5" />}
      </AvatarFallback>
    </Avatar>
  );

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* HEADER */}
      <header className="sticky top-0 z-50 bg-background border-b border-border px-6 py-4">
        <div className="flex items-center justify-between max-w-screen-xl mx-auto">
          <div className="flex items-center gap-4">
            <h1
              className="text-2xl font-bold cursor-pointer"
              onClick={handleLogoClick}
              style={{ fontFamily: '"Stereofidelic", sans-serif' }}
            >
              BANDCHU
            </h1>
            <span className="text-lg text-muted-foreground">채팅</span>
          </div>

          <div className="flex items-center gap-3">
            <button onClick={() => setCreateOpen(true)}>
              <Plus className="w-6 h-6" />
            </button>

            <button onClick={() => setSearchOpen(true)}>
              <Search className="w-6 h-6" />
            </button>

            <button onClick={() => setHiddenRoomsDialogOpen(true)}>
              <Settings className="w-6 h-6" />
              {getHiddenRoomIds().length > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-purple-500 rounded-full"></span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* LIST */}
      <div className="max-w-screen-xl mx-auto px-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin mb-3"></div>
            <p className="text-sm text-muted-foreground">로딩 중...</p>
          </div>
        ) : sortedRooms.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-4">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-5">
              <MessageCircle className="w-10 h-10 text-primary" />
            </div>
            <p className="text-lg font-semibold text-foreground mb-1.5">아직 채팅방이 없습니다</p>
            <p className="text-sm text-muted-foreground text-center mb-6">
              새로운 대화를 시작해보세요
            </p>
            <Button 
              onClick={() => setCreateOpen(true)} 
              className="h-10 px-5 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm text-sm font-medium"
            >
              <Plus className="w-4 h-4 mr-1.5" />
              새 채팅 시작하기
            </Button>
          </div>
        ) : (
          <div className="space-y-1.5 pt-3">
            {sortedRooms.map(room => (
              <div
                key={room.roomId}
                className="group flex items-center gap-3 p-4 rounded-xl border border-border/50 bg-card hover:bg-primary/3 hover:border-primary/30 cursor-pointer transition-all duration-150 shadow-sm hover:shadow-md"
              >
                <div
                  className="flex items-center gap-3 flex-1 min-w-0"
                  onClick={() => navigate(`/chat/${room.roomId}`)}
                >
                  {renderDefaultAvatar(room)}

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold text-base text-foreground truncate">
                        {room.name || `채팅방 ${room.roomId}`}
                      </h3>
                      <span className="text-xs text-muted-foreground shrink-0 ml-2">
                        {formatTime(room.updatedAt)}
                      </span>
                    </div>

                    <p className="text-sm text-muted-foreground truncate">
                      {room.lastMessage || "메시지가 없습니다"}
                    </p>
                  </div>
                </div>

                {/* 숨기기 버튼 */}
                <button
                  onClick={e => handleHideChatRoom(room.roomId, e)}
                  className="opacity-0 group-hover:opacity-100 transition-all p-1.5 hover:bg-muted/50 rounded-lg shrink-0"
                >
                  <EyeOff className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ----- SEARCH DIALOG ----- */}
      <Dialog open={searchOpen} onOpenChange={setSearchOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">채팅 검색</DialogTitle>
          </DialogHeader>

          <Input
            placeholder="채팅방 또는 메시지 검색"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="h-10 text-sm"
          />

          <div className="mt-4 space-y-1.5 max-h-72 overflow-y-auto">
            {sortedRooms.length === 0 ? (
              <p className="text-center text-muted-foreground py-8 text-sm">
                검색 결과가 없습니다
              </p>
            ) : (
              sortedRooms.map(room => (
                <div
                  key={room.roomId}
                  onClick={() => {
                    navigate(`/chat/${room.roomId}`);
                    setSearchOpen(false);
                  }}
                  className="p-3 hover:bg-primary/5 rounded-lg cursor-pointer transition-colors duration-150"
                >
                  <h4 className="font-semibold text-sm mb-0.5">{room.name || `채팅방 ${room.roomId}`}</h4>
                  <p className="text-xs text-muted-foreground truncate">
                    {room.lastMessage || "메시지가 없습니다"}
                  </p>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* ----- CREATE CHAT ROOM DIALOG ----- */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">새 채팅방 만들기</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="roomType" className="text-sm font-medium mb-1.5 block">채팅방 유형</Label>
              <Select
                value={roomType}
                onValueChange={(value) => setRoomType(value as RoomType)}
              >
                <SelectTrigger className="h-10 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={RoomType.GROUP} className="text-sm">그룹 채팅</SelectItem>
                  <SelectItem value={RoomType.DIRECT} className="text-sm">1:1 채팅</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {roomType === RoomType.GROUP && (
              <div>
                <Label htmlFor="roomName" className="text-sm font-medium mb-1.5 block">채팅방 이름</Label>
                <Input
                  id="roomName"
                  placeholder="채팅방 이름을 입력하세요"
                  value={roomName}
                  onChange={(e) => setRoomName(e.target.value)}
                  className="h-10 text-sm"
                />
              </div>
            )}

            <div>
              <Label htmlFor="memberIds" className="text-sm font-medium mb-1.5 block">사용자 ID (쉼표로 구분)</Label>
              <Input
                id="memberIds"
                placeholder="예: 1, 2, 3"
                value={memberIds}
                onChange={(e) => setMemberIds(e.target.value)}
                className="h-10 text-sm"
              />
            </div>

            <Button 
              onClick={handleCreateChatRoom} 
              className="w-full h-10 text-sm font-medium bg-primary hover:bg-primary/90 shadow-sm"
            >
              채팅방 생성
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ----- HIDDEN ROOMS DIALOG ----- */}
      <Dialog open={hiddenRoomsDialogOpen} onOpenChange={setHiddenRoomsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">숨긴 채팅방</DialogTitle>
          </DialogHeader>

          <div className="mt-4 space-y-1.5 max-h-72 overflow-y-auto">
            {getHiddenRooms().length === 0 ? (
              <p className="text-center text-muted-foreground py-8 text-sm">
                숨긴 채팅방이 없습니다
              </p>
            ) : (
              getHiddenRooms().map(room => (
                <div
                  key={room.roomId}
                  className="flex items-center justify-between p-3 hover:bg-primary/5 rounded-lg transition-colors duration-150"
                >
                  <div
                    className="flex-1 cursor-pointer min-w-0"
                    onClick={() => {
                      navigate(`/chat/${room.roomId}`);
                      setHiddenRoomsDialogOpen(false);
                    }}
                  >
                    <h4 className="font-semibold text-sm mb-0.5">{room.name || `채팅방 ${room.roomId}`}</h4>
                    <p className="text-xs text-muted-foreground truncate">
                      {room.lastMessage || "메시지가 없습니다"}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleUnhideChatRoom(room.roomId)}
                    className="shrink-0 ml-2 h-8 w-8 p-0 hover:bg-primary/10"
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>

      <BottomNav />
    </div>
  );
};

export default Chatting;
