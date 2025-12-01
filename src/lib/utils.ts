import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * 단일 날짜를 KST 기준으로 'M.D(요일) HH:mm' 형식으로 변환합니다.
 * @param date Date 객체
 */
const formatScheduleDateTime = (date: Date): string => {
  return new Intl.DateTimeFormat('ko-KR', {
    timeZone: 'Asia/Seoul',
    month: 'numeric',
    day: 'numeric',
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(date);
};

/**
 * 공연 일정 배열을 KST 기준으로 포맷팅합니다.
 * 연속된 날짜는 범위로, 떨어진 날짜는 쉼표로 구분합니다.
 * @param dates ISO 날짜 문자열 배열
 */
export function formatPerformingSchedule(dates: string[]): string {
  if (!dates || dates.length === 0) {
    return '';
  }

  const sortedDates = dates.map(d => new Date(d)).sort((a, b) => a.getTime() - b.getTime());

  if (sortedDates.length === 1) {
    return formatScheduleDateTime(sortedDates[0]);
  }

  const ranges: Date[][] = [];
  let currentRange: Date[] = [sortedDates[0]];

  for (let i = 1; i < sortedDates.length; i++) {
    const prevDate = sortedDates[i - 1];
    const currentDate = sortedDates[i];
    
    // KST 기준으로 날짜의 시작을 계산하여 비교
    const prevDateKSTStart = new Date(prevDate.toLocaleString('en-US', { timeZone: 'Asia/Seoul' }));
    prevDateKSTStart.setHours(0, 0, 0, 0);
    const currentDateKSTStart = new Date(currentDate.toLocaleString('en-US', { timeZone: 'Asia/Seoul' }));
    currentDateKSTStart.setHours(0, 0, 0, 0);

    const diffTime = currentDateKSTStart.getTime() - prevDateKSTStart.getTime();
    const diffDays = Math.round(diffTime / (1000 * 3600 * 24));

    if (diffDays === 1) {
      currentRange.push(currentDate);
    } else {
      ranges.push(currentRange);
      currentRange = [currentDate];
    }
  }
  ranges.push(currentRange);

  return ranges
    .map(range => {
      if (range.length === 1) {
        return formatScheduleDateTime(range[0]);
      } else {
        // 시작일과 종료일의 시간이 다를 수 있으므로 전체 포맷을 보여줌
        return `${formatScheduleDateTime(range[0])} - ${formatScheduleDateTime(range[range.length - 1])}`;
      }
    })
    .join(', ');
}

/**
 * ISO 날짜 문자열을 KST 기준으로 'YYYY.MM.DD HH:mm' 형식으로 변환합니다.
 * @param isoString ISO 날짜 문자열
 */
export function formatDateTime(isoString: string): string {
  if (!isoString || isoString === 'null') {
    return '';
  }
  const date = new Date(isoString);
  if (isNaN(date.getTime())) {
    return '';
  }
  
  const year = date.toLocaleString('en-CA', { timeZone: 'Asia/Seoul', year: 'numeric' });
  const month = date.toLocaleString('en-CA', { timeZone: 'Asia/Seoul', month: '2-digit' });
  const day = date.toLocaleString('en-CA', { timeZone: 'Asia/Seoul', day: '2-digit' });
  const hour = date.toLocaleString('en-GB', { timeZone: 'Asia/Seoul', hour: '2-digit', hourCycle: 'h23' });
  const minute = date.toLocaleString('en-GB', { timeZone: 'Asia/Seoul', minute: '2-digit' });

  return `${year}.${month}.${day} ${hour}:${minute}`;
}
