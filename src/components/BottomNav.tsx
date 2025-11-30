import { NavLink } from "@/components/NavLink";
import { Calendar, Users, LayoutGrid, MessageCircle, User } from "lucide-react";

const BottomNav = () => {
  const navItems = [
    { to: "/", icon: Calendar, label: "Calendar" },
    { to: "/community", icon: Users, label: "Community" },
    { to: "/feed", icon: LayoutGrid, label: "Feed" },
    { to: "/chatting", icon: MessageCircle, label: "Chatting" },
    { to: "/my", icon: User, label: "My" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background border-t border-border z-50">
      <div className="max-w-screen-xl mx-auto flex justify-around items-center h-16">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className="flex flex-col items-center justify-center flex-1 h-full gap-1 text-muted-foreground transition-colors"
            activeClassName="text-primary"
          >
            <item.icon className="w-5 h-5" />
            <span className="text-xs">{item.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
};

export default BottomNav;
