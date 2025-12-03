import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight, X, CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CalendarEvent } from "@/types/calendarEvent";
import { ArtistWithConcerts } from "@/types/subscribedConcerts";
import { format, isSameDay, isSameMonth, isToday as isTodayDateFns, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays } from "date-fns";

interface CalendarProps {
  events?: CalendarEvent[];
  subscribedArtists?: ArtistWithConcerts[];
  selectedArtistIds?: number[];
  selectedDate: Date | null;
  onDateSelect: (date: Date) => void;
  onClearSelection?: () => void;
}

const Calendar = ({ 
  events = [], 
  subscribedArtists = [], 
  selectedArtistIds = [], 
  selectedDate,
  onDateSelect, 
  onClearSelection 
}: CalendarProps) => {
  const [currentMonth, setCurrentMonth] = useState(startOfMonth(new Date()));

  const daysOfWeek = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

  // 아티스트 이름을 빠르게 찾기 위한 Map
  const artistNameMap = useMemo(() => {
    const map = new Map<number, string>();
    subscribedArtists.forEach(artist => {
      map.set(artist.artistId, artist.name);
    });
    return map;
  }, [subscribedArtists]);

  // 날짜별로 이벤트가 있는 아티스트 ID 목록을 그룹화
  const eventsByDate = useMemo(() => {
    const map = new Map<string, number[]>();
    events.forEach(event => {
      try {
        const dateKey = format(new Date(event.date), "yyyy-MM-dd");
        if (!map.has(dateKey)) {
          map.set(dateKey, []);
        }
        const artistsOnDay = map.get(dateKey)!;
        if (!artistsOnDay.includes(event.artistId)) {
          artistsOnDay.push(event.artistId);
        }
      } catch (e) {
        console.warn("Invalid date in event for calendar:", event);
      }
    });
    return map;
  }, [events]);

  const goToPrevMonth = () => setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  const goToNextMonth = () => setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));

  const renderCells = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const rows = [];
    let days = [];
    let day = startDate;

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        const dayClone = new Date(day);
        const dateKey = format(dayClone, "yyyy-MM-dd");
        const dayOfMonth = format(dayClone, "d");
        
        const isCurrentMonth = isSameMonth(dayClone, currentMonth);
        const isSelected = selectedDate ? isSameDay(dayClone, selectedDate) : false;
        const isToday = isTodayDateFns(dayClone);
        const isWeekend = dayClone.getDay() === 0 || dayClone.getDay() === 6;

        const artistsOnDate = eventsByDate.get(dateKey) || [];
        const hasEvent = artistsOnDate.length > 0;

        days.push(
          <button
            key={dayClone.toString()}
            onClick={() => onDateSelect(dayClone)}
            className={`aspect-square rounded-lg flex flex-col items-start p-1.5 text-sm font-medium transition-all duration-150 relative group ${!isCurrentMonth ? "text-gray-300 opacity-50" : ""} ${isWeekend && isCurrentMonth ? "text-gray-500" : isCurrentMonth ? "text-gray-700" : ""} ${isToday ? "bg-primary/10 border border-primary/30" : ""} ${isSelected && !isToday ? "bg-primary/5 border border-primary/20" : ""} ${!hasEvent && isCurrentMonth && !isToday && !isSelected ? "hover:bg-gray-100/60" : ""} ${hasEvent && !isToday ? "hover:bg-gray-100/50" : ""}`}
          >
            <div className="flex items-center justify-center w-full mb-0.5">
              <span className={`text-sm ${isToday ? "font-bold text-primary" : isSelected ? "font-semibold text-gray-900" : isCurrentMonth ? "font-semibold text-gray-800" : "font-medium text-gray-400"}`}>
                {dayOfMonth}
              </span>
            </div>
            {hasEvent && (
              <div className="w-full space-y-0.5 mt-0.5 flex-1 overflow-hidden">
                {/* 색상 로직 제거: 모든 점을 단일 색상으로 표시 */}
                {artistsOnDate.slice(0, 2).map((artistId) => (
                  <div key={artistId} className="h-1.5 w-full rounded-full bg-primary/70" title={artistNameMap.get(artistId) || ""}></div>
                ))}
                {artistsOnDate.length > 2 && <div className="text-[10px] text-center text-primary/80 font-semibold">+{artistsOnDate.length - 2}</div>}
              </div>
            )}
          </button>
        );
        day = addDays(day, 1);
      }
      rows.push(<div key={day.toString()} className="grid grid-cols-7 gap-0.5 bg-gray-50/50 p-1 rounded-2xl">{days}</div>);
      days = [];
    }
    return <div>{rows}</div>;
  };

  if (subscribedArtists.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-16 h-16 rounded-full bg-muted/30 flex items-center justify-center mb-4"><CalendarDays className="w-8 h-8 text-muted-foreground/50" /></div>
        <p className="text-base font-medium text-foreground mb-1.5">구독한 아티스트가 없습니다</p>
        <p className="text-sm text-muted-foreground">아티스트를 구독하면 일정을 확인할 수 있어요</p>
      </div>
    );
  }

  return (
    <div className="px-6 py-6">
      <div className="flex items-start justify-between mb-8">
        <div className="flex-1">
          <h2 className="text-3xl font-bold text-foreground mb-1 tracking-tight">{format(currentMonth, "yyyy.MM")}.</h2>
          {selectedArtistIds.length > 0 && (
            <div className="flex items-center gap-2 mt-3 flex-wrap">
              {selectedArtistIds.map(artistId => (
                <div key={artistId} className="flex items-center gap-1.5 group bg-gray-100 rounded-full px-2 py-1">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                  <span className="text-sm font-medium text-foreground">{artistNameMap.get(artistId) || ''}</span>
                </div>
              ))}
              {onClearSelection && <button onClick={onClearSelection} className="ml-1 p-1.5 rounded-lg hover:bg-muted/50 transition-colors group" aria-label="선택 해제"><X className="w-3.5 h-3.5 text-muted-foreground group-hover:text-foreground transition-colors" /></button>}
            </div>
          )}
        </div>
        <div className="flex items-center gap-2 ml-4">
          <Button variant="outline" size="icon" onClick={goToPrevMonth} className="h-10 w-10 border-border/50 hover:bg-muted/60 hover:border-primary/30 transition-all" aria-label="이전 달"><ChevronLeft className="h-5 w-5" /></Button>
          <Button variant="outline" size="icon" onClick={goToNextMonth} className="h-10 w-10 border-border/50 hover:bg-muted/60 hover:border-primary/30 transition-all" aria-label="다음 달"><ChevronRight className="h-5 w-5" /></Button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-0 mb-2">
        {daysOfWeek.map((day, index) => <div key={day} className={`text-xs font-semibold text-center py-3 ${index === 0 ? "text-red-500" : index === 6 ? "text-blue-500" : "text-muted-foreground"}`}>{day}</div>)}
      </div>
      {renderCells()}
    </div>
  );
};

export default Calendar;
