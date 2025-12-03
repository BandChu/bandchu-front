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
import apiClient from "@/lib/api";
import { ArtistsApiResponse } from "@/types/artist";

const Index = () => {
  const [selectedArtistIds, setSelectedArtistIds] = useState<number[]>([]);
  const [subscribedArtistIds, setSubscribedArtistIds] = useState<number[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [artistNameMap, setArtistNameMap] = useState<Record<number, string>>({});
  
  // 선택된 아티스트가 없으면 빈 배열 (아무것도 표시 안 함)
  const eventDates = selectedArtistIds.length > 0
    ? getAllEventDates() // 선택된 아티스트들의 일정은 Calendar에서 필터링
    : [];
  
  // 선택된 날짜의 이벤트 가져오기
  const selectedDateEvents: CalendarEvent[] = selectedDate && selectedArtistIds.length > 0
    ? getEventsByDate(selectedDate, selectedArtistIds, artistNameMap)
    : [];

  useEffect(() => {
    const loadArtists = async () => {
      try {
        // API를 통해 실제 아티스트 목록 가져오기
        const response = await apiClient.get<ArtistsApiResponse>('/api/artists');
        if (response.data.success && response.data.data.artists) {
          const nameMap: Record<number, string> = {};
          response.data.data.artists.forEach(artist => {
            nameMap[artist.artistId] = artist.name;
          });
          setArtistNameMap(nameMap);
        }
      } catch (error: any) {
        console.warn('아티스트 목록 API 호출 실패:', error.message);
        // API 실패 시 빈 맵 사용 (하드코딩된 데이터로 폴백)
      }
    };

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

    loadArtists();
    loadSubscriptions();

    const handleSubscriptionChange = () => {
      loadSubscriptions();
    };

    window.addEventListener('subscriptionChanged', handleSubscriptionChange);
    return () => {
      window.removeEventListener('subscriptionChanged', handleSubscriptionChange);
    };
  }, []);

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
