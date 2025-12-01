import { useState } from "react";
import Header from "@/components/Header";
import ArtistCarousel from "@/components/ArtistCarousel";
import Calendar from "@/components/Calendar";
import EventList from "@/components/EventList";
import BottomNav from "@/components/BottomNav";
import { getAllEventDates } from "@/data/artistSchedules";

const Index = () => {
  const [selectedArtistIds, setSelectedArtistIds] = useState<number[]>([]);
  
  // 선택된 아티스트가 없으면 빈 배열 (아무것도 표시 안 함)
  const eventDates = selectedArtistIds.length > 0
    ? getAllEventDates() // 선택된 아티스트들의 일정은 Calendar에서 필터링
    : [];

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
        />
        <div className="h-4 bg-muted/30" />
        <EventList />
      </main>
      <BottomNav />
    </div>
  );
};

export default Index;
