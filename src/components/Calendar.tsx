import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CalendarProps {
  onDateSelect?: (date: Date) => void;
  eventDates?: number[];
}

const Calendar = ({ onDateSelect, eventDates = [8, 10, 27, 28] }: CalendarProps) => {
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
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-foreground">
          {currentDate.getFullYear()}.{(currentDate.getMonth() + 1).toString().padStart(2, '0')}.
        </h2>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={goToPrevMonth}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <Button variant="outline" size="sm" onClick={goToToday}>
            TODAY
          </Button>
          <Button variant="ghost" size="icon" onClick={goToNextMonth}>
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2 mb-2">
        {daysOfWeek.map((day, index) => (
          <div
            key={day}
            className={`text-xs font-medium text-center py-2 ${
              index === 0 ? "text-calendar-weekend" : index === 6 ? "text-primary" : "text-foreground"
            }`}
          >
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2">
        {days.map((day, index) => {
          const isCurrentMonth = 
            (index >= firstDay && index < firstDay + daysInMonth);
          const isToday = day === today && isCurrentMonth;
          const hasEvent = day !== null && eventDates.includes(day) && isCurrentMonth;
          const isWeekend = index % 7 === 0 || index % 7 === 6;
          
          return (
            <button
              key={index}
              onClick={() => day !== null && handleDateClick(day, isCurrentMonth)}
              className={`
                aspect-square rounded-full flex items-center justify-center text-sm font-medium
                transition-all duration-200
                ${!isCurrentMonth ? "text-muted-foreground/30" : ""}
                ${isWeekend && isCurrentMonth ? "text-calendar-weekend" : "text-foreground"}
                ${isToday ? "ring-2 ring-calendar-today" : ""}
                ${hasEvent ? "bg-calendar-highlight text-primary-foreground" : ""}
                ${!hasEvent && isCurrentMonth ? "hover:bg-secondary" : ""}
                ${selectedDate === day && isCurrentMonth && !hasEvent ? "bg-secondary" : ""}
              `}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default Calendar;
