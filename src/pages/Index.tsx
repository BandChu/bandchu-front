import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { isSameDay } from "date-fns";
import Header from "@/components/Header";
import ArtistCarousel from "@/components/ArtistCarousel";
import Calendar from "@/components/Calendar";
import EventList from "@/components/EventList";
import BottomNav from "@/components/BottomNav";
import MyArtistProfile from "./MyArtistProfile";
import { Loader2 } from "lucide-react";
import { getSubscribedConcerts } from "@/lib/api/subscription";
import { SubscribedConcertsResponse, ArtistWithConcerts } from "@/types/subscribedConcerts";
import { CalendarEvent } from "@/types/calendarEvent";
import { getTicketVendor } from "@/lib/utils";

const transformDataToCalendarEvents = (data: SubscribedConcertsResponse): CalendarEvent[] => {
  const events: CalendarEvent[] = [];
  if (!data.artists) return events;

  data.artists.forEach((artist) => {
    artist.concerts.forEach((concert) => {
      concert.performingSchedule.forEach(schedule => {
        events.push({
          type: 'performance', artistId: artist.artistId, artistName: artist.name,
          profileImageUrl: artist.profileImageUrl, date: schedule.date, title: concert.title,
          place: concert.place, bookingUrl: concert.bookingUrl, posterImageUrl: concert.posterImageUrl,
          concertId: concert.concertId, scheduleId: schedule.id,
        });
      });
      // 2. 예매일정 이벤트 추가
      if (concert.bookingSchedule && concert.bookingSchedule !== 'null') {
        events.push({
          type: 'booking',
          artistId: artist.artistId,
          artistName: artist.name,
          profileImageUrl: artist.profileImageUrl,
          date: concert.bookingSchedule,
          title: `${concert.title} 예매`,
          vendor: getTicketVendor(concert.bookingUrl),
          bookingUrl: concert.bookingUrl,
          posterImageUrl: concert.posterImageUrl,
          concertId: concert.concertId,
          scheduleId: concert.concertId,
        });
      }
    });
  });
  return events;
};

const FanHome = () => {
  const location = useLocation();
  const [allEvents, setAllEvents] = useState<CalendarEvent[]>([]);
  const [subscribedArtists, setSubscribedArtists] = useState<ArtistWithConcerts[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedArtistIds, setSelectedArtistIds] = useState<number[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());

  useEffect(() => {
    const loadSubscribedData = async () => {
      setLoading(true);
      try {
        const response = await getSubscribedConcerts();
        
        if (response && response.artists) {
          const transformedEvents = transformDataToCalendarEvents(response);
          setAllEvents(transformedEvents);
          setSubscribedArtists(response.artists);
        } else {
          setAllEvents([]);
          setSubscribedArtists([]);
        }
      } catch (error) {
        console.error("Failed to load subscribed data:", error);
        setAllEvents([]);
        setSubscribedArtists([]);
      } finally {
        setLoading(false);
      }
    };
    
    // 초기 로드
    loadSubscribedData();
    
    // 페이지 포커스 시 데이터 다시 로드 (구독/취소 후 홈으로 돌아왔을 때 업데이트)
    const handleFocus = () => {
      loadSubscribedData();
    };
    
    // 페이지 가시성 변경 시 데이터 다시 로드 (탭 전환 등)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        loadSubscribedData();
      }
    };
    
    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // 홈 페이지로 돌아올 때마다 데이터 다시 로드
  useEffect(() => {
    if (location.pathname === '/') {
      const loadSubscribedData = async () => {
        try {
          const response = await getSubscribedConcerts();
          if (response && response.artists) {
            const transformedEvents = transformDataToCalendarEvents(response);
            setAllEvents(transformedEvents);
            setSubscribedArtists(response.artists);
          } else {
            setAllEvents([]);
            setSubscribedArtists([]);
          }
        } catch (error) {
          console.error("Failed to load subscribed data:", error);
        }
      };
      loadSubscribedData();
    }
  }, [location.pathname]);

  const filteredEvents = selectedArtistIds.length > 0
    ? allEvents.filter(event => selectedArtistIds.includes(event.artistId))
    : allEvents;

  const eventDates = Array.from(new Set(filteredEvents.map(e => e.date.split('T')[0])));

  // 선택된 날짜에 해당하는 이벤트 목록 (isSameDay로 안정성 개선)
  const eventsForSelectedDate = selectedDate
    ? filteredEvents.filter(event => isSameDay(new Date(event.date), selectedDate))
    : [];

  const handleArtistToggle = (artistId: number) => {
    setSelectedArtistIds((prev) => prev.includes(artistId) ? prev.filter((id) => id !== artistId) : [...prev, artistId]);
  };

  const handleClearSelection = () => {
    setSelectedArtistIds([]);
  };

  return (
    <>
      <Header />
      <main className="max-w-screen-xl mx-auto">
        <ArtistCarousel 
          artists={subscribedArtists}
          onArtistToggle={handleArtistToggle} 
          selectedArtistIds={selectedArtistIds} 
        />
        <Calendar 
          events={filteredEvents}
          selectedDate={selectedDate}
          onDateSelect={setSelectedDate}
          subscribedArtists={subscribedArtists}
          selectedArtistIds={selectedArtistIds}
          onClearSelection={handleClearSelection}
        />
        <div className="h-4 bg-muted/30" />
        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
        ) : (
          <EventList events={eventsForSelectedDate} />
        )}
      </main>
    </>
  );
};

const Index = () => {
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const role = localStorage.getItem('userRole');
    setUserRole(role);
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {userRole === 'ARTIST' ? <MyArtistProfile /> : <FanHome />}
      <BottomNav />
    </div>
  );
};

export default Index;
