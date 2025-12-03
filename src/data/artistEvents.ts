import { CalendarEvent } from "@/types/calendarEvent";
import { Concert } from "@/types/concert";
import { Album } from "@/types/album";
import { getArtistName, artistSchedules } from "./artistSchedules";

// 날짜별 공연 mock 데이터 (12월 기준)
const mockConcerts: Record<number, Array<{
  artistId: number;
  title: string;
  place: string;
  time: string;
  bookingUrl?: string;
}>> = {
  1: [
    { artistId: 10, title: "10cm 단독 콘서트", place: "올림픽공원 올림픽홀", time: "19:00", bookingUrl: "https://ticket.yes24.com" },
  ],
  2: [
    { artistId: 9, title: "버스커 버스커 콘서트", place: "잠실 실내체육관", time: "18:00", bookingUrl: "https://ticket.yes24.com" },
  ],
  3: [
    { artistId: 5, title: "새소년 라이브", place: "홍대 클럽 FF", time: "20:00", bookingUrl: "https://ticket.yes24.com" },
  ],
  4: [
    { artistId: 8, title: "에픽하이 콘서트", place: "올림픽공원 올림픽홀", time: "19:30", bookingUrl: "https://ticket.yes24.com" },
  ],
  5: [
    { artistId: 2, title: "장기하와 얼굴들 공연", place: "홍대 클럽 FF", time: "20:00", bookingUrl: "https://ticket.yes24.com" },
  ],
  6: [
    { artistId: 4, title: "혁오 단독 콘서트", place: "잠실 실내체육관", time: "19:00", bookingUrl: "https://ticket.yes24.com" },
  ],
  7: [
    { artistId: 6, title: "딘딘 라이브", place: "홍대 클럽 FF", time: "21:00", bookingUrl: "https://ticket.yes24.com" },
  ],
  8: [
    { artistId: 1, title: "실리카겔 콘서트", place: "올림픽공원 올림픽홀", time: "19:00", bookingUrl: "https://ticket.yes24.com" },
  ],
  9: [
    { artistId: 7, title: "기리보이 공연", place: "홍대 클럽 FF", time: "20:00", bookingUrl: "https://ticket.yes24.com" },
  ],
  10: [
    { artistId: 1, title: "실리카겔 단독 콘서트", place: "잠실 실내체육관", time: "19:30", bookingUrl: "https://ticket.yes24.com" },
  ],
  11: [
    { artistId: 5, title: "새소년 콘서트", place: "올림픽공원 올림픽홀", time: "18:30", bookingUrl: "https://ticket.yes24.com" },
  ],
  12: [
    { artistId: 3, title: "잔나비 라이브", place: "홍대 클럽 FF", time: "20:00", bookingUrl: "https://ticket.yes24.com" },
  ],
  13: [
    { artistId: 8, title: "에픽하이 단독 콘서트", place: "잠실 실내체육관", time: "19:00", bookingUrl: "https://ticket.yes24.com" },
  ],
  14: [
    { artistId: 4, title: "혁오 공연", place: "홍대 클럽 FF", time: "20:00", bookingUrl: "https://ticket.yes24.com" },
  ],
  15: [
    { artistId: 2, title: "장기하와 얼굴들 콘서트", place: "올림픽공원 올림픽홀", time: "19:00", bookingUrl: "https://ticket.yes24.com" },
    { artistId: 10, title: "10cm 라이브", place: "홍대 클럽 FF", time: "21:00", bookingUrl: "https://ticket.yes24.com" },
  ],
  16: [
    { artistId: 6, title: "딘딘 콘서트", place: "잠실 실내체육관", time: "19:30", bookingUrl: "https://ticket.yes24.com" },
  ],
  17: [
    { artistId: 7, title: "기리보이 단독 콘서트", place: "올림픽공원 올림픽홀", time: "18:00", bookingUrl: "https://ticket.yes24.com" },
  ],
  18: [
    { artistId: 3, title: "잔나비 콘서트", place: "잠실 실내체육관", time: "19:00", bookingUrl: "https://ticket.yes24.com" },
  ],
  19: [
    { artistId: 5, title: "새소년 단독 콘서트", place: "올림픽공원 올림픽홀", time: "19:30", bookingUrl: "https://ticket.yes24.com" },
  ],
  20: [
    { artistId: 4, title: "혁오 라이브", place: "홍대 클럽 FF", time: "20:00", bookingUrl: "https://ticket.yes24.com" },
  ],
  21: [
    { artistId: 8, title: "에픽하이 공연", place: "홍대 클럽 FF", time: "20:00", bookingUrl: "https://ticket.yes24.com" },
  ],
  22: [
    { artistId: 2, title: "장기하와 얼굴들 라이브", place: "홍대 클럽 FF", time: "21:00", bookingUrl: "https://ticket.yes24.com" },
  ],
  23: [
    { artistId: 9, title: "버스커 버스커 단독 콘서트", place: "올림픽공원 올림픽홀", time: "19:00", bookingUrl: "https://ticket.yes24.com" },
  ],
  24: [
    { artistId: 6, title: "딘딘 단독 콘서트", place: "잠실 실내체육관", time: "19:00", bookingUrl: "https://ticket.yes24.com" },
  ],
  25: [
    { artistId: 3, title: "잔나비 단독 콘서트", place: "올림픽공원 올림픽홀", time: "18:30", bookingUrl: "https://ticket.yes24.com" },
  ],
  26: [
    { artistId: 7, title: "기리보이 라이브", place: "홍대 클럽 FF", time: "20:00", bookingUrl: "https://ticket.yes24.com" },
  ],
  27: [
    { artistId: 1, title: "실리카겔 라이브", place: "홍대 클럽 FF", time: "20:00", bookingUrl: "https://ticket.yes24.com" },
  ],
  28: [
    { artistId: 1, title: "실리카겔 공연", place: "홍대 클럽 FF", time: "21:00", bookingUrl: "https://ticket.yes24.com" },
    { artistId: 10, title: "10cm 콘서트", place: "잠실 실내체육관", time: "19:00", bookingUrl: "https://ticket.yes24.com" },
  ],
  29: [
    { artistId: 8, title: "에픽하이 라이브", place: "홍대 클럽 FF", time: "20:00", bookingUrl: "https://ticket.yes24.com" },
  ],
  30: [
    { artistId: 9, title: "버스커 버스커 라이브", place: "홍대 클럽 FF", time: "20:00", bookingUrl: "https://ticket.yes24.com" },
  ],
  31: [
    { artistId: 4, title: "혁오 단독 콘서트", place: "올림픽공원 올림픽홀", time: "19:00", bookingUrl: "https://ticket.yes24.com" },
  ],
};

