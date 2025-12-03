import { useState } from "react";
import { ChevronLeft, ChevronRight, X, CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getArtistName, getArtistsByDate, getArtistColor } from "@/data/artistSchedules";

interface CalendarProps {
  onDateSelect?: (date: Date) => void;
  eventDates?: number[];
  selectedArtistIds?: number[];
  onClearSelection?: () => void;
  subscribedArtistIds?: number[];
}

const Calendar = ({ onDateSelect, eventDates = [], selectedArtistIds = [], onClearSelection, subscribedArtistIds = [] }: CalendarProps) => {
  const now = new Date();
  const [currentDate, setCurrentDate] = useState(new Date(now.getFullYear(), now.getMonth(), 1));
  const [selectedDate, setSelectedDate] = useState<number | null>(null);

  const daysOfWeek = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
  
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const prevMonthDays = new Date(year, month, 0).getDate();
    
    // 모든 달에 대해 5주(35일)까지만 표시
    const maxDays = 35;
    
    const days: (number | null)[] = [];
    
    // Previous month days
    for (let i = firstDay - 1; i >= 0; i--) {
      days.push(prevMonthDays - i);
    }
    
    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }
    
    // Next month days (only if we need to fill up to maxDays)
    const remainingDays = maxDays - days.length;
    if (remainingDays > 0) {
      for (let i = 1; i <= remainingDays; i++) {
        days.push(i);
      }
    }
    
    return { days, firstDay, daysInMonth };
  };

  const { days, firstDay, daysInMonth } = getDaysInMonth(currentDate);
  
  // 실제 오늘 날짜 확인
  const isToday = (day: number): boolean => {
    const today = new Date();
    return (
      currentDate.getFullYear() === today.getFullYear() &&
      currentDate.getMonth() === today.getMonth() &&
      day === today.getDate()
    );
  };

  const goToPrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };


  const handleDateClick = (day: number, isCurrentMonth: boolean) => {
    if (isCurrentMonth) {
      const clickedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      setSelectedDate(day);
      onDateSelect?.(clickedDate);
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
        <div className="flex items-center gap-2 ml-4">
          <div className="flex flex-col items-center group">
            <Button 
              variant="outline" 
              size="icon" 
              onClick={goToPrevMonth} 
              className="h-10 w-10 border-border/50 hover:bg-muted/60 hover:border-primary/30 transition-all"
              aria-label="이전 달"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <span className="text-[10px] text-muted-foreground mt-1 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              이전 달
            </span>
          </div>
          <div className="flex flex-col items-center group">
            <Button 
              variant="outline" 
              size="icon" 
              onClick={goToNextMonth} 
              className="h-10 w-10 border-border/50 hover:bg-muted/60 hover:border-primary/30 transition-all"
              aria-label="다음 달"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
            <span className="text-[10px] text-muted-foreground mt-1 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              다음 달
            </span>
          </div>
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
          {subscribedArtistIds.length === 0 ? (
            <>
              <p className="text-base font-medium text-foreground mb-1.5">
                구독한 아티스트가 없습니다
              </p>
              <p className="text-sm text-muted-foreground">
                아티스트를 구독하면 일정을 확인할 수 있어요
              </p>
            </>
          ) : (
            <>
              <p className="text-base font-medium text-foreground mb-1.5">
                아티스트를 선택하면 일정을 확인할 수 있어요
              </p>
              <p className="text-sm text-muted-foreground">
                상단의 아티스트를 클릭해보세요
              </p>
            </>
          )}
        </div>
      )}
      
      {selectedArtistIds.length > 0 && (
        <div className="grid grid-cols-7 gap-0.5 bg-gray-50/50 p-1 rounded-2xl">
          {days.map((day, index) => {
            const isCurrentMonth = 
              (index >= firstDay && index < firstDay + daysInMonth);
            const isWeek5OrLater = index >= 28; // 5주차 이후 (28일부터)
            const isOtherMonthInWeek5 = isWeek5OrLater && !isCurrentMonth; // 5주차 이후의 다른 달 날짜
            const todayCheck = day !== null && isCurrentMonth ? isToday(day) : false;
            const isWeekend = index % 7 === 0 || index % 7 === 6;
            const isSelected = selectedDate === day && isCurrentMonth;
            
            // 선택된 아티스트의 일정만 표시 (현재는 12월 데이터만 있으므로 12월일 때만 표시)
            const artistsOnDate = day !== null && isCurrentMonth && currentDate.getMonth() === 11 
              ? getArtistsByDate(day) 
              : [];
            const filteredArtists = artistsOnDate.filter((id) => selectedArtistIds.includes(id));
            
            const hasEvent = filteredArtists.length > 0;
          
          return (
            <button
              key={index}
              onClick={() => day !== null && handleDateClick(day, isCurrentMonth)}
              className={`
                aspect-square rounded-lg flex flex-col items-start p-1.5 text-sm font-medium
                transition-all duration-150 relative group
                ${!isCurrentMonth ? "text-gray-300 opacity-50" : ""}
                ${isOtherMonthInWeek5 ? "opacity-30" : ""}
                ${isWeekend && isCurrentMonth ? "text-gray-500" : isCurrentMonth ? "text-gray-700" : ""}
                ${todayCheck ? "bg-primary/10 border border-primary/30" : ""}
                ${isSelected && !todayCheck ? "bg-primary/5 border border-primary/20" : ""}
                ${!hasEvent && isCurrentMonth && !todayCheck && !isSelected ? "hover:bg-gray-100/60" : ""}
                ${hasEvent && !todayCheck ? "hover:bg-gray-100/50" : ""}
              `}
            >
              <div className="flex items-center justify-center w-full mb-0.5">
                <span className={`text-sm ${
                  todayCheck ? "font-bold text-primary" 
                  : isSelected ? "font-semibold text-gray-900" 
                  : isCurrentMonth ? "font-semibold text-gray-800"
                  : "font-medium text-gray-400"
                }`}>
                  {day}
                </span>
              </div>
              {hasEvent && (
                <div className="w-full space-y-0.5 mt-0.5 flex-1 overflow-hidden">
                  {filteredArtists.slice(0, 2).map((artistId) => {
                    const artistName = getArtistName(artistId);
                    const color = getArtistColor(artistId);
                    return (
                      <div
                        key={artistId}
                        className={`text-[10px] px-2 py-1 rounded truncate font-semibold text-white ${color} shadow-sm`}
                        style={{ 
                          textShadow: '0 1px 2px rgba(0,0,0,0.3)',
                        }}
                        title={artistName || ""}
                      >
                        {/* {artistName} */}
                      </div>
                    );
                  })}
                  {filteredArtists.length > 2 && (
                    <div className="text-[10px] px-2 py-1 rounded bg-gray-400 text-white font-semibold truncate shadow-sm">
                      +{filteredArtists.length - 2}
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
