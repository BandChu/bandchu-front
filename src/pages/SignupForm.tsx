import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { ArrowLeft, UserPlus } from "lucide-react";

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
      // 프로필 설정 페이지로 이동
      navigate("/signup/profile", { 
        state: { 
          email: data.email, 
          password: data.password, 
          userType 
        } 
      });
    } catch (error) {
      console.error("Signup form error:", error);
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

