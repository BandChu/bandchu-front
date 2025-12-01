import { useState } from "react";
import { ChevronLeft, ChevronRight, X, CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getArtistName, getArtistsByDate, getArtistColor } from "@/data/artistSchedules";

interface CalendarProps {
  onDateSelect?: (date: Date) => void;
  eventDates?: number[];
  selectedArtistIds?: number[];
  onClearSelection?: () => void;
}

const Calendar = ({ onDateSelect, eventDates = [], selectedArtistIds = [], onClearSelection }: CalendarProps) => {
  const [currentDate, setCurrentDate] = useState(new Date(2025, 11, 1)); // December 2025
  const [selectedDate, setSelectedDate] = useState<number | null>(null);

  const daysOfWeek = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
  
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const prevMonthDays = new Date(year, month, 0).getDate();
    
    const days: (number | null)[] = [];
    
    // Previous month days
    for (let i = firstDay - 1; i >= 0; i--) {
      days.push(prevMonthDays - i);
    }
    
    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }
    
    // Next month days
    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      days.push(i);
    }
    
    return { days, firstDay, daysInMonth };
  };

  const { days, firstDay, daysInMonth } = getDaysInMonth(currentDate);
  const today = 8; // Based on the reference image

  const goToPrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date(2025, 11, 1));
  };

  const handleDateClick = (day: number, isCurrentMonth: boolean) => {
    if (isCurrentMonth) {
      setSelectedDate(day);
      onDateSelect?.(new Date(currentDate.getFullYear(), currentDate.getMonth(), day));
    }
  };

  return (
    <div className="px-6 py-6">
      <div className="flex items-start justify-between mb-8">
        <div className="flex-1">
          <h2 className="text-3xl font-bold text-foreground mb-1 tracking-tight">
            {currentDate.getFullYear()}.{(currentDate.getMonth() + 1).toString().padStart(2, '0')}.
          </h2>
          {selectedArtistIds.length > 0 && (
            <div className="flex items-center gap-2 mt-3 flex-wrap">
              {selectedArtistIds.map((artistId) => (
                <div
                  key={artistId}
                  className="flex items-center gap-1.5 group"
                >
                  <div className={`w-2 h-2 rounded-full ${getArtistColor(artistId)}`} />
                  <span className="text-sm font-medium text-foreground">
                    {getArtistName(artistId)}
                  </span>
                </div>
              ))}
              {onClearSelection && (
                <button
                  onClick={onClearSelection}
                  className="ml-1 p-1.5 rounded-lg hover:bg-muted/50 transition-colors group"
                  aria-label="선택 해제"
                >
                  <X className="w-3.5 h-3.5 text-muted-foreground group-hover:text-foreground transition-colors" />
                </button>
              )}
            </div>
          )}
        </div>
        <div className="flex items-center gap-1 ml-4">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={goToPrevMonth} 
            className="h-9 w-9 hover:bg-muted/50"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={goToToday} 
            className="h-9 px-4 text-xs font-medium border-border/50 hover:bg-muted/30"
          >
            오늘
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={goToNextMonth} 
            className="h-9 w-9 hover:bg-muted/50"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-0 mb-2">
        {daysOfWeek.map((day, index) => (
          <div
            key={day}
            className={`text-xs font-semibold text-center py-3 ${
              index === 0 ? "text-calendar-weekend" : index === 6 ? "text-primary" : "text-muted-foreground"
            }`}
          >
            {day}
          </div>
        ))}
      </div>

      {selectedArtistIds.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-full bg-muted/30 flex items-center justify-center mb-4">
            <CalendarDays className="w-8 h-8 text-muted-foreground/50" />
          </div>
          <p className="text-base font-medium text-foreground mb-1.5">
            아티스트를 선택하면 일정을 확인할 수 있어요
          </p>
          <p className="text-sm text-muted-foreground">
            상단의 아티스트를 클릭해보세요
          </p>
        </div>
      )}
      
      {selectedArtistIds.length > 0 && (
        <div className="grid grid-cols-7 gap-0.5 bg-muted/20 p-1 rounded-2xl">
          {days.map((day, index) => {
            const isCurrentMonth = 
              (index >= firstDay && index < firstDay + daysInMonth);
            const isToday = day === today && isCurrentMonth;
            const isWeekend = index % 7 === 0 || index % 7 === 6;
            const isSelected = selectedDate === day && isCurrentMonth;
            
            // 선택된 아티스트의 일정만 표시
            const artistsOnDate = day !== null && isCurrentMonth ? getArtistsByDate(day) : [];
            const filteredArtists = artistsOnDate.filter((id) => selectedArtistIds.includes(id));
            
            const hasEvent = filteredArtists.length > 0;
          
          return (
            <button
              key={index}
              onClick={() => day !== null && handleDateClick(day, isCurrentMonth)}
              className={`
                aspect-square rounded-xl flex flex-col items-center justify-center text-sm font-medium
                transition-all duration-150 relative group
                ${!isCurrentMonth ? "text-muted-foreground/10" : ""}
                ${isWeekend && isCurrentMonth ? "text-calendar-weekend" : isCurrentMonth ? "text-foreground" : ""}
                ${isToday ? "bg-primary/10" : ""}
                ${isSelected && !isToday ? "bg-muted/60 ring-1 ring-border" : ""}
                ${!hasEvent && isCurrentMonth && !isToday && !isSelected ? "hover:bg-muted/40" : ""}
                ${hasEvent && !isToday ? "hover:bg-muted/30" : ""}
              `}
            >
              <div className="flex flex-col items-center gap-0.5 relative z-10">
                <span className={`${isToday ? "font-bold text-primary" : isSelected ? "font-semibold" : ""}`}>
                  {day}
                </span>
                <span className={`text-[10px] font-medium ${isToday ? "text-primary" : "text-muted-foreground/0"}`}>
                  {isToday ? "오늘" : ""}
                </span>
              </div>
              {hasEvent && (
                <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-1 items-center justify-center flex-wrap max-w-[85%] z-10">
                  {filteredArtists.slice(0, 3).map((artistId) => (
                    <div
                      key={artistId}
                      className={`w-2 h-2 rounded-full ${getArtistColor(artistId)} shadow-sm`}
                      title={getArtistName(artistId) || ""}
                    />
                  ))}
                  {filteredArtists.length > 3 && (
                    <div className="w-2 h-2 rounded-full bg-muted-foreground/30 flex items-center justify-center">
                      <span className="text-[8px] text-muted-foreground font-bold">+</span>
                    </div>
                  )}
                </div>
              )}
            </button>
          );
        })}
        </div>
      )}
    </div>
  );
};

export default Calendar;
