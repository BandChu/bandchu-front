import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { ArrowLeft, UserPlus } from "lucide-react";
import { signup, deleteAccount } from "@/lib/api/auth";
import { toast } from "sonner";

const signupFormSchema = z.object({
  email: z.string().email("올바른 이메일 형식이 아닙니다"),
  password: z.string().min(6, "비밀번호는 최소 6자 이상이어야 합니다"),
});

type SignupFormValues = z.infer<typeof signupFormSchema>;

const SignupForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  // 일반 회원가입은 아이디/비밀번호부터 시작하므로 기본값 FAN 사용
  const userType = (location.state as { userType?: "FAN" | "ARTIST" })?.userType || "FAN";

  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupFormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: SignupFormValues) => {
    try {
      // 회원가입 (역할은 아직 선택하지 않았으므로 임시로 FAN 사용, 역할 선택 페이지에서 업데이트)
      // 백엔드에서 회원가입 시 JWT 토큰을 응답에 포함하여 반환
      const signupResponse = await signup({
        email: data.email,
        password: data.password,
        nickname: 'temp', // 프로필 설정에서 업데이트할 예정
        role: 'FAN', // 임시 역할, 역할 선택 페이지에서 업데이트됨
      });
      
      // 회원가입 응답에서 토큰 저장
      localStorage.setItem('accessToken', signupResponse.accessToken);
      localStorage.setItem('refreshToken', signupResponse.refreshToken);
      // 회원가입 시 이메일 저장 (role은 역할 선택 페이지에서 설정)
      localStorage.setItem('userEmail', data.email);
      
      // 일반 회원가입: 아이디/비밀번호 입력 후 역할 선택으로 이동
      navigate("/signup/type", { 
        state: { 
          userType 
        } 
      });
    } catch (error: any) {
      // 네트워크 에러인지 확인
      if (!error.response && error.request) {
        toast.error('네트워크 에러가 발생했습니다. 서버에 연결할 수 없습니다.');
        return;
      }
      
      // 500 에러 처리 (서버 내부 오류)
      if (error.response?.status === 500) {
        console.error('서버 에러 상세:', {
          status: error.response?.status,
          data: error.response?.data,
          message: error.response?.data?.message,
          error: error.response?.data?.error,
        });
        
        const serverMessage = 
          error.response?.data?.message || 
          error.response?.data?.error || 
          '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
        toast.error(serverMessage);
        return;
      }
      
      // 409 에러 처리 (이메일/닉네임 중복 등)
      if (error.response?.status === 409) {
        const conflictMessage = error.response?.data?.message || '이미 사용 중인 이메일 또는 닉네임입니다.';
        toast.error(conflictMessage);
        return;
      }
      
      // 서버 응답 구조에 따라 에러 메시지 추출
      console.error('회원가입 에러:', error);
      const errorMessage = 
        error.response?.data?.message || 
        error.response?.data?.error || 
        error.message || 
        '회원가입에 실패했습니다.';
      
      toast.error(errorMessage);
    }
  };

  const handleBackClick = async () => {
    // 이미 회원가입이 완료된 경우 백엔드에서 회원 삭제
    try {
      const token = localStorage.getItem('accessToken');
      if (token) {
        await deleteAccount();
      }
    } catch (error: any) {
      // 회원 삭제 실패 시에도 프론트엔드 정리는 진행
      // (이미 삭제된 경우 등 idempotent 특성으로 인해 실패할 수 있음)
      console.error('회원 삭제 실패:', error);
      // 에러가 발생해도 사용자에게는 정상적으로 취소되었다고 표시
    }
    
    // 회원가입 취소: 저장된 토큰 및 사용자 정보 삭제
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userNickname');
    localStorage.removeItem('userProfileImage');
    localStorage.removeItem('userRole');
    
    toast.info('회원가입이 취소되었습니다.');
    navigate("/auth");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col px-6 py-8 max-w-md mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-12">
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10"
            onClick={handleBackClick}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">회원 가입</h1>
        </div>

      {/* Icon Section */}
      <div className="flex justify-center mb-10">
        <div className="p-4 rounded-full bg-muted/50">
          <UserPlus className="w-16 h-16 text-primary" />
        </div>
      </div>

      {/* Form Section */}
      <div className="flex-1 flex flex-col justify-between pb-8">
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
            <Button type="submit" className="w-full h-14 text-base font-medium rounded-xl">
              다음
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default SignupForm;

