import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";

const Header = () => {
  return (
    <header className="sticky top-0 z-50 bg-background border-b border-border px-6 py-4">
      <div className="flex items-center justify-between max-w-screen-xl mx-auto">
        <h1 className="text-2xl font-bold text-foreground">BANDCHU</h1>
        <Button variant="ghost" size="icon">
          <Search className="h-5 w-5" />
        </Button>
      </div>
    </header>
  );
};

export default Header;
