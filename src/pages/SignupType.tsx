import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Users, Mic } from "lucide-react";
import { updateMemberRole, deleteAccount } from "@/lib/api/auth";
import { toast } from "sonner";
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

type UserType = "FAN" | "ARTIST";

const SignupType = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [userType, setUserType] = useState<UserType>("FAN");
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const isGoogleSignup = (location.state as { isGoogleSignup?: boolean })?.isGoogleSignup || false;

  const handleNext = async () => {
    // 구글 회원가입인 경우 role을 백엔드에 업데이트
    if (isGoogleSignup) {
      try {
        const response = await updateMemberRole({ role: userType });
        // localStorage에 role 업데이트 (백엔드 응답에서 받은 role 사용)
        localStorage.setItem('userRole', response.role);
        
        toast.success('회원 유형이 설정되었습니다.');
        navigate("/signup/profile", { state: { userType: response.role } });
      } catch (error: any) {
        // 네트워크 에러인지 확인
        if (!error.response && error.request) {
          toast.error('네트워크 에러가 발생했습니다. 서버에 연결할 수 없습니다.');
          return;
        }
        
        const errorMessage = 
          error.response?.data?.message || 
          error.message || 
          '회원 유형 설정에 실패했습니다.';
        toast.error(errorMessage);
      }
    } else {
      // 일반 회원가입인 경우 기존 플로우대로
      navigate("/signup/form", { state: { userType } });
    }
  };

  const handleBackClick = () => {
    // 모든 회원가입에서 확인 다이얼로그 표시
    setIsCancelDialogOpen(true);
  };

  const handleCancelSignup = async () => {
    setIsCancelDialogOpen(false);
    
    // 구글 회원가입인 경우 백엔드에서 회원 삭제
    if (isGoogleSignup) {
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
    <>
      <AlertDialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>회원가입을 취소하시겠습니까?</AlertDialogTitle>
            <AlertDialogDescription>
              회원가입을 취소하면 입력하신 정보가 저장되지 않습니다. 다시 시작하려면 처음부터 진행해주세요.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>계속하기</AlertDialogCancel>
            <AlertDialogAction onClick={handleCancelSignup} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              취소하기
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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

      {/* Icons Section */}
      <div className="flex justify-center mb-12 gap-12">
        <div className="flex flex-col items-center gap-3">
          <Users className="w-20 h-20 text-primary" />
          <span className="text-sm text-muted-foreground uppercase">FAN</span>
        </div>
        <div className="flex flex-col items-center gap-3">
          <Mic className="w-20 h-20 text-primary" />
          <span className="text-sm text-muted-foreground uppercase">ARTIST</span>
        </div>
      </div>

      {/* Selection Section */}
      <div className="flex-1 flex flex-col justify-between pb-8">
        <div className="space-y-6">
          <div>
            <p className="text-sm font-medium mb-4 text-foreground">회원가입 유형</p>
            <RadioGroup value={userType} onValueChange={(value) => setUserType(value as UserType)} className="grid grid-cols-2 gap-3">
              <div>
                <RadioGroupItem value="FAN" id="fan" className="peer sr-only" />
                <Label
                  htmlFor="fan"
                  className={`flex items-center justify-center h-16 rounded-xl border cursor-pointer transition-all ${
                    userType === "FAN"
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-background hover:bg-accent hover:text-accent-foreground"
                  }`}
                >
                  <span className="font-semibold text-base">FAN</span>
                </Label>
              </div>
              <div>
                <RadioGroupItem value="ARTIST" id="artist" className="peer sr-only" />
                <Label
                  htmlFor="artist"
                  className={`flex items-center justify-center h-16 rounded-xl border cursor-pointer transition-all ${
                    userType === "ARTIST"
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-background hover:bg-accent hover:text-accent-foreground"
                  }`}
                >
                  <span className="font-semibold text-base">ARTIST</span>
                </Label>
              </div>
            </RadioGroup>
          </div>

          <p className="text-sm text-muted-foreground leading-relaxed">
            자신을 홍보하고 싶은 아티스트가 아니라면 FAN을 눌러 가입하시면 됩니다.
          </p>
        </div>

        <Button onClick={handleNext} className="w-full h-14 text-base font-medium">
          다음
        </Button>
      </div>
    </div>
    </>
  );
};

export default SignupType;

