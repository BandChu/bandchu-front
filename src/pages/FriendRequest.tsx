import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, User, Check, X, Loader2, UserPlus, Send } from "lucide-react";
import { 
  getFriendRequests, 
  acceptFriendRequest, 
  rejectFriendRequest,
  sendFriendRequest,
  FriendResponse 
} from "@/lib/api/friends";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";

const FriendRequests = () => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState<FriendResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingIds, setProcessingIds] = useState<Set<number>>(new Set());
  const [friendIdInput, setFriendIdInput] = useState("");
  const [isSendingRequest, setIsSendingRequest] = useState(false);

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

  const handleSendFriendRequest = async () => {
    const receiverId = parseInt(friendIdInput.trim());
    
    if (!friendIdInput.trim()) {
      toast.error('사용자 ID를 입력해주세요.');
      return;
    }
    
    if (isNaN(receiverId) || receiverId <= 0) {
      toast.error('올바른 사용자 ID를 입력해주세요.');
      return;
    }

    setIsSendingRequest(true);
    try {
      await sendFriendRequest(receiverId);
      toast.success(`사용자 #${receiverId}님에게 친구 요청을 보냈습니다.`);
      setFriendIdInput("");
      // 요청 목록 새로고침
      await fetchRequests();
    } catch (error: any) {
      toast.error(error.message || '친구 요청 전송에 실패했습니다.');
    } finally {
      setIsSendingRequest(false);
    }
  };

  // 받은 요청 (내가 수락/거절 가능) - PENDING 상태만
  const receivedRequests = requests.filter(req => !req.isSentByMe && req.status === 'PENDING');
  // 보낸 요청
  const sentRequests = requests.filter(req => req.isSentByMe);

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header />
      <main className="max-w-screen-xl mx-auto px-4 py-4">
        {/* 뒤로가기 헤더 */}
        <div className="flex items-center gap-3 mb-6 px-1">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-muted rounded-xl transition-all duration-200 active:scale-95"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <h1 className="text-2xl font-bold text-foreground">친구 요청</h1>
        </div>

        <Tabs defaultValue="sent" className="w-full">
          <TabsList className="w-full mb-6 bg-muted/50 rounded-2xl p-1.5">
            <TabsTrigger 
              value="sent" 
              className="flex-1 rounded-xl data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all duration-200 font-medium"
            >
              보낸 요청 {sentRequests.length > 0 && (
                <span className="ml-1.5 px-2 py-0.5 rounded-full bg-muted-foreground/20 text-muted-foreground text-xs font-semibold">
                  {sentRequests.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger 
              value="received" 
              className="flex-1 rounded-xl data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all duration-200 font-medium"
            >
              받은 요청 {receivedRequests.length > 0 && (
                <span className="ml-1.5 px-2 py-0.5 rounded-full bg-primary text-primary-foreground text-xs font-semibold">
                  {receivedRequests.length}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="sent" className="mt-0">
            {/* 친구 초대 섹션 */}
            <div className="bg-gradient-to-br from-primary/5 via-background to-primary/10 rounded-3xl p-6 mb-6 border border-primary/10">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center shadow-lg shadow-primary/30">
                  <UserPlus className="w-5 h-5 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground text-base">친구 초대하기</h3>
                  <p className="text-xs text-muted-foreground">사용자 ID로 친구를 찾아보세요</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="flex-1 relative">
                  <Input
                    type="number"
                    placeholder="사용자 ID를 입력하세요"
                    value={friendIdInput}
                    onChange={(e) => setFriendIdInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleSendFriendRequest();
                      }
                    }}
                    className="h-12 rounded-xl border-border bg-background text-base pl-4 pr-4 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                    disabled={isSendingRequest}
                  />
                </div>
                <Button
                  onClick={handleSendFriendRequest}
                  disabled={isSendingRequest || !friendIdInput.trim()}
                  className="h-12 px-6 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/30 transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed font-medium shrink-0"
                >
                  {isSendingRequest ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <Send className="w-5 h-5 mr-1.5" />
                      전송
                    </>
                  )}
                </Button>
              </div>
            </div>

            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
                <p className="text-sm text-muted-foreground">로딩 중...</p>
              </div>
            ) : sentRequests.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 px-4">
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Send className="w-10 h-10 text-primary" />
                </div>
                <p className="text-lg font-semibold text-foreground mb-1">보낸 친구 요청이 없어요</p>
                <p className="text-sm text-muted-foreground text-center">위에서 친구를 초대해보세요</p>
              </div>
            ) : (
              <div className="space-y-3">
                {sentRequests.map((request) => (
                  <Card 
                    key={request.id} 
                    className="border border-border bg-card rounded-2xl overflow-hidden transition-all duration-200 hover:shadow-lg hover:border-primary/20"
                  >
                    <CardContent className="p-5">
                      <div className="flex items-center gap-4">
                        <Avatar className="w-14 h-14 ring-2 ring-primary/10">
                          <AvatarFallback className="bg-primary text-primary-foreground text-lg font-semibold">
                            <User className="w-7 h-7" />
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-foreground text-base mb-1">
                            사용자 #{request.senderId}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(request.createdAt).toLocaleDateString('ko-KR', { 
                              month: 'long', 
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleReject(request.id)}
                            disabled={processingIds.has(request.id)}
                            className="h-10 w-10 rounded-xl border-border hover:bg-destructive/10 hover:border-destructive/30 hover:text-destructive transition-all duration-200 active:scale-95"
                          >
                            {processingIds.has(request.id) ? (
                              <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                              <X className="w-5 h-5" />
                            )}
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleAccept(request.id)}
                            disabled={processingIds.has(request.id)}
                            className="h-10 px-6 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm transition-all duration-200 active:scale-95 font-medium"
                          >
                            {processingIds.has(request.id) ? (
                              <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                              <>
                                <Check className="w-5 h-5 mr-1.5" />
                                수락
                              </>
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

          <TabsContent value="received" className="mt-0">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
                <p className="text-sm text-muted-foreground">로딩 중...</p>
              </div>
            ) : receivedRequests.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 px-4">
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <User className="w-10 h-10 text-primary" />
                </div>
                <p className="text-lg font-semibold text-foreground mb-1">받은 친구 요청이 없어요</p>
                <p className="text-sm text-muted-foreground text-center">친구들이 요청을 보내면 여기에 표시됩니다</p>
              </div>
            ) : (
              <div className="space-y-3">
                {receivedRequests.map((request) => (
                  <Card 
                    key={request.id} 
                    className="border border-border bg-card rounded-2xl overflow-hidden transition-all duration-200 hover:shadow-lg hover:border-primary/20"
                  >
                    <CardContent className="p-5">
                      <div className="flex items-center gap-4">
                        <Avatar className="w-14 h-14 ring-2 ring-primary/10">
                          <AvatarFallback className="bg-primary text-primary-foreground text-lg font-semibold">
                            <User className="w-7 h-7" />
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-foreground text-base mb-1">
                            사용자 #{request.senderId}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(request.createdAt).toLocaleDateString('ko-KR', { 
                              month: 'long', 
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleReject(request.id)}
                            disabled={processingIds.has(request.id)}
                            className="h-10 w-10 rounded-xl border-border hover:bg-destructive/10 hover:border-destructive/30 hover:text-destructive transition-all duration-200 active:scale-95"
                          >
                            {processingIds.has(request.id) ? (
                              <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                              <X className="w-5 h-5" />
                            )}
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleAccept(request.id)}
                            disabled={processingIds.has(request.id)}
                            className="h-10 px-6 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm transition-all duration-200 active:scale-95 font-medium"
                          >
                            {processingIds.has(request.id) ? (
                              <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                              <>
                                <Check className="w-5 h-5 mr-1.5" />
                                수락
                              </>
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
        </Tabs>
      </main>
      <BottomNav />
    </div>
  );
};

export default FriendRequests;