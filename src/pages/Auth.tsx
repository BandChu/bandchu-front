import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import GoogleIcon from "@/components/GoogleIcon";
import { toast } from "sonner";
import { googleOAuth } from "@/lib/api/auth";
import { handleGoogleSignIn, getGoogleClientId } from "@/lib/utils/googleAuth";
import { parseJwt } from "@/lib/utils";

const Auth = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("login");
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  // Google Identity Services 로드 확인
  useEffect(() => {
    const checkGoogleLoaded = () => {
      if (window.google) {
        return;
      }
      // Google 스크립트가 로드될 때까지 대기
      setTimeout(checkGoogleLoaded, 100);
    };
    checkGoogleLoaded();
  }, []);

  const handleGoogleAuth = async () => {
    setIsGoogleLoading(true);
    const isSignupTab = activeTab === 'signup';
    const actionText = isSignupTab ? '구글 회원가입' : '구글 로그인';

    try {
      const clientId = await getGoogleClientId();
      if (!clientId) {
        toast.error(`${actionText} 설정이 완료되지 않았습니다.`);
        setIsGoogleLoading(false);
        return;
      }

      // 타임아웃 설정: 10초 후 자동으로 로딩 해제 (사용자가 팝업을 닫으면 콜백이 호출되지 않을 수 있음)
      const timeoutId = setTimeout(() => {
        setIsGoogleLoading(false);
        toast.error(`${actionText} 시간이 초과되었습니다. 다시 시도해주세요.`);
      }, 10 * 1000); // 10초

      handleGoogleSignIn({
        clientId,
      onSuccess: async (idToken: string) => {
        clearTimeout(timeoutId);
        try {
          const response = await googleOAuth({ idToken });
          
          // 토큰 저장
          localStorage.setItem('accessToken', response.accessToken);
          localStorage.setItem('refreshToken', response.refreshToken);
          
          // JWT 파싱하여 userRole 저장
          const decodedToken = parseJwt(response.accessToken);
          if (decodedToken && decodedToken.role) {
            localStorage.setItem('userRole', decodedToken.role);
          }
          
          // 사용자 정보 저장
          localStorage.setItem('userEmail', decodedToken?.email || '');
          localStorage.setItem('userNickname', response.nickname);
          
          setIsGoogleLoading(false);
          
          // 신규 회원인 경우 프로필 설정으로, 기존 회원인 경우 홈으로
          if (response.isNewMember) {
            toast.success('구글 회원가입이 완료되었습니다. 프로필을 설정해주세요.');
            navigate("/signup/profile", { 
              state: { 
                userType: decodedToken?.role || 'FAN'
              } 
            });
          } else {
            toast.success('구글 로그인 성공');
            navigate("/home");
          }
        } catch (error: any) {
          setIsGoogleLoading(false);
          const errorMessage = 
            error.response?.data?.message || 
            error.message || 
            `${actionText}에 실패했습니다.`;
          toast.error(errorMessage);
        }
      },
      onError: (error: string) => {
        clearTimeout(timeoutId);
        setIsGoogleLoading(false);
        toast.error(error);
      },
      });
    } catch (error: any) {
      setIsGoogleLoading(false);
      const errorMessage = error.message || `${actionText} 설정을 불러오는데 실패했습니다.`;
      toast.error(errorMessage);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col px-6 py-16 max-w-md mx-auto">
      <div className="flex-1 flex flex-col justify-center">
        {/* Hero Section */}
        <div className="mb-20">
          <h1 className="text-6xl font-bold text-foreground mb-6" style={{ fontFamily: '"Stereofidelic", sans-serif' }}>
            BANDCHU
          </h1>
          <h2 className="text-2xl font-bold text-foreground mb-5 leading-tight">
            인디 아티스트와 팬을<br />잇는 플랫폼
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            팬의 발견, 아티스트의 도약
          </p>
        </div>

        {/* Auth Section */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 h-11 mb-6 bg-muted/30 rounded-lg">
            <TabsTrigger 
              value="login" 
              className="text-sm font-medium data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-lg transition-all"
            >
              로그인
            </TabsTrigger>
            <TabsTrigger 
              value="signup" 
              className="text-sm font-medium data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-lg transition-all"
            >
              회원가입
            </TabsTrigger>
          </TabsList>

          <TabsContent value="login" className="space-y-3 mt-0">
            <Button
              className="w-full h-14 text-base font-semibold bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl shadow-sm"
              onClick={() => navigate("/login")}
            >
              일반 로그인
            </Button>
            <Button
              variant="outline"
              className="w-full h-14 text-base font-medium border border-border bg-background hover:bg-accent/50 rounded-xl flex items-center justify-center gap-3"
              onClick={handleGoogleAuth}
              disabled={isGoogleLoading}
            >
              <GoogleIcon className="w-5 h-5" />
              {isGoogleLoading ? '처리 중...' : '구글 로그인'}
            </Button>
          </TabsContent>

          <TabsContent value="signup" className="space-y-3 mt-0">
            <Button
              className="w-full h-14 text-base font-semibold bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl shadow-sm"
              onClick={() => navigate("/signup/type")}
            >
              일반 회원가입
            </Button>
            <Button
              variant="outline"
              className="w-full h-14 text-base font-medium border border-border bg-background hover:bg-accent/50 rounded-xl flex items-center justify-center gap-3"
              onClick={handleGoogleAuth}
              disabled={isGoogleLoading}
            >
              <GoogleIcon className="w-5 h-5" />
              {isGoogleLoading ? '처리 중...' : '구글 회원가입'}
            </Button>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Auth;

