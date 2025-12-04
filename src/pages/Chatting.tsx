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

  // UI modal states
  const [searchOpen, setSearchOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [hiddenRoomsDialogOpen, setHiddenRoomsDialogOpen] = useState(false);

  // Chat data
  const [chatRooms, setChatRooms] = useState<ChatRoomSummary[]>([]);
  const [allChatRooms, setAllChatRooms] = useState<ChatRoomSummary[]>([]);
  const [loading, setLoading] = useState(true);

  // Search field
  const [searchQuery, setSearchQuery] = useState("");

  // Create chat form
  const [roomName, setRoomName] = useState("");
  const [roomType, setRoomType] = useState<RoomType>(RoomType.GROUP);
  const [memberIds, setMemberIds] = useState("");

  const handleLogoClick = () => navigate("/");

  // Hidden rooms (localStorage)
  const getHiddenRoomIds = () => {
    const hidden = localStorage.getItem("hiddenChatRooms");
    return hidden ? JSON.parse(hidden) : [];
  };

  const setHiddenRoomIds = (ids: number[]) => {
    localStorage.setItem("hiddenChatRooms", JSON.stringify(ids));
  };

  // Load chatrooms
  const loadChatRooms = async () => {
    try {
      setLoading(true);
      const response = await getChatRoomList();

      const hiddenIds = getHiddenRoomIds();

      setAllChatRooms(response.rooms);
      setChatRooms(response.rooms.filter((r) => !hiddenIds.includes(r.roomId)));
    } catch (error) {
      toast.error("채팅방 목록을 불러오지 못했습니다.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadChatRooms();
  }, []);

  // Sort by latest update time
  const sortedRooms = [...chatRooms].sort((a, b) => {
    const timeA = new Date(a.updatedAt ?? a.createdAt).getTime();
    const timeB = new Date(b.updatedAt ?? b.createdAt).getTime();
    return timeB - timeA;
  });

  // Search logic
  const searchResults = sortedRooms.filter((room) => {
    const keyword = searchQuery.toLowerCase();
    return (
      room.name?.toLowerCase().includes(keyword) ||
      room.lastMessage?.toLowerCase().includes(keyword)
    );
  });

  // Render avatar
  const renderAvatar = (room: ChatRoomSummary) => {
    if (room.roomType === RoomType.GROUP) {
      return (
        <Avatar className="w-12 h-12">
          <AvatarFallback className="bg-purple-500 text-white">
            <Users className="w-6 h-6" />
          </AvatarFallback>
        </Avatar>
      );
    }
    return (
      <Avatar className="w-12 h-12">
        <AvatarFallback className="bg-gray-400 text-white">
          <User className="w-6 h-6" />
        </AvatarFallback>
      </Avatar>
    );
  };

  // Format time
  const formatTime = (timeString: string | null) => {
    if (!timeString) return "";
    const date = new Date(timeString);
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 60000);

    if (diff < 1) return "방금 전";
    if (diff < 60) return `${diff}분 전`;
    if (diff < 1440) return `${Math.floor(diff / 60)}시간 전`;

    return `${date.getMonth() + 1}월 ${date.getDate()}일`;
  };

  // Hide chatroom
  const handleHide = (roomId: number, e: React.MouseEvent) => {
    e.stopPropagation();

    const hidden = getHiddenRoomIds();
    if (!hidden.includes(roomId)) {
      setHiddenRoomIds([...hidden, roomId]);
    }

    setChatRooms((prev) => prev.filter((room) => room.roomId !== roomId));
    toast.success("채팅방을 숨겼습니다.");
  };

  // Get hidden rooms
  const hiddenRooms = allChatRooms.filter((r) =>
    getHiddenRoomIds().includes(r.roomId)
  );

  const unhideRoom = async (roomId: number) => {
    const updated = getHiddenRoomIds().filter((id) => id !== roomId);
    setHiddenRoomIds(updated);

    await loadChatRooms();
    toast.success("채팅방이 다시 표시됩니다.");
  };

  // Create chat-room
  const handleCreateChat = async () => {
    if (roomType === RoomType.GROUP && !roomName.trim()) {
      toast.error("그룹 이름을 입력하세요.");
      return;
    }
    if (!memberIds.trim()) {
      toast.error("초대할 사용자 ID를 입력하세요.");
      return;
    }

    try {
      const ids = memberIds
        .split(",")
        .map((x) => parseInt(x.trim()))
        .filter((x) => !isNaN(x));

      await createChatRoom({
        roomType,
        name: roomType === RoomType.GROUP ? roomName : null,
        memberIds: ids,
      });

      toast.success("채팅방이 생성되었습니다.");
      setCreateOpen(false);
      setRoomName("");
      setMemberIds("");
      loadChatRooms();
    } catch (error) {
      toast.error("채팅방 생성 실패");
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* HEADER */}
      <header className="sticky top-0 z-50 bg-background border-b px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1
            className="text-2xl font-bold cursor-pointer"
            onClick={handleLogoClick}
          >
            BANDCHU
          </h1>
          <span className="text-lg font-semibold text-muted-foreground">채팅</span>
        </div>

        <div className="flex items-center gap-3">
          <button className="p-2 hover:bg-accent rounded-full" onClick={() => setCreateOpen(true)}>
            <Plus className="w-6 h-6" />
          </button>
          <button className="p-2 hover:bg-accent rounded-full" onClick={() => setSearchOpen(true)}>
            <Search className="w-6 h-6" />
          </button>
          <button
            className="p-2 hover:bg-accent rounded-full relative"
            onClick={() => setHiddenRoomsDialogOpen(true)}
          >
            <Settings className="w-6 h-6" />
            {hiddenRooms.length > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-purple-500 rounded-full"></span>
            )}
          </button>
        </div>
      </header>

      {/* CHAT LIST */}
      <div className="max-w-screen-xl mx-auto">
        {loading ? (
          <div className="py-20 text-center text-muted-foreground">로딩 중...</div>
        ) : sortedRooms.length === 0 ? (
          <div className="py-20 text-center">
            <EmptyState
              icon={MessageCircle}
              message="아직 채팅방이 없습니다"
              description="새로운 대화를 시작해보세요."
            />
          </div>
        ) : (
          <div className="divide-y">
            {sortedRooms.map((room) => (
              <div
                key={room.roomId}
                className="flex items-center gap-4 p-4 hover:bg-accent cursor-pointer group"
                onClick={() => navigate(`/chatting/${room.roomId}`)}
              >
                {renderAvatar(room)}

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold truncate">{room.name ?? `채팅방 ${room.roomId}`}</h3>
                    <span className="text-xs text-muted-foreground">{formatTime(room.updatedAt)}</span>
                  </div>

                  <p className="text-sm text-muted-foreground truncate">
                    {room.lastMessage || "메시지가 없습니다."}
                  </p>
                </div>

                {room.unreadCount > 0 && (
                  <div className="bg-purple-500 text-white text-xs px-2 py-1 rounded-full">
                    {room.unreadCount}
                  </div>
                )}

                <button
                  onClick={(e) => handleHide(room.roomId, e)}
                  className="opacity-0 group-hover:opacity-100 p-2"
                >
                  <EyeOff className="w-5 h-5 text-muted-foreground" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* SEARCH DIALOG */}
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

          {searchResults.map((room) => (
            <div
              key={room.roomId}
              className="p-3 rounded-lg hover:bg-accent cursor-pointer"
              onClick={() => {
                navigate(`/chatting/${room.roomId}`);
                setSearchOpen(false);
              }}
            >
              <h4 className="font-medium">{room.name ?? `채팅방 ${room.roomId}`}</h4>
              <p className="text-sm text-muted-foreground truncate">
                {room.lastMessage || "메시지가 없습니다"}
              </p>
            </div>
          ))}
        </DialogContent>
      </Dialog>

      {/* CREATE CHAT ROOM */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>새 채팅 만들기</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <Label>채팅 타입</Label>
            <Select value={roomType} onValueChange={(v) => setRoomType(v as RoomType)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={RoomType.DIRECT}>1:1 채팅</SelectItem>
                <SelectItem value={RoomType.GROUP}>그룹 채팅</SelectItem>
              </SelectContent>
            </Select>

            {roomType === RoomType.GROUP && (
              <div>
                <Label>그룹 이름</Label>
                <Input value={roomName} onChange={(e) => setRoomName(e.target.value)} />
              </div>
            )}

            <div>
              <Label>초대할 사용자 ID</Label>
              <Input
                placeholder="예: 2,3,4"
                value={memberIds}
                onChange={(e) => setMemberIds(e.target.value)}
              />
            </div>

            <Button onClick={handleCreateChat} className="w-full">
              생성하기
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* HIDDEN ROOMS DIALOG */}
      <Dialog open={hiddenRoomsDialogOpen} onOpenChange={setHiddenRoomsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>숨긴 채팅방</DialogTitle>
          </DialogHeader>

          {hiddenRooms.length === 0 ? (
            <p className="text-center text-muted-foreground py-6">숨긴 채팅방이 없습니다.</p>
          ) : (
            hiddenRooms.map((room) => (
              <div key={room.roomId} className="p-3 flex items-center justify-between">
                <span>{room.name ?? `채팅방 ${room.roomId}`}</span>
                <Button variant="outline" onClick={() => unhideRoom(room.roomId)}>
                  <Eye className="w-4 h-4 mr-2" /> 다시 보기
                </Button>
              </div>
            ))
          )}
        </DialogContent>
      </Dialog>

      <BottomNav />
    </div>
  );
};

export default Chatting;
