import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, User, Check, X, Loader2 } from "lucide-react";
import { 
  getFriendRequests, 
  acceptFriendRequest, 
  rejectFriendRequest,
  FriendResponse 
} from "@/lib/api/friends";
import { toast } from "sonner";

const FriendRequests = () => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState<FriendResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingIds, setProcessingIds] = useState<Set<number>>(new Set());

  const fetchRequests = async () => {
    try {
      setIsLoading(true);
      const data = await getFriendRequests();
      setRequests(data);
    } catch (error: any) {
      console.error('친구 요청 조회 실패:', error);
      toast.error(error.message || '친구 요청을 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleAccept = async (requestId: number) => {
    setProcessingIds(prev => new Set(prev).add(requestId));
    try {
      await acceptFriendRequest(requestId);
      toast.success('친구 요청을 수락했습니다.');
      // 목록에서 해당 요청 상태 업데이트
      setRequests(prev => 
        prev.map(req => 
          req.id === requestId ? { ...req, status: 'ACCEPTED' as const } : req
        )
      );
    } catch (error: any) {
      toast.error(error.message || '친구 요청 수락에 실패했습니다.');
    } finally {
      setProcessingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(requestId);
        return newSet;
      });
    }
  };

  const handleReject = async (requestId: number) => {
    setProcessingIds(prev => new Set(prev).add(requestId));
    try {
      await rejectFriendRequest(requestId);
      toast.success('친구 요청을 거절했습니다.');
      // 목록에서 해당 요청 제거
      setRequests(prev => prev.filter(req => req.id !== requestId));
    } catch (error: any) {
      toast.error(error.message || '친구 요청 거절에 실패했습니다.');
    } finally {
      setProcessingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(requestId);
        return newSet;
      });
    }
  };

  // 받은 요청 (내가 수락/거절 가능) - PENDING 상태만
  const receivedRequests = requests.filter(req => !req.isSentByMe && req.status === 'PENDING');
  // 보낸 요청
  const sentRequests = requests.filter(req => req.isSentByMe);

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header />
      <main className="max-w-screen-xl mx-auto px-4 py-6">
        {/* 뒤로가기 헤더 */}
        <div className="flex items-center gap-3 mb-6">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-accent rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold">친구 요청</h1>
        </div>

        <Tabs defaultValue="received" className="w-full">
          <TabsList className="w-full mb-4">
            <TabsTrigger value="received" className="flex-1">
              받은 요청 {receivedRequests.length > 0 && `(${receivedRequests.length})`}
            </TabsTrigger>
            <TabsTrigger value="sent" className="flex-1">
              보낸 요청 {sentRequests.length > 0 && `(${sentRequests.length})`}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="received">
            {isLoading ? (
              <div className="flex justify-center py-10">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : receivedRequests.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground">
                <p>받은 친구 요청이 없습니다.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {receivedRequests.map((request) => (
                  <Card key={request.id} className="border-0 shadow-sm">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-12 h-12">
                          <AvatarFallback className="bg-primary/10">
                            <User className="w-6 h-6 text-primary" />
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-foreground">
                            사용자 #{request.senderId}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(request.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleReject(request.id)}
                            disabled={processingIds.has(request.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            {processingIds.has(request.id) ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <X className="w-4 h-4" />
                            )}
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleAccept(request.id)}
                            disabled={processingIds.has(request.id)}
                          >
                            {processingIds.has(request.id) ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Check className="w-4 h-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="sent">
            {isLoading ? (
              <div className="flex justify-center py-10">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : sentRequests.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground">
                <p>보낸 친구 요청이 없습니다.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {sentRequests.map((request) => (
                  <Card key={request.id} className="border-0 shadow-sm">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-12 h-12">
                          <AvatarFallback className="bg-primary/10">
                            <User className="w-6 h-6 text-primary" />
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-foreground">
                            사용자 #{request.receiverId}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(request.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          request.status === 'ACCEPTED' 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {request.status === 'ACCEPTED' ? '수락됨' : '대기중'}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
      <BottomNav />
    </div>
  );
};

export default FriendRequests;