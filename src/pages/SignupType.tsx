import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Users, Mic } from "lucide-react";
import { updateMemberRole, deleteAccount } from "@/lib/api/auth";
import { toast } from "sonner";

type UserType = "FAN" | "ARTIST";

const SignupType = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [userType, setUserType] = useState<UserType>("FAN");
  const isGoogleSignup = (location.state as { isGoogleSignup?: boolean })?.isGoogleSignup || false;

  const handleNext = async () => {
    // 구글 회원가입인 경우 role을 백엔드에 업데이트
    if (isGoogleSignup) {
      try {
        const response = await updateMemberRole({ role: userType });
        // localStorage에 role 업데이트 (백엔드 응답에서 받은 role 사용)
        localStorage.setItem('userRole', response.role);
        
        toast.success('회원 유형이 설정되었습니다.');
        navigate("/signup/profile", { state: { userType: response.role, isGoogleSignup: true } });
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
      // 일반 회원가입인 경우: 역할 선택 후 프로필 설정으로 이동
      // 역할 업데이트는 프로필 설정 완료 후 처리하거나, 여기서 바로 업데이트
      try {
        const response = await updateMemberRole({ role: userType });
        localStorage.setItem('userRole', response.role);
        toast.success('회원 유형이 설정되었습니다.');
        navigate("/signup/profile", { state: { userType: response.role, isGoogleSignup: false } });
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
    }
  };

  const handleBackClick = () => {
    // 구글 회원가입인 경우 바로 취소 처리 (역할 선택이 시작이므로 확인 다이얼로그 없이)
    if (isGoogleSignup) {
      handleCancelSignup();
    } else {
      // 일반 회원가입인 경우: 아이디/비밀번호 페이지로 돌아가기 (취소 다이얼로그 없이)
      navigate("/signup/form");
    }
  };

  const handleCancelSignup = async () => {
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
    } else {
      // 일반 회원가입인 경우도 백엔드에서 회원 삭제 (이미 회원가입 완료된 경우)
      try {
        const token = localStorage.getItem('accessToken');
        if (token) {
          await deleteAccount();
        }
      } catch (error: any) {
        console.error('회원 삭제 실패:', error);
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
  );
};

export default SignupType;

