import { useState, useEffect } from "react";
import Header from "@/components/Header";
import ArtistCarousel from "@/components/ArtistCarousel";
import Calendar from "@/components/Calendar";
import EventList from "@/components/EventList";
import BottomNav from "@/components/BottomNav";
import { getAllEventDates } from "@/data/artistSchedules";
import { getSubscriptions } from "@/lib/api/subscription";
import { getEventsByDate } from "@/data/artistEvents";
import { CalendarEvent } from "@/types/calendarEvent";
import MyArtistProfile from "./MyArtistProfile";
import { Loader2 } from "lucide-react";

const Index = () => {
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loadingRole, setLoadingRole] = useState(true);

  const [selectedArtistIds, setSelectedArtistIds] = useState<number[]>([]);
  const [subscribedArtistIds, setSubscribedArtistIds] = useState<number[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  
  useEffect(() => {
    const role = localStorage.getItem('userRole');
    setUserRole(role);
    setLoadingRole(false);
  }, []);

  const eventDates = selectedArtistIds.length > 0
    ? getAllEventDates()
    : [];
  
  const selectedDateEvents: CalendarEvent[] = selectedDate && selectedArtistIds.length > 0
    ? getEventsByDate(selectedDate, selectedArtistIds)
    : [];

  useEffect(() => {
    // 이 useEffect는 FAN 역할일 때만 실행
    if (userRole === 'FAN' || userRole === null) {
      const loadSubscriptions = async () => {
        const token = localStorage.getItem('accessToken');
        if (!token) {
          setSubscribedArtistIds([]);
          return;
        }

        try {
          const subscriptions = await getSubscriptions();
          const subscribedIds = subscriptions.map(s => s.artiProfileId);
          setSubscribedArtistIds(subscribedIds);
        } catch (error) {
          console.error('구독 목록 로드 실패:', error);
          setSubscribedArtistIds([]);
        }
      };

      loadSubscriptions();

      const handleSubscriptionChange = () => {
        loadSubscriptions();
      };

      window.addEventListener('subscriptionChanged', handleSubscriptionChange);
      return () => {
        window.removeEventListener('subscriptionChanged', handleSubscriptionChange);
      };
    }
  }, [userRole]); // userRole이 변경될 때도 실행되도록 의존성 추가

  const handleArtistToggle = (artistId: number) => {
    setSelectedArtistIds((prev) => {
      if (prev.includes(artistId)) {
        return prev.filter((id) => id !== artistId);
      } else {
        return [...prev, artistId];
      }
    });
  };

  const handleClearSelection = () => {
    setSelectedArtistIds([]);
  };

  // 역할 확인 중일 때 로딩 상태 표시
  if (loadingRole) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // userRole에 따라 다른 컴포넌트 렌더링
  if (userRole === 'ARTIST') {
    return <MyArtistProfile />;
  }

  // 기본값은 FAN 뷰
  return (
    <div className="min-h-screen bg-background pb-20">
      <Header />
      <main className="max-w-screen-xl mx-auto">
        <ArtistCarousel 
          onArtistToggle={handleArtistToggle} 
          selectedArtistIds={selectedArtistIds} 
        />
        <Calendar 
          eventDates={eventDates} 
          selectedArtistIds={selectedArtistIds}
          onClearSelection={handleClearSelection}
          subscribedArtistIds={subscribedArtistIds}
          onDateSelect={setSelectedDate}
        />
        <div className="h-4 bg-muted/30" />
        <EventList events={selectedDateEvents} />
      </main>
      <BottomNav />
    </div>
  );
};

export default Index;