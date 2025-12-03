import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, differenceInCalendarDays, parseISO } from "date-fns";
import { ko } from "date-fns/locale";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPerformingSchedule(dates: string[]): string {
  if (!dates || dates.length === 0) return "";

  const dateObjects = dates.map(d => parseISO(d)).sort((a, b) => a.getTime() - b.getTime());

  if (dateObjects.length === 1) {
    return format(dateObjects[0], "MM.dd (E)", { locale: ko });
  }

  let isConsecutive = true;
  for (let i = 1; i < dateObjects.length; i++) {
    if (differenceInCalendarDays(dateObjects[i], dateObjects[i - 1]) !== 1) {
      isConsecutive = false;
      break;
    }
  }

  if (isConsecutive) {
    const firstDate = format(dateObjects[0], "MM.dd (E)", { locale: ko });
    const lastDate = format(dateObjects[dateObjects.length - 1], "MM.dd (E)", { locale: ko });
    return `${firstDate} - ${lastDate}`;
  } else {
    return dateObjects.map(d => format(d, "MM.dd (E)", { locale: ko })).join(', ');
  }
}

export function formatDateTime(dateString: string): string {
  try {
    return format(parseISO(dateString), "MM.dd (E) HH:mm", { locale: ko });
  } catch {
    return dateString;
  }
}

export function parseJwt(token: string) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error("Invalid token:", error);
    return null;
  }
}

export const getTicketVendor = (url: string): string | null => {
  if (!url) return null;
  try {
    const hostname = new URL(url).hostname;
    if (hostname.includes("ticket.yes24.com")) return "YES24 티켓";
    if (hostname.includes("ticket.interpark.com")) return "인터파크 티켓";
    if (hostname.includes("ticket.melon.com")) return "멜론 티켓";
    if (hostname.includes("ticketlink")) return "티켓링크";
    if (hostname.includes("stagepick")) return "StagePick";
    return null;
  } catch { 
    return null;
  }
};

// --- 장르 관련 헬퍼 함수 ---

export const genreColors: Record<string, string> = {
  'BALLAD': 'bg-blue-50 text-blue-700 border-blue-200', 'DANCE': 'bg-pink-50 text-pink-700 border-pink-200', 'RAP': 'bg-orange-50 text-orange-700 border-orange-200', 'HIPHOP': 'bg-purple-50 text-purple-700 border-purple-200', 'ROCK': 'bg-red-50 text-red-700 border-red-200', 'METAL': 'bg-gray-800 text-gray-100 border-gray-700', 'POP': 'bg-yellow-50 text-yellow-700 border-yellow-200', 'INDIE': 'bg-green-50 text-green-700 border-green-200', 'JAZZ': 'bg-amber-50 text-amber-700 border-amber-200', 'JPOP': 'bg-rose-50 text-rose-700 border-rose-200',
  '발라드': 'bg-blue-50 text-blue-700 border-blue-200', '댄스': 'bg-pink-50 text-pink-700 border-pink-200', '랩': 'bg-orange-50 text-orange-700 border-orange-200', '힙합': 'bg-purple-50 text-purple-700 border-purple-200', '록': 'bg-red-50 text-red-700 border-red-200', '메탈': 'bg-gray-800 text-gray-100 border-gray-700', '팝': 'bg-yellow-50 text-yellow-700 border-yellow-200', '인디': 'bg-green-50 text-green-700 border-green-200', '인디 록': 'bg-green-50 text-green-700 border-green-200', '재즈': 'bg-amber-50 text-amber-700 border-amber-200', '제이팝': 'bg-rose-50 text-rose-700 border-rose-200',
};

