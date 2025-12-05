import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import GoogleIcon from "@/components/GoogleIcon";
import { ArrowLeft, UserCircle } from "lucide-react";
import { login, LoginRequest, googleOAuth } from "@/lib/api/auth";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { handleGoogleSignIn, getGoogleClientId } from "@/lib/utils/googleAuth";
import { parseJwt } from "@/lib/utils";

const loginSchema = z.object({
  email: z.string().email("올바른 이메일 형식이 아닙니다"),
  password: z.string().min(6, "비밀번호는 최소 6자 이상이어야 합니다"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const Login = () => {
  const navigate = useNavigate();
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

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

    try {
      const clientId = await getGoogleClientId();
      if (!clientId) {
        toast.error('구글 로그인 설정이 완료되지 않았습니다.');
        setIsGoogleLoading(false);
        return;
      }

      // 타임아웃 설정: 10초 후 자동으로 로딩 해제 (사용자가 팝업을 닫으면 콜백이 호출되지 않을 수 있음)
      const timeoutId = setTimeout(() => {
        setIsGoogleLoading(false);
        toast.error('구글 로그인 시간이 초과되었습니다. 다시 시도해주세요.');
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
          
          // 신규 회원이거나 프로필 미완료인 경우 회원가입 플로우 진행
          if (response.isNewMember || response.isProfileCompleted === false) {
            toast.info('회원 유형을 선택해주세요.');
            navigate("/signup/type", { 
              state: { 
                isGoogleSignup: true
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
            '구글 로그인에 실패했습니다.';
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
      const errorMessage = error.message || '구글 로그인 설정을 불러오는데 실패했습니다.';
      toast.error(errorMessage);
    }
  };

  const onSubmit = async (data: LoginFormValues) => {
    try {
      const response = await login(data as LoginRequest);
      localStorage.setItem('accessToken', response.accessToken);
      localStorage.setItem('refreshToken', response.refreshToken);
      
      // JWT 파싱하여 userRole 저장
      const decodedToken = parseJwt(response.accessToken);
      if (decodedToken && decodedToken.role) {
        localStorage.setItem('userRole', decodedToken.role);
      }

      // 로그인 시 이메일 저장
      localStorage.setItem('userEmail', data.email);
      toast.success('로그인 성공');
      navigate("/home");
    } catch (error: any) {
      // 네트워크 에러인지 확인
      if (!error.response && error.request) {
        toast.error('네트워크 에러가 발생했습니다. 서버에 연결할 수 없습니다.');
        return;
      }
      
      // 서버 응답 구조에 따라 에러 메시지 추출
      const errorMessage = 
        error.response?.data?.message || 
        error.response?.data?.error || 
        error.message || 
        '로그인에 실패했습니다.';
      
      toast.error(errorMessage);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col px-6 py-8 max-w-md mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-12">
        <Button
          variant="ghost"
          size="icon"
          className="h-10 w-10"
          onClick={() => navigate("/auth")}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold">로그인</h1>
      </div>

      {/* Icon Section */}
      <div className="flex justify-center mb-10">
        <div className="p-4 rounded-full bg-muted/50">
          <UserCircle className="w-16 h-16 text-primary" />
        </div>
      </div>

      {/* Form Section */}
      <div className="flex-1 flex flex-col justify-between pb-8">
        <div className="space-y-6">
          <Button
            variant="outline"
            className="w-full h-14 text-base font-medium border border-border bg-background hover:bg-accent hover:text-accent-foreground transition-all rounded-xl"
            onClick={() => navigate("/signup/type")}
          >
            회원가입
          </Button>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium mb-2.5 block text-foreground">이메일</FormLabel>
                    <FormControl>
                      <Input 
                        type="email" 
                        placeholder="example@email.com" 
                        className="h-14 text-base border-border rounded-xl bg-background focus-visible:ring-2 focus-visible:ring-primary/20"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage className="text-sm mt-1.5" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium mb-2.5 block text-foreground">비밀번호</FormLabel>
                    <FormControl>
                      <Input 
                        type="password" 
                        placeholder="비밀번호를 입력하세요" 
                        className="h-14 text-base border-border rounded-xl bg-background focus-visible:ring-2 focus-visible:ring-primary/20"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage className="text-sm mt-1.5" />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full h-14 text-base font-medium rounded-xl mt-2">
                로그인
              </Button>
            </form>
          </Form>

          <div className="relative py-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-background px-3 text-muted-foreground">또는</span>
            </div>
          </div>

          <Button
            variant="outline"
            className="w-full h-14 text-base font-medium border border-border bg-background hover:bg-accent hover:text-accent-foreground transition-all rounded-xl flex items-center justify-center gap-3"
            onClick={handleGoogleAuth}
            disabled={isGoogleLoading}
          >
            <GoogleIcon className="w-5 h-5" />
            {isGoogleLoading ? '처리 중...' : '구글 로그인'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Login;

