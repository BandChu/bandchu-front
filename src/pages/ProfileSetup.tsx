import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ArrowLeft, Camera, User, X } from "lucide-react";
import { setupProfile, deleteAccount } from "@/lib/api/auth";
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

const profileSetupSchema = z.object({
  nickname: z.string().min(2, "닉네임은 최소 2자 이상이어야 합니다"),
});

type ProfileSetupValues = z.infer<typeof profileSetupSchema>;

const ProfileSetup = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewImage, setPreviewImage] = useState<string>("");
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const isGoogleSignup = (location.state as { isGoogleSignup?: boolean })?.isGoogleSignup || false;

  const form = useForm<ProfileSetupValues>({
    resolver: zodResolver(profileSetupSchema),
    defaultValues: {
      nickname: "",
    },
  });

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const imageUrl = reader.result as string;
        setPreviewImage(imageUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data: ProfileSetupValues) => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      toast.error('인증 토큰이 없습니다. 다시 로그인해주세요.');
      navigate('/login');
      return;
    }
    
    try {
      const requestData: { nickname: string; profileImageUrl?: string } = {
        nickname: data.nickname,
      };
      
      // 프로필 이미지가 있을 때만 추가
      if (previewImage) {
        requestData.profileImageUrl = previewImage;
      }
      
      const profileResponse = await setupProfile(requestData);
      // 프로필 설정 완료 후 사용자 정보 저장
      localStorage.setItem('userNickname', profileResponse.nickname);
      if (profileResponse.profileImageUrl) {
        localStorage.setItem('userProfileImage', profileResponse.profileImageUrl);
      }
      
      // 구글 회원가입인 경우 회원가입 완료 메시지 표시
      if (isGoogleSignup) {
        toast.success('회원가입이 완료되었습니다!');
      } else {
        toast.success('프로필 설정이 완료되었습니다.');
      }
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
        '프로필 설정에 실패했습니다.';
      
      toast.error(errorMessage);
    }
  };

  const handleBackClick = () => {
    // 뒤로가기: 이전 단계로 이동 (역할 재선택 가능)
    if (isGoogleSignup) {
      navigate("/signup/type", { state: { isGoogleSignup: true } });
    } else {
      navigate("/signup/form");
    }
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
    } else {
      // 일반 회원가입인 경우도 백엔드에서 회원 삭제
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
        <div className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10"
              onClick={handleBackClick}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-bold">프로필 설정</h1>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10"
            onClick={() => setIsCancelDialogOpen(true)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

      {/* Form Section */}
      <div className="flex-1 flex flex-col justify-between pb-8">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Profile Image */}
            <div className="flex flex-col items-center gap-4 mb-6">
              <Avatar className="w-24 h-24">
                {previewImage ? (
                  <AvatarImage src={previewImage} alt="Profile" />
                ) : (
                  <AvatarFallback className="bg-muted">
                    <User className="w-12 h-12 text-muted-foreground" />
                  </AvatarFallback>
                )}
              </Avatar>
              <Button
                type="button"
                variant="outline"
                className="rounded-xl"
                onClick={() => fileInputRef.current?.click()}
              >
                <Camera className="w-4 h-4 mr-2" />
                사진 선택
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageSelect}
              />
            </div>

            <FormField
              control={form.control}
              name="nickname"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium mb-2.5 block text-foreground">닉네임</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="닉네임을 입력하세요" 
                      className="h-14 text-base border-border rounded-xl bg-background focus-visible:ring-2 focus-visible:ring-primary/20"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage className="text-sm mt-1.5" />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full h-14 text-base font-medium rounded-xl">
              완료
            </Button>
          </form>
        </Form>
      </div>
    </div>
    </>
  );
};

export default ProfileSetup;

