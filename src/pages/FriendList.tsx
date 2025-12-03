import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ArrowLeft, MessageCircle, User } from "lucide-react";
import { getFriends, FriendResponse } from "@/lib/api/friends";
import { getOrCreateChatRoom } from "@/lib/chatstore";
import { toast } from "sonner";

const FriendList = () => {
  const navigate = useNavigate();
  const [friends, setFriends] = useState<FriendResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchFriends();
  }, []);

  const fetchFriends = async () => {
    try {
      setIsLoading(true);
      const friendsList = await getFriends();
      setFriends(friendsList);
    } catch (error) {
      console.error('친구 목록 조회 실패:', error);
      toast.error('친구 목록을 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartChat = (friend: FriendResponse) => {
    // 상대방 ID 결정 (내가 보낸 요청이면 receiverId, 받은 요청이면 senderId)
    const friendId = friend.isSentByMe ? friend.receiverId : friend.senderId;
    const friendName = `User #${friendId}`;
    
    // 채팅방 생성 또는 가져오기
    const chatRoom = getOrCreateChatRoom(friendName, "친구");
    navigate(`/chat/${chatRoom.id}`);
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header />
      <main className="max-w-screen-xl mx-auto px-4 py-6">
        <div className="flex items-center gap-3 mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/my")}
            className="shrink-0"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-bold text-foreground">친구 목록</h1>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : friends.length === 0 ? (
          <Card className="border-0 shadow-sm">
            <CardContent className="p-8 text-center">
              <User className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground">아직 친구가 없습니다.</p>
              <p className="text-sm text-muted-foreground mt-1">
                게시글이나 댓글에서 친구를 추가해보세요!
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {friends.map((friend) => {
              const friendId = friend.isSentByMe ? friend.receiverId : friend.senderId;
              return (
                <Card key={friend.id} className="border-0 shadow-sm">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-12 h-12">
                        <AvatarFallback className="bg-primary/10 text-primary">
                          <User className="w-6 h-6" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground truncate">
                          User #{friendId}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(friend.createdAt).toLocaleDateString('ko-KR')}부터 친구
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleStartChat(friend)}
                        className="shrink-0"
                      >
                        <MessageCircle className="w-4 h-4 mr-1" />
                        채팅
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </main>
      <BottomNav />
    </div>
  );
};

export default FriendList;