export const genreDescriptions: Record<string, string> = {
  'BALLAD': '감성적이고 서정적인 발라드 장르로, 따뜻한 멜로디와 진솔한 가사가 특징입니다.', 'DANCE': '리듬감 있고 경쾌한 댄스 음악으로, 신나고 활기찬 분위기를 만들어냅니다.', 'RAP': '리듬감 있는 랩과 비트가 어우러진 힙합의 한 장르입니다.', 'HIPHOP': '힙합 문화에서 나온 음악 장르로, 비트와 랩이 중심이 되는 음악입니다.', 'ROCK': '강렬한 기타 사운드와 드럼 비트가 특징인 록 음악입니다.', 'METAL': '무겁고 강렬한 사운드가 특징인 메탈 음악으로, 강렬한 에너지를 전달합니다.', 'POP': '대중적이고 친숙한 팝 음악으로, 누구나 쉽게 즐길 수 있는 음악입니다.', 'INDIE': '독립적인 음악 활동을 하는 인디 아티스트들의 음악으로, 독창적인 사운드가 특징입니다.', 'JAZZ': '자유롭고 즉흥적인 재즈 음악으로, 세련되고 우아한 분위기를 만들어냅니다.', 'JPOP': '일본의 대중 음악으로, 다양한 스타일과 감성이 어우러진 음악입니다.',
  '발라드': '감성적이고 서정적인 발라드 장르로, 따뜻한 멜로디와 진솔한 가사가 특징입니다.', '댄스': '리듬감 있고 경쾌한 댄스 음악으로, 신나고 활기찬 분위기를 만들어냅니다.', '랩': '리듬감 있는 랩과 비트가 어우러진 힙합의 한 장르입니다.', '힙합': '힙합 문화에서 나온 음악 장르로, 비트와 랩이 중심이 되는 음악입니다.', '록': '강렬한 기타 사운드와 드럼 비트가 특징인 록 음악입니다.', '메탈': '무겁고 강렬한 사운드가 특징인 메탈 음악으로, 강렬한 에너지를 전달합니다.', '팝': '대중적이고 친숙한 팝 음악으로, 누구나 쉽게 즐길 수 있는 음악입니다.', '인디': '독립적인 음악 활동을 하는 인디 아티스트들의 음악으로, 독창적인 사운드가 특징입니다.', '인디 록': '인디와 록이 결합된 장르로, 독창적이면서도 강렬한 사운드가 특징입니다.', '재즈': '자유롭고 즉흥적인 재즈 음악으로, 세련되고 우아한 분위기를 만들어냅니다.', '제이팝': '일본의 대중 음악으로, 다양한 스타일과 감성이 어우러진 음악입니다.',
};

export const getGenreColorClass = (genre: string): string => {
  const upperGenre = genre.toUpperCase();
  return genreColors[upperGenre] || genreColors[genre] || 'bg-slate-50 text-slate-700 border-slate-200';
};

export const getGenreColorClassForHeader = (genre: string): string => {
  const headerColors: Record<string, string> = {
    'BALLAD': 'bg-blue-500/30 text-blue-100 border-blue-400/40', 'DANCE': 'bg-pink-500/30 text-pink-100 border-pink-400/40', 'RAP': 'bg-orange-500/30 text-orange-100 border-orange-400/40', 'HIPHOP': 'bg-purple-500/30 text-purple-100 border-purple-400/40', 'ROCK': 'bg-red-500/30 text-red-100 border-red-400/40', 'METAL': 'bg-gray-700/50 text-gray-100 border-gray-600/50', 'POP': 'bg-yellow-500/30 text-yellow-100 border-yellow-400/40', 'INDIE': 'bg-green-500/30 text-green-100 border-green-400/40', 'JAZZ': 'bg-amber-500/30 text-amber-100 border-amber-400/40', 'JPOP': 'bg-rose-500/30 text-rose-100 border-rose-400/40',
    '발라드': 'bg-blue-500/30 text-blue-100 border-blue-400/40', '댄스': 'bg-pink-500/30 text-pink-100 border-pink-400/40', '랩': 'bg-orange-500/30 text-orange-100 border-orange-400/40', '힙합': 'bg-purple-500/30 text-purple-100 border-purple-400/40', '록': 'bg-red-500/30 text-red-100 border-red-400/40', '메탈': 'bg-gray-700/50 text-gray-100 border-gray-600/50', '팝': 'bg-yellow-500/30 text-yellow-100 border-yellow-400/40', '인디': 'bg-green-500/30 text-green-100 border-green-400/40', '인디 록': 'bg-green-500/30 text-green-100 border-green-400/40', '재즈': 'bg-amber-500/30 text-amber-100 border-amber-400/40', '제이팝': 'bg-rose-500/30 text-rose-100 border-rose-400/40',
  };
  const upperGenre = genre.toUpperCase();
  return headerColors[upperGenre] || headerColors[genre] || 'bg-white/20 text-white border-white/30';
};

export const getGenreDescription = (genre: string): string => {
  const upperGenre = genre.toUpperCase();
  return genreDescriptions[upperGenre] || genreDescriptions[genre] || '다양한 음악 스타일을 선보이는 아티스트입니다.';
};

