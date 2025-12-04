import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { ArrowLeft, UserPlus } from "lucide-react";
import { signup, login } from "@/lib/api/auth";
import { toast } from "sonner";

const signupFormSchema = z.object({
  email: z.string().email("올바른 이메일 형식이 아닙니다"),
  password: z.string().min(6, "비밀번호는 최소 6자 이상이어야 합니다"),
});

type SignupFormValues = z.infer<typeof signupFormSchema>;

const SignupForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
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
      // 회원가입
      await signup({
        email: data.email,
        password: data.password,
        nickname: 'temp', // 프로필 설정에서 업데이트할 예정
        role: userType,
      });
      
      // 회원가입 성공 후 바로 로그인하여 토큰 받기
      const loginResponse = await login({
        email: data.email,
        password: data.password,
      });
      
      localStorage.setItem('accessToken', loginResponse.accessToken);
      localStorage.setItem('refreshToken', loginResponse.refreshToken);
      // 회원가입 시 이메일과 role 저장
      localStorage.setItem('userEmail', data.email);
      localStorage.setItem('userRole', userType);
      
      navigate("/signup/profile", { 
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

  return (
    <div className="min-h-screen bg-background flex flex-col px-6 py-8 max-w-md mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-12">
        <Button
          variant="ghost"
          size="icon"
          className="h-10 w-10"
          onClick={() => navigate("/signup/type")}
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