// 아티스트별 앨범 mock 데이터
const mockAlbums: Record<number, Array<{
  name: string;
  releaseDate: string;
}>> = {
  1: [
    { name: "실리카겔 1집", releaseDate: "2024-03-15" },
    { name: "실리카겔 2집", releaseDate: "2024-09-20" },
  ],
  2: [
    { name: "장기하와 얼굴들 베스트", releaseDate: "2024-05-10" },
  ],
  3: [
    { name: "잔나비 신곡", releaseDate: "2024-07-25" },
  ],
  4: [
    { name: "혁오 앨범", releaseDate: "2024-04-12" },
  ],
  5: [
    { name: "새소년 EP", releaseDate: "2024-06-18" },
  ],
  6: [
    { name: "딘딘 싱글", releaseDate: "2024-08-05" },
  ],
  7: [
    { name: "기리보이 앨범", releaseDate: "2024-02-28" },
  ],
  8: [
    { name: "에픽하이 정규앨범", releaseDate: "2024-01-15" },
  ],
  9: [
    { name: "버스커 버스커 베스트", releaseDate: "2024-03-22" },
  ],
  10: [
    { name: "10cm 싱글", releaseDate: "2024-05-30" },
  ],
};

// 선택된 날짜와 아티스트에 맞는 공연 이벤트 생성
export const getEventsByDate = (date: Date, artistIds: number[], artistNameMap?: Record<number, string>): CalendarEvent[] => {
  const day = date.getDate();
  const month = date.getMonth();
  
  // 현재는 12월 데이터만 있음
  if (month !== 11) return [];
  
  const concerts = mockConcerts[day] || [];
  const events: CalendarEvent[] = [];
  
  concerts.forEach((concert, index) => {
    if (artistIds.includes(concert.artistId)) {
      const year = date.getFullYear();
      const monthStr = String(date.getMonth() + 1).padStart(2, '0');
      const dayStr = String(day).padStart(2, '0');
      const dateStr = `${year}-${monthStr}-${dayStr}`;
      const dateTime = `${dateStr}T${concert.time}:00+09:00`;
      
      // API에서 받은 아티스트 이름 맵이 있으면 사용, 없으면 하드코딩된 데이터 사용 (폴백)
      const artistName = artistNameMap?.[concert.artistId] || getArtistName(concert.artistId) || '';
      
      events.push({
        artistId: concert.artistId,
        artistName: artistName,
        concertId: concert.artistId * 1000 + day,
        scheduleId: index,
        date: dateStr,
        dateTime: dateTime,
        title: concert.title,
        place: concert.place,
        type: 'performance',
        bookingUrl: concert.bookingUrl,
      });
    }
  });
  
  return events;
};

// 아티스트별 공연 목록 가져오기
export const getConcertsByArtist = (artistId: number): Concert[] => {
  const concerts: Concert[] = [];
  
  // Fallback 시 하드코딩된 이름 그대로 사용
  Object.entries(mockConcerts).forEach(([day, dayConcerts]) => {
    dayConcerts.forEach((concert, index) => {
      if (concert.artistId === artistId) {
        const dayNum = parseInt(day, 10);
        const year = 2025;
        const month = 11; // 12월
        const date = new Date(year, month, dayNum);
        const dateStr = date.toISOString().split('T')[0];
        
        concerts.push({
          concertId: artistId * 1000 + dayNum,
          title: concert.title,
          place: concert.place,
          posterImageUrl: '',
          information: concert.title,
          bookingSchedule: concert.bookingUrl ? dateStr : '',
          bookingUrl: concert.bookingUrl || '',
          performingSchedule: [{ id: 1, date: dateStr }],
          createdAt: new Date().toISOString(),
        });
      }
    });
  });
  
  return concerts;
};

// 아티스트별 앨범 목록 가져오기
export const getAlbumsByArtist = (artistId: number): Album[] => {
  const albums = mockAlbums[artistId] || [];
  
  // Fallback 시 하드코딩된 이름 그대로 사용
  return albums.map((album, index) => ({
    albumId: artistId * 100 + index + 1,
    name: album.name,
    coverImageUrl: '',
    releaseDate: album.releaseDate,
  }));
};

