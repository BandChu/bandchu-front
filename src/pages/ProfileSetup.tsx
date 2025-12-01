import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ArrowLeft, Camera, User } from "lucide-react";

const profileSetupSchema = z.object({
  nickname: z.string().min(2, "닉네임은 최소 2자 이상이어야 합니다"),
});

type ProfileSetupValues = z.infer<typeof profileSetupSchema>;

const ProfileSetup = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewImage, setPreviewImage] = useState<string>("");

  const signupData = location.state as {
    email?: string;
    password?: string;
    userType?: "FAN" | "ARTIST";
  };

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
    try {
      // 프로필 설정 API 호출
      const profileData = {
        nickname: data.nickname,
        profileImageUrl: previewImage || "https://via.placeholder.com/150",
      };
      console.log("Profile setup data:", profileData);

      // 회원가입 API 호출
      const signupData_final = {
        email: signupData.email,
        password: signupData.password,
        nickname: data.nickname,
        role: signupData.userType || "FAN",
      };
      console.log("Final signup data:", signupData_final);

      // 회원가입 완료 후 로그인 페이지로 이동
      navigate("/login");
    } catch (error) {
      console.error("Profile setup error:", error);
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
            onClick={() => navigate("/signup/form")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">프로필 설정</h1>
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
  );
};

export default ProfileSetup;

