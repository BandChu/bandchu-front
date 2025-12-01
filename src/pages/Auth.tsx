import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import GoogleIcon from "@/components/GoogleIcon";
import { Sparkles } from "lucide-react";
import { toast } from "sonner";

const Auth = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("login");

  return (
    <div className="min-h-screen bg-background flex flex-col px-6 py-12 max-w-md mx-auto">
      <div className="flex-1 flex flex-col justify-center">
        {/* Logo Section */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-8">
            <div className="p-4 rounded-full bg-muted/50">
              <Sparkles className="w-16 h-16 text-primary" />
            </div>
          </div>
          <h1 className="text-5xl font-bold text-foreground mb-2">BANDCHU</h1>
          <p className="text-lg text-muted-foreground">K-Pop Artist Schedule</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 h-12 mb-10 bg-muted/30">
            <TabsTrigger value="login" className="text-base font-medium data-[state=active]:bg-background">로그인</TabsTrigger>
            <TabsTrigger value="signup" className="text-base font-medium data-[state=active]:bg-background">회원가입</TabsTrigger>
          </TabsList>

          <TabsContent value="login" className="space-y-3 mt-0">
            <Button
              variant="outline"
              className="w-full h-14 text-base font-medium border border-border bg-background hover:bg-accent hover:text-accent-foreground transition-all rounded-xl"
              onClick={() => navigate("/login")}
            >
              일반 로그인
            </Button>
            <Button
              variant="outline"
              className="w-full h-14 text-base font-medium border border-border bg-background hover:bg-accent hover:text-accent-foreground transition-all rounded-xl flex items-center justify-center gap-3"
              onClick={() => {
                toast.info('구글 로그인 기능은 현재 미구현입니다.');
              }}
            >
              <GoogleIcon className="w-5 h-5" />
              구글 로그인
            </Button>
          </TabsContent>

          <TabsContent value="signup" className="space-y-3 mt-0">
            <Button
              variant="outline"
              className="w-full h-14 text-base font-medium border border-border bg-background hover:bg-accent hover:text-accent-foreground transition-all rounded-xl"
              onClick={() => navigate("/signup/type")}
            >
              일반 회원가입
            </Button>
            <Button
              variant="outline"
              className="w-full h-14 text-base font-medium border border-border bg-background hover:bg-accent hover:text-accent-foreground transition-all rounded-xl flex items-center justify-center gap-3"
              onClick={() => {
                toast.info('구글 회원가입 기능은 현재 미구현입니다.');
              }}
            >
              <GoogleIcon className="w-5 h-5" />
              구글 회원가입
            </Button>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Auth;

