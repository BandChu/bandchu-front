import { useState, useEffect } from "react";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, ArrowLeft, MailCheck, MailX, Loader2 } from "lucide-react";

const EmailVerification = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<"success" | "failed" | "pending">("pending");

  const userType = (location.state as { userType?: "FAN" | "ARTIST" })?.userType || "FAN";

  useEffect(() => {
    // URL 파라미터로 성공/실패 확인 (실제로는 API 응답으로 처리)
    const verifyStatus = searchParams.get("status");
    if (verifyStatus === "success") {
      setStatus("success");
    } else if (verifyStatus === "failed") {
      setStatus("failed");
    } else {
      // 기본적으로 성공으로 가정 (실제로는 API 호출 결과에 따라 결정)
      // setStatus("failed"); // 테스트용
      setStatus("success");
    }
  }, [searchParams]);

  const handleRetry = () => {
    navigate("/signup/form", { state: { userType } });
  };

  const handleOtherMethod = () => {
    // TODO: 다른 인증 방법 구현
    console.log("다른 방법으로 인증하기");
  };

  const handleContinue = () => {
    // TODO: 회원가입 완료 처리
    navigate("/login");
  };

  if (status === "pending") {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
        <div className="flex justify-center mb-6">
          <div className="relative">
            <MailCheck className="w-24 h-24 text-muted-foreground" />
            <Loader2 className="w-12 h-12 text-primary absolute -bottom-2 -right-2 animate-spin" />
          </div>
        </div>
        <p className="text-base text-muted-foreground">이메일 인증 중...</p>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="min-h-screen bg-background flex flex-col px-6 py-8 max-w-md mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-12">
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10"
            onClick={() => navigate("/signup/form")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">회원 가입</h1>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col justify-between pb-8">
          <div className="text-center space-y-8">
            <div className="flex justify-center">
              <div className="relative">
                <MailCheck className="w-28 h-28 text-primary" />
                <CheckCircle2 className="w-14 h-14 text-primary absolute -bottom-2 -right-2 bg-background rounded-full" />
              </div>
            </div>
            <p className="text-xl font-semibold">이메일 인증이 완료되었습니다!</p>
          </div>
          <Button onClick={handleContinue} className="w-full h-14 text-base font-medium rounded-xl">
            다음
          </Button>
        </div>
      </div>
    );
  }

  // status === "failed"
  return (
    <div className="min-h-screen bg-background flex flex-col px-6 py-8 max-w-md mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-12">
        <Button
          variant="ghost"
          size="icon"
          className="h-10 w-10"
          onClick={() => navigate("/signup/form")}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold">회원 가입</h1>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col justify-between pb-8">
        <div className="text-center space-y-8">
          <div className="flex justify-center">
            <div className="relative">
              <MailX className="w-28 h-28 text-destructive" />
              <XCircle className="w-14 h-14 text-destructive absolute -bottom-2 -right-2 bg-background rounded-full" />
            </div>
          </div>
          <p className="text-xl font-semibold">이메일 인증에 실패했습니다</p>
        </div>
        <div className="space-y-3">
          <Button 
            onClick={handleRetry} 
            variant="outline" 
            className="w-full h-14 text-base font-medium border border-border bg-background hover:bg-accent hover:text-accent-foreground transition-all rounded-xl"
          >
            이메일 인증 다시하기
          </Button>
          <Button 
            onClick={handleOtherMethod} 
            variant="outline" 
            className="w-full h-14 text-base font-medium border border-border bg-background hover:bg-accent hover:text-accent-foreground transition-all rounded-xl"
          >
            다른 방법으로 인증하기
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EmailVerification;

