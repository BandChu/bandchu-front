import { NavLink } from "@/components/NavLink";
import { Calendar, Users, LayoutGrid, MessageCircle, User, Music } from "lucide-react";
import { useEffect, useState } from "react";

const BottomNav = () => {
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const role = localStorage.getItem('userRole');
    setUserRole(role);
  }, []);

  const baseNavItems = [
    { to: "/community", icon: Users, label: "Community" },
    { to: "/feed", icon: LayoutGrid, label: "Feed" },
    { to: "/chatting", icon: MessageCircle, label: "Chatting" },
    { to: "/my", icon: User, label: "My" },
  ];

  const navItems = userRole === 'ARTIST'
    ? [
        { to: "/home", icon: Music, label: "Artist" },
        ...baseNavItems
      ]
    : [
        { to: "/home", icon: Calendar, label: "Calendar" },
        ...baseNavItems
      ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/98 backdrop-blur-2xl border-t border-purple-100/50 z-50 shadow-[0_-2px_20px_rgba(139,92,246,0.08)]">
      <div className="max-w-screen-xl mx-auto flex justify-around items-center h-[72px] px-3">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className="relative flex flex-col items-center justify-center flex-1 h-full gap-1.5 rounded-2xl transition-all duration-300 text-gray-400 hover:text-purple-600 hover:bg-purple-50/40 active:scale-95"
            activeClassName="text-purple-600 [&>svg]:scale-110 [&>svg]:text-purple-600 [&>span]:font-semibold [&>span]:text-purple-600 [&_.indicator]:opacity-100 [&_.bg-indicator]:opacity-100"
          >
            {/* 활성 상태 인디케이터 */}
            <div className="indicator absolute top-1.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-purple-500 opacity-0 transition-opacity duration-300" />
            
            <item.icon className="w-[22px] h-[22px] transition-all duration-300" />
            <span className="text-[11px] font-medium transition-all duration-300">{item.label}</span>
            
            {/* 활성 상태 배경 */}
            <div className="bg-indicator absolute inset-0 rounded-2xl bg-purple-50/30 opacity-0 transition-opacity duration-300 -z-10" />
          </NavLink>
        ))}
      </div>
    </nav>
  );
};

export default BottomNav;
