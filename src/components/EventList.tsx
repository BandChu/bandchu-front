import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { CalendarEvent } from "@/types/calendarEvent";
import { useMemo } from "react";
import { format } from "date-fns";
import { Mic, CalendarDays, Ticket } from "lucide-react";
import EmptyState from "./EmptyState";

interface EventListProps {
  events: CalendarEvent[];
}

const EventList = ({ events = [] }: EventListProps) => {
  const navigate = useNavigate();

  const groupedEvents = useMemo(() => {
    if (!events || events.length === 0) {
      return {};
    }
    return events.reduce((acc, event) => {
      if (!acc[event.artistId]) {
        acc[event.artistId] = {
          artistId: event.artistId,
          artistName: event.artistName,
          artistProfileImageUrl: event.posterImageUrl, 
          events: [],
        };
      }
      acc[event.artistId].events.push(event);
      return acc;
    }, {} as Record<number, { artistId: number; artistName: string; artistProfileImageUrl: string; events: CalendarEvent[] }>);
  }, [events]);

  if (events.length === 0) {
    return <EmptyState icon={CalendarDays} message="선택된 날짜에 일정이 없습니다." />;
  }

  return (
    <div className="px-6 py-4 space-y-6">
      {Object.values(groupedEvents).map((group) => (
        <div key={group.artistId}>
          <div 
            className="flex items-center gap-3 mb-4 cursor-pointer"
            onClick={() => navigate(`/artist/${group.artistId}`)}
          >
            <h3 className="text-lg font-bold text-foreground hover:text-primary transition-colors">
              {group.artistName}
            </h3>
          </div>
          <div className="space-y-4">
            {group.events.map((event) => {
              const isBooking = event.type === 'booking';
              const Icon = isBooking ? Ticket : Mic;
              const date = new Date(event.date);
              const timeString = date.getUTCHours() === 0 && date.getUTCMinutes() === 0 ? '' : format(date, 'HH:mm');

              return (
                <Card 
                  key={`${event.concertId}-${event.type}-${event.scheduleId}`} 
                  className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => {
                    if (isBooking) {
                      window.open(event.bookingUrl, '_blank', 'noopener,noreferrer');
                    } else {
                      navigate(`/concert/${event.concertId}`)
                    }
                  }}
                >
                  <div className="flex gap-4 p-4">
                    <div className="w-20 h-20 rounded-lg bg-muted flex-shrink-0 flex items-center justify-center overflow-hidden">
                      {event.posterImageUrl ? (
                        <img src={event.posterImageUrl} alt={event.title} className="w-full h-full object-cover" />
                      ) : (
                        <Icon className="w-8 h-8 text-muted-foreground/50" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                      <p className="text-sm font-semibold text-primary mb-1">
                        {format(date, 'MM.dd (E)')} {timeString}
                      </p>
                      <h4 className="font-semibold text-foreground mb-1.5 truncate">
                        {event.title}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {isBooking 
                          ? `예매일정 ${event.vendor ? `| ${event.vendor}` : ''}`
                          : `콘서트 | ${event.place}`
                        }
                      </p>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

export default EventList;
