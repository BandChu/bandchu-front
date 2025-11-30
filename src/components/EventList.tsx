import { Card } from "@/components/ui/card";

interface Event {
  id: number;
  artist: string;
  title: string;
  date: string;
  location: string;
  category: string;
  image?: string;
}

const EventList = () => {
  const events: Event[] = [
    {
      id: 1,
      artist: "실리카겔",
      title: "2025 연말 콘서트 [어쩌구저쩌구]",
      date: "12.27(토) - 12.28(일)",
      location: "콘서트 | 일산 킨텍스",
      category: "concert",
    },
  ];

  return (
    <div className="px-6 py-4">
      <h3 className="text-lg font-bold text-foreground mb-4">실리카겔</h3>
      <div className="space-y-4">
        {events.map((event) => (
          <Card key={event.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            <div className="flex gap-4 p-4">
              <div className="w-20 h-20 rounded-lg bg-muted flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-muted-foreground mb-1">{event.date}</p>
                <h4 className="font-semibold text-foreground mb-1 truncate">
                  {event.title}
                </h4>
                <p className="text-sm text-muted-foreground">{event.location}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default EventList;
