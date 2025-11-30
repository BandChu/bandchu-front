import Header from "@/components/Header";
import ArtistCarousel from "@/components/ArtistCarousel";
import Calendar from "@/components/Calendar";
import EventList from "@/components/EventList";
import BottomNav from "@/components/BottomNav";

const Index = () => {
  return (
    <div className="min-h-screen bg-background pb-20">
      <Header />
      <main className="max-w-screen-xl mx-auto">
        <ArtistCarousel />
        <Calendar eventDates={[8, 10, 27, 28]} />
        <div className="h-4 bg-muted/30" />
        <EventList />
      </main>
      <BottomNav />
    </div>
  );
};

export default Index;
