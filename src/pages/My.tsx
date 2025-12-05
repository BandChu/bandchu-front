import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { 
  User, 
  Settings, 
  AlertTriangle, 
  ChevronRight,
  LogOut,
  Shield,
  HelpCircle,
  Users,
  UserCheck
} from "lucide-react";
import { getFriendRequests, FriendResponse } from "@/lib/api/friends";
import { getMemberInfo } from "@/lib/api/auth";
import { toast } from "sonner";

const My = () => {
  const navigate = useNavigate();
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);
  const [pendingRequestCount, setPendingRequestCount] = useState(0);
  const [userInfo, setUserInfo] = useState({
    memberId: 0,
    nickname: localStorage.getItem('userNickname') || "사용자",
    email: localStorage.getItem('userEmail') || "",
    profileImageUrl: localStorage.getItem('userProfileImage') || "",
    role: (localStorage.getItem('userRole') as "FAN" | "ARTIST") || "FAN"
  });
  const [isLoadingUserInfo, setIsLoadingUserInfo] = useState(true);

  // 사용자 정보 조회
  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const memberInfo = await getMemberInfo();
        setUserInfo({
          memberId: memberInfo.memberId,
          nickname: memberInfo.nickname,
          email: memberInfo.email,
          profileImageUrl: memberInfo.profileImageUrl || "",
          role: memberInfo.role
        });
        // localStorage에도 최신 정보 저장
        localStorage.setItem('userNickname', memberInfo.nickname);
        localStorage.setItem('userEmail', memberInfo.email);
        localStorage.setItem('userRole', memberInfo.role);
        if (memberInfo.profileImageUrl) {
          localStorage.setItem('userProfileImage', memberInfo.profileImageUrl);
        }
      } catch (error) {
        console.error('사용자 정보 조회 실패:', error);
        // API 실패 시 localStorage 값 사용 (이미 초기값으로 설정됨)
      } finally {
        setIsLoadingUserInfo(false);
      }
    };

    fetchUserInfo();
  }, []);

  // 받은 친구 요청 수 조회
  useEffect(() => {
    const fetchPendingRequests = async () => {
      try {
        const requests = await getFriendRequests();
        // 받은 요청 중 PENDING 상태인 것만 카운트
        const pendingCount = requests.filter(
          req => !req.isSentByMe && req.status === 'PENDING'
        ).length;
        setPendingRequestCount(pendingCount);
      } catch (error) {
        console.error('친구 요청 조회 실패:', error);
      }
    };

    fetchPendingRequests();
  }, []);

  const handleLogout = async () => {
    setIsLogoutDialogOpen(false);
    
    // 로컬 정리 후 로그아웃 처리
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userNickname');
    localStorage.removeItem('userProfileImage');
    localStorage.removeItem('userRole');
    
    toast.success('로그아웃되었습니다.');
    navigate('/auth');
  };

  const menuItems = [
    {
      icon: UserCheck,
      label: "내 친구 목록",
      onClick: () => navigate('/my/friends')
    },
    {
      icon: Users,
      label: "친구 요청",
      badge: pendingRequestCount > 0 ? pendingRequestCount : undefined,
      onClick: () => navigate('/my/friend-requests')
    },
    {
      icon: Settings,
      label: "설정",
      onClick: () => {
        toast.info('설정 기능은 준비 중입니다.');
      }
    },
    {
      icon: Shield,
      label: "개인정보 보호",
      onClick: () => {
        toast.info('개인정보 보호 기능은 준비 중입니다.');
      }
    },
    {
      icon: HelpCircle,
      label: "고객센터",
      onClick: () => {
        toast.info('고객센터 기능은 준비 중입니다.');
      }
    }
  ];

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header />
      <main className="max-w-screen-xl mx-auto px-4 py-6">
        {/* 프로필 섹션 */}
        <div className="mb-6">
          <Card className="border-0 shadow-sm bg-card">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <Avatar className="w-16 h-16 ring-2 ring-border">
                  {userInfo.profileImageUrl ? (
                    <AvatarImage src={userInfo.profileImageUrl} alt={userInfo.nickname} />
                  ) : null}
                  <AvatarFallback className="bg-primary/10 text-primary">
                    <User className="w-8 h-8 text-primary" />
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <h2 className="text-xl font-semibold text-foreground mb-1 truncate">
                    {userInfo.nickname}
                  </h2>
                  <p className="text-sm text-muted-foreground truncate">
                    {userInfo.email}
                  </p>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                      {userInfo.role === "FAN" ? "팬" : "아티스트"}
                    </span>
                    {userInfo.memberId > 0 && (
                      <span className="text-xs text-muted-foreground">
                        ID: {userInfo.memberId}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 메뉴 섹션 */}
        <div className="space-y-3 mb-6">
          <Card className="border-0 shadow-sm bg-card">
            <CardContent className="p-0">
              {menuItems.map((item, index) => {
                const Icon = item.icon;
                return (
                  <div key={item.label}>
                    <button
                      onClick={item.onClick}
                      className="w-full px-4 py-4 flex items-center gap-3 hover:bg-accent/50 transition-colors"
                    >
                      <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center relative">
                        <Icon className="w-5 h-5 text-foreground" />
                        {item.badge && (
                          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold min-w-[20px] h-[20px] flex items-center justify-center px-1 rounded-full border-2 border-background shadow-md">
                            {item.badge}
                          </span>
                        )}
                      </div>
                      <span className="flex-1 text-left font-medium text-foreground">
                        {item.label}
                      </span>
                      {item.badge && (
                        <span className="bg-red-500 text-white text-sm font-bold px-3 py-1.5 rounded-full min-w-[28px] h-7 flex items-center justify-center shadow-sm">
                          {item.badge}
                        </span>
                      )}
                      <ChevronRight className="w-5 h-5 text-muted-foreground" />
                    </button>
                    {index < menuItems.length - 1 && (
                      <Separator className="mx-4" />
                    )}
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>

        {/* 계정 관리 섹션 */}
        <div className="space-y-3 mb-6">
          <Card className="border-0 shadow-sm bg-card">
            <CardContent className="p-0">
              <button
                onClick={() => setIsLogoutDialogOpen(true)}
                className="w-full px-4 py-4 flex items-center gap-3 hover:bg-accent/50 transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                  <LogOut className="w-5 h-5 text-foreground" />
                </div>
                <span className="flex-1 text-left font-medium text-foreground">
                  로그아웃
                </span>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </button>
              <Separator className="mx-4" />
              <button
                onClick={() => navigate("/account/delete")}
                className="w-full px-4 py-4 flex items-center gap-3 hover:bg-destructive/10 transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-destructive" />
                </div>
                <span className="flex-1 text-left font-medium text-destructive">
                  회원탈퇴
                </span>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </button>
            </CardContent>
          </Card>
        </div>
      </main>
      <BottomNav />

      {/* 로그아웃 확인 다이얼로그 */}
      <AlertDialog open={isLogoutDialogOpen} onOpenChange={setIsLogoutDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>로그아웃 하시겠습니까?</AlertDialogTitle>
            <AlertDialogDescription>
              로그아웃 후에는 일부 기능을 사용하실 수 없습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction onClick={handleLogout}>
              로그아웃
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default My;