import { Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Header = () => {
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-50 bg-background border-b border-border px-6 py-4">
      <div className="flex items-center justify-between max-w-screen-xl mx-auto">
        <h1 className="text-2xl font-bold text-foreground cursor-pointer" onClick={() => navigate("/")}>
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
