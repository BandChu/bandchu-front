// 아티스트별 일정 데이터 (하드코딩)

export interface ArtistSchedule {
  artistId: number;
  artistName: string;
  eventDates: number[]; // 12월 기준 날짜
  color: string; // 아티스트별 색상 (Tailwind CSS 클래스)
}

// 아티스트별 색상 정의
const artistColors: Record<number, string> = {
  1: "bg-blue-500",      // 실리카겔
  2: "bg-purple-500",    // 장기하와 얼굴들
  3: "bg-pink-500",      // 잔나비
  4: "bg-green-500",     // 혁오
  5: "bg-yellow-500",    // 새소년
  6: "bg-orange-500",    // 딘딘
  7: "bg-red-500",       // 기리보이
  8: "bg-indigo-500",    // 에픽하이
  9: "bg-teal-500",      // 버스커 버스커
  10: "bg-cyan-500",     // 10cm
};

export const artistSchedules: ArtistSchedule[] = [
  {
    artistId: 1,
    artistName: "실리카겔",
    eventDates: [8, 10, 27, 28], // 12월 8일, 10일, 27일, 28일
    color: artistColors[1],
  },
  {
    artistId: 2,
    artistName: "장기하와 얼굴들",
    eventDates: [5, 15, 22], // 12월 5일, 15일, 22일
    color: artistColors[2],
  },
  {
    artistId: 3,
    artistName: "잔나비",
    eventDates: [12, 18, 25], // 12월 12일, 18일, 25일
    color: artistColors[3],
  },
  {
    artistId: 4,
    artistName: "혁오",
    eventDates: [6, 14, 20, 31], // 12월 6일, 14일, 20일, 31일
    color: artistColors[4],
  },
  {
    artistId: 5,
    artistName: "새소년",
    eventDates: [3, 11, 19], // 12월 3일, 11일, 19일
    color: artistColors[5],
  },
  {
    artistId: 6,
    artistName: "딘딘",
    eventDates: [7, 16, 24], // 12월 7일, 16일, 24일
    color: artistColors[6],
  },
  {
    artistId: 7,
    artistName: "기리보이",
    eventDates: [9, 17, 26], // 12월 9일, 17일, 26일
    color: artistColors[7],
  },
  {
    artistId: 8,
    artistName: "에픽하이",
    eventDates: [4, 13, 21, 29], // 12월 4일, 13일, 21일, 29일
    color: artistColors[8],
  },
  {
    artistId: 9,
    artistName: "버스커 버스커",
    eventDates: [2, 23, 30], // 12월 2일, 23일, 30일
    color: artistColors[9],
  },
  {
    artistId: 10,
    artistName: "10cm",
    eventDates: [1, 15, 28], // 12월 1일, 15일, 28일
    color: artistColors[10],
  },
];

export const getArtistSchedule = (artistId: number): number[] => {
  const schedule = artistSchedules.find((s) => s.artistId === artistId);
  return schedule?.eventDates || [];
};

export const getAllEventDates = (): number[] => {
  const allDates = new Set<number>();
  artistSchedules.forEach((schedule) => {
    schedule.eventDates.forEach((date) => allDates.add(date));
  });
  return Array.from(allDates).sort((a, b) => a - b);
};

export const getArtistName = (artistId: number): string | null => {
  const schedule = artistSchedules.find((s) => s.artistId === artistId);
  return schedule?.artistName || null;
};

export const getArtistColor = (artistId: number): string => {
  const schedule = artistSchedules.find((s) => s.artistId === artistId);
  return schedule?.color || "bg-primary";
};

// 특정 날짜에 일정이 있는 아티스트 ID 목록 반환
export const getArtistsByDate = (date: number): number[] => {
  return artistSchedules
    .filter((schedule) => schedule.eventDates.includes(date))
    .map((schedule) => schedule.artistId);
};

