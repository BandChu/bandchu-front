import { Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Header = () => {
  const navigate = useNavigate();

  const handleLogoClick = () => {
    // 로그인 상태 확인
    const accessToken = localStorage.getItem('accessToken');
    if (accessToken) {
      // 로그인되어 있으면 홈으로 이동
      navigate("/home");
    } else {
      // 로그인되어 있지 않으면 로그인 페이지로 이동
      navigate("/auth");
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-background border-b border-border px-6 py-4">
      <div className="flex items-center justify-between max-w-screen-xl mx-auto">
        <h1 className="text-2xl font-bold text-foreground cursor-pointer" onClick={handleLogoClick} style={{ fontFamily: '"Stereofidelic", sans-serif' }}>
          BANDCHU
        </h1>
        <Button variant="ghost" size="icon" onClick={() => navigate("/search")}>
          <Search className="h-5 w-5" />
        </Button>
      </div>
    </header>
  );
};

export default Header;
