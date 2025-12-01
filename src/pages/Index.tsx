import { useState, useEffect, useMemo } from "react";
import Header from "@/components/Header";
import ArtistCarousel from "@/components/ArtistCarousel";
import Calendar from "@/components/Calendar";
import EventList from "@/components/EventList";
import BottomNav from "@/components/BottomNav";
import apiClient from "@/lib/api";
import { SubscribedArtistWithConcerts } from "@/types/subscribedConcerts";
import { CalendarEvent } from "@/types/calendarEvent";
import { format, isSameDay } from 'date-fns';

const Index = () => {
  const [artists, setArtists] = useState<SubscribedArtistWithConcerts[]>([]);
  const [selectedArtistIds, setSelectedArtistIds] = useState<number[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  useEffect(() => {
    const fetchConcerts = async () => {
      try {
        const response = await apiClient.get<{ success: boolean; data: { artists: SubscribedArtistWithConcerts[] }; message: string }>(
          "/api/concerts/subscribed"
        );
        if (response.data.success) {
          setArtists(response.data.data.artists);
        } else {
          console.error("Failed to fetch subscribed concerts:", response.data.message);
        }
      } catch (error) {
        console.error("Failed to fetch subscribed concerts:", error);
      }
    };

    fetchConcerts();
  }, []);

  const allCalendarEvents = useMemo((): CalendarEvent[] => {
    return artists.flatMap(artist =>
      artist.concerts.flatMap(concert => {
        const performanceEvents: CalendarEvent[] = concert.performingSchedule.map(schedule => ({
          artistId: artist.artistId,
          artistName: artist.name,
          artistProfileImageUrl: artist.profileImageUrl,
          concertId: concert.concertId,
          scheduleId: schedule.id,
          date: format(new Date(schedule.date), 'yyyy-MM-dd'),
          dateTime: schedule.date,
          title: concert.title,
          place: concert.place,
          type: 'performance',
          bookingUrl: concert.bookingUrl,
          imageUrl: concert.imageUrl,
        }));

        const bookingEvent: CalendarEvent = {
          artistId: artist.artistId,
          artistName: artist.name,
          artistProfileImageUrl: artist.profileImageUrl,
          concertId: concert.concertId,
          date: format(new Date(concert.bookingSchedule), 'yyyy-MM-dd'),
          dateTime: concert.bookingSchedule,
          title: concert.title,
          place: '예매 일정',
          type: 'booking',
          bookingUrl: concert.bookingUrl,
          imageUrl: concert.imageUrl,
        };

        return [...performanceEvents, bookingEvent];
      })
    );
  }, [artists]);

  const filteredEvents = useMemo(() => {
    if (selectedArtistIds.length === 0) {
      return allCalendarEvents;
    }
    return allCalendarEvents.filter(event => selectedArtistIds.includes(event.artistId));
  }, [allCalendarEvents, selectedArtistIds]);

  const dailyEvents = useMemo(() => {
    if (!selectedDate) return [];
    return filteredEvents.filter(event => isSameDay(new Date(event.date), selectedDate));
  }, [filteredEvents, selectedDate]);

  const handleArtistSelect = (artistId: number) => {
    setSelectedArtistIds(prevIds => 
      prevIds.includes(artistId) 
        ? prevIds.filter(id => id !== artistId)
        : [...prevIds, artistId]
    );
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header />
      <main className="max-w-screen-xl mx-auto">
        <ArtistCarousel
          artists={artists}
          selectedArtistIds={selectedArtistIds}
          onArtistSelect={handleArtistSelect}
        />
        <Calendar
          events={filteredEvents}
          onDateSelect={handleDateSelect}
          selectedDate={selectedDate}
        />
        <div className="h-4 bg-muted/30" />
        <EventList events={dailyEvents} />
      </main>
      <BottomNav />
    </div>
  );
};

export default Index;
