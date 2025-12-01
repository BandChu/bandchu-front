import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import GoogleIcon from "@/components/GoogleIcon";
import { ArrowLeft, UserCircle } from "lucide-react";

const loginSchema = z.object({
  email: z.string().email("올바른 이메일 형식이 아닙니다"),
  password: z.string().min(6, "비밀번호는 최소 6자 이상이어야 합니다"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const Login = () => {
  const navigate = useNavigate();
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    try {
      // TODO: API 호출
      console.log("Login data:", data);
      // 로그인 성공 시 홈으로 이동
      navigate("/home");
    } catch (error) {
      console.error("Login error:", error);
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
            onClick={() => {
              // TODO: 구글 로그인 구현
              console.log("구글 로그인");
              // 로그인 성공 시 홈으로 이동
              navigate("/home");
            }}
          >
            <GoogleIcon className="w-5 h-5" />
            구글 로그인
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Login;

