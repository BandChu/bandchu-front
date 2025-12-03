import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Link, CalendarDays, Mic, PlayCircle, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import apiClient from "@/lib/api";
import type { ArtistDetail } from "@/types/artist";
import { Album } from "@/types/album";
import { Concert } from "@/types/concert";
import { Skeleton } from "@/components/ui/skeleton";
import { formatPerformingSchedule, formatDateTime } from "@/lib/utils";
import { getArtistById } from "@/data/artistSchedules";
import { toast } from "sonner";
import { getAlbumsByArtistId } from "@/lib/api/album";
import { getConcertsByArtistId } from "@/lib/api/concert";
import EmptyState from "@/components/EmptyState";

const artistGenres: Record<number, string[]> = {
  1: ['인디 록', '록'],
  2: ['인디 록', '록'],
  3: ['인디 록', '록'],
  4: ['인디 록', '록'],
  5: ['인디 록', '록'],
  6: ['힙합', '랩'],
  7: ['힙합', '랩'],
  8: ['힙합', '랩'],
  9: ['인디 록', '록'],
  10: ['인디 록', '록'],
};

// 장르 enum에 맞춘 색상 정의
const genreColors: Record<string, string> = {
  'BALLAD': 'bg-blue-50 text-blue-700 border-blue-200',
  'DANCE': 'bg-pink-50 text-pink-700 border-pink-200',
  'RAP': 'bg-orange-50 text-orange-700 border-orange-200',
  'HIPHOP': 'bg-purple-50 text-purple-700 border-purple-200',
  'ROCK': 'bg-red-50 text-red-700 border-red-200',
  'METAL': 'bg-gray-800 text-gray-100 border-gray-700',
  'POP': 'bg-yellow-50 text-yellow-700 border-yellow-200',
  'INDIE': 'bg-green-50 text-green-700 border-green-200',
  'JAZZ': 'bg-amber-50 text-amber-700 border-amber-200',
  'JPOP': 'bg-rose-50 text-rose-700 border-rose-200',
  // 한국어 장르명도 지원
  '발라드': 'bg-blue-50 text-blue-700 border-blue-200',
  '댄스': 'bg-pink-50 text-pink-700 border-pink-200',
  '랩': 'bg-orange-50 text-orange-700 border-orange-200',
  '힙합': 'bg-purple-50 text-purple-700 border-purple-200',
  '록': 'bg-red-50 text-red-700 border-red-200',
  '메탈': 'bg-gray-800 text-gray-100 border-gray-700',
  '팝': 'bg-yellow-50 text-yellow-700 border-yellow-200',
  '인디': 'bg-green-50 text-green-700 border-green-200',
  '인디 록': 'bg-green-50 text-green-700 border-green-200',
  '재즈': 'bg-amber-50 text-amber-700 border-amber-200',
  '제이팝': 'bg-rose-50 text-rose-700 border-rose-200',
};

// 장르 설명 정의
const genreDescriptions: Record<string, string> = {
  'BALLAD': '감성적이고 서정적인 발라드 장르로, 따뜻한 멜로디와 진솔한 가사가 특징입니다.',
  'DANCE': '리듬감 있고 경쾌한 댄스 음악으로, 신나고 활기찬 분위기를 만들어냅니다.',
  'RAP': '리듬감 있는 랩과 비트가 어우러진 힙합의 한 장르입니다.',
  'HIPHOP': '힙합 문화에서 나온 음악 장르로, 비트와 랩이 중심이 되는 음악입니다.',
  'ROCK': '강렬한 기타 사운드와 드럼 비트가 특징인 록 음악입니다.',
  'METAL': '무겁고 강렬한 사운드가 특징인 메탈 음악으로, 강렬한 에너지를 전달합니다.',
  'POP': '대중적이고 친숙한 팝 음악으로, 누구나 쉽게 즐길 수 있는 음악입니다.',
  'INDIE': '독립적인 음악 활동을 하는 인디 아티스트들의 음악으로, 독창적인 사운드가 특징입니다.',
  'JAZZ': '자유롭고 즉흥적인 재즈 음악으로, 세련되고 우아한 분위기를 만들어냅니다.',
  'JPOP': '일본의 대중 음악으로, 다양한 스타일과 감성이 어우러진 음악입니다.',
  // 한국어 장르명도 지원
  '발라드': '감성적이고 서정적인 발라드 장르로, 따뜻한 멜로디와 진솔한 가사가 특징입니다.',
  '댄스': '리듬감 있고 경쾌한 댄스 음악으로, 신나고 활기찬 분위기를 만들어냅니다.',
  '랩': '리듬감 있는 랩과 비트가 어우러진 힙합의 한 장르입니다.',
  '힙합': '힙합 문화에서 나온 음악 장르로, 비트와 랩이 중심이 되는 음악입니다.',
  '록': '강렬한 기타 사운드와 드럼 비트가 특징인 록 음악입니다.',
  '메탈': '무겁고 강렬한 사운드가 특징인 메탈 음악으로, 강렬한 에너지를 전달합니다.',
  '팝': '대중적이고 친숙한 팝 음악으로, 누구나 쉽게 즐길 수 있는 음악입니다.',
  '인디': '독립적인 음악 활동을 하는 인디 아티스트들의 음악으로, 독창적인 사운드가 특징입니다.',
  '인디 록': '인디와 록이 결합된 장르로, 독창적이면서도 강렬한 사운드가 특징입니다.',
  '재즈': '자유롭고 즉흥적인 재즈 음악으로, 세련되고 우아한 분위기를 만들어냅니다.',
  '제이팝': '일본의 대중 음악으로, 다양한 스타일과 감성이 어우러진 음악입니다.',
};

// 장르 색상 클래스 가져오기 (일반 배경용)
const getGenreColorClass = (genre: string): string => {
  const upperGenre = genre.toUpperCase();
  return genreColors[upperGenre] || genreColors[genre] || 'bg-slate-50 text-slate-700 border-slate-200';
};

// 장르 색상 클래스 가져오기 (어두운 헤더 배경용)
const getGenreColorClassForHeader = (genre: string): string => {
  const headerColors: Record<string, string> = {
    'BALLAD': 'bg-blue-500/30 text-blue-100 border-blue-400/40',
    'DANCE': 'bg-pink-500/30 text-pink-100 border-pink-400/40',
    'RAP': 'bg-orange-500/30 text-orange-100 border-orange-400/40',
    'HIPHOP': 'bg-purple-500/30 text-purple-100 border-purple-400/40',
    'ROCK': 'bg-red-500/30 text-red-100 border-red-400/40',
    'METAL': 'bg-gray-700/50 text-gray-100 border-gray-600/50',
    'POP': 'bg-yellow-500/30 text-yellow-100 border-yellow-400/40',
    'INDIE': 'bg-green-500/30 text-green-100 border-green-400/40',
    'JAZZ': 'bg-amber-500/30 text-amber-100 border-amber-400/40',
    'JPOP': 'bg-rose-500/30 text-rose-100 border-rose-400/40',
    // 한국어 장르명도 지원
    '발라드': 'bg-blue-500/30 text-blue-100 border-blue-400/40',
    '댄스': 'bg-pink-500/30 text-pink-100 border-pink-400/40',
    '랩': 'bg-orange-500/30 text-orange-100 border-orange-400/40',
    '힙합': 'bg-purple-500/30 text-purple-100 border-purple-400/40',
    '록': 'bg-red-500/30 text-red-100 border-red-400/40',
    '메탈': 'bg-gray-700/50 text-gray-100 border-gray-600/50',
    '팝': 'bg-yellow-500/30 text-yellow-100 border-yellow-400/40',
    '인디': 'bg-green-500/30 text-green-100 border-green-400/40',
    '인디 록': 'bg-green-500/30 text-green-100 border-green-400/40',
    '재즈': 'bg-amber-500/30 text-amber-100 border-amber-400/40',
    '제이팝': 'bg-rose-500/30 text-rose-100 border-rose-400/40',
  };
  const upperGenre = genre.toUpperCase();
  return headerColors[upperGenre] || headerColors[genre] || 'bg-white/20 text-white border-white/30';
};

// 장르 설명 가져오기
const getGenreDescription = (genre: string): string => {
  const upperGenre = genre.toUpperCase();
  return genreDescriptions[upperGenre] || genreDescriptions[genre] || '다양한 음악 스타일을 선보이는 아티스트입니다.';
};

const ArtistDetail = () => {
  const { artistId } = useParams<{ artistId: string }>();
  const navigate = useNavigate();

  const [artist, setArtist] = useState<ArtistDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [albums, setAlbums] = useState<Album[]>([]);
  const [albumsLoading, setAlbumsLoading] = useState(true);
  const [albumsError, setAlbumsError] = useState<string | null>(null);

  const [concerts, setConcerts] = useState<Concert[]>([]);
  const [concertsLoading, setConcertsLoading] = useState(true);
  const [concertsError, setConcertsError] = useState<string | null>(null);

  useEffect(() => {
    if (!artistId) return;

    const id = parseInt(artistId, 10);
    if (isNaN(id)) {
      setError("유효하지 않은 아티스트 ID입니다.");
      setLoading(false);
      return;
    }

    const fetchArtist = async () => {
      setLoading(true);
      setError(null);
      try {
        // 먼저 API 시도
        const response = await apiClient.get<{ success: boolean; data: ArtistDetail; message: string }>(
          `/api/artists/${artistId}`
        );
        if (response.data.success) {
          setArtist(response.data.data);
          // 아티스트 정보를 가져온 후 앨범과 공연 정보도 가져오기
          fetchAlbums();
          fetchConcerts();
        } else {
          throw new Error(response.data.message || 'Failed to fetch artist data');
        }
      } catch (err) {
        // API 실패 시 mock 데이터 사용
        const mockArtist = getArtistById(id);
        if (mockArtist) {
          const mockArtistData = {
            artistId: mockArtist.id,
            name: mockArtist.name,
            profileImageUrl: '',
            description: `${mockArtist.name}의 음악을 즐겨보세요.`,
            genre: artistGenres[id] || [],
            sns: [],
          };
          setArtist(mockArtistData);
          // Mock 데이터를 사용할 때도 앨범과 공연 정보 가져오기
          fetchAlbums();
          fetchConcerts();
        } else {
          setError("아티스트 정보를 찾을 수 없습니다.");
          // 아티스트 정보가 없어도 앨범과 공연 정보는 가져오기 시도
          fetchAlbums();
          fetchConcerts();
        }
      } finally {
        setLoading(false);
      }
    };

    const fetchAlbums = async () => {
      if (!artistId) return;
      setAlbumsLoading(true);
      try {
        const albumsData = await getAlbumsByArtistId(artistId);
        setAlbums(albumsData || []);
      } catch (err) {
        console.error("앨범 정보를 불러오는 데 실패했습니다.", err);
        setAlbums([]); // 에러 발생 시 빈 배열로 설정
      } finally {
        setAlbumsLoading(false);
      }
    };

    const fetchConcerts = async () => {
      if (!artistId) return;
      setConcertsLoading(true);
      try {
        const concertsData = await getConcertsByArtistId(artistId);
        setConcerts(concertsData || []);
      } catch (err) {
        console.error("공연 정보를 불러오는 데 실패했습니다.", err);
        setConcerts([]); // 에러 발생 시 빈 배열로 설정
      } finally {
        setConcertsLoading(false);
      }
    };

    fetchArtist();
  }, [artistId]);

  if (loading) {
    return (
      <div className="p-6">
        <Skeleton className="h-10 w-10 mb-4" />
        <div className="space-y-4">
          <Skeleton className="h-[280px] w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="text-center py-12 text-destructive">{error}</div>;
  }

  if (!artist) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        아티스트를 찾을 수 없습니다.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* 헤더 섹션 - 토스 스타일 */}
      <div className="relative">
        {/* 큰 프로필 이미지 영역 */}
        <div className="relative h-[400px] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 overflow-hidden">
          {artist.profileImageUrl ? (
            <>
              <img
                src={artist.profileImageUrl}
                alt={artist.name}
                className="w-full h-full object-cover object-center opacity-70"
                style={{ objectFit: 'cover', objectPosition: 'center top' }}
              />
              {/* 어두운 오버레이 */}
              <div className="absolute inset-0 bg-black/40" />
            </>
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary/20 via-primary/10 to-primary/5 flex items-center justify-center">
              <Mic className="w-20 h-20 text-white/30" />
            </div>
          )}
          
          {/* 그라데이션 오버레이 */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/0 via-black/30 to-black/70" />
          
          {/* 뒤로가기 버튼 */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-12 left-4 z-20 bg-white/10 backdrop-blur-md hover:bg-white/20 rounded-full border border-white/20"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-5 w-5 text-white" />
          </Button>

          {/* 아티스트 정보 (하단 고정) */}
          <div className="absolute bottom-0 left-0 right-0 z-10 px-6 pb-8 pt-20">
            <h1 className="text-4xl font-bold text-white mb-3 tracking-tight drop-shadow-lg">
              {artist.name}
            </h1>
            {artist.description && (
              <p className="text-base text-white/90 mb-4 leading-relaxed line-clamp-2 drop-shadow-md">
                {artist.description}
              </p>
            )}
            {artist.genre && artist.genre.length > 0 && (
              <div className="flex gap-2 flex-wrap">
                {artist.genre.slice(0, 3).map((g) => (
                  <span
                    key={g}
                    className={`px-4 py-1.5 text-sm font-medium rounded-full border backdrop-blur-sm transition-all hover:scale-105 ${getGenreColorClassForHeader(g)}`}
                  >
                    {g}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <Tabs defaultValue="concerts" className="pt-6">
        <TabsList className="w-full grid grid-cols-4 mb-0 bg-transparent h-auto border-b border-border/50 rounded-none px-6">
          <TabsTrigger 
            value="concerts" 
            className="text-sm font-semibold data-[state=active]:text-foreground data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent rounded-none pb-3 text-muted-foreground"
          >
            공연/행사
          </TabsTrigger>
          <TabsTrigger 
            value="albums" 
            className="text-sm font-semibold data-[state=active]:text-foreground data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent rounded-none pb-3 text-muted-foreground"
          >
            앨범
          </TabsTrigger>
          <TabsTrigger 
            value="posts" 
            className="text-sm font-semibold data-[state=active]:text-foreground data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent rounded-none pb-3 text-muted-foreground"
          >
            게시글
          </TabsTrigger>
          <TabsTrigger 
            value="info" 
            className="text-sm font-semibold data-[state=active]:text-foreground data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent rounded-none pb-3 text-muted-foreground"
          >
            정보
          </TabsTrigger>
        </TabsList>

        <TabsContent value="concerts" className="mt-6 px-6 pb-6">
          {concertsLoading ? (
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <div key={i} className="bg-white rounded-2xl p-4 border border-border/30 shadow-sm">
                  <div className="flex gap-4">
                    <Skeleton className="w-32 h-40 rounded-xl" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-5 w-1/2" />
                      <Skeleton className="h-4 w-1/3" />
                      <Skeleton className="h-4 w-2/3 mt-1" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : concertsError ? (
            <div className="text-center py-12 text-destructive">{concertsError}</div>
          ) : concerts.length > 0 ? (
            <div className="space-y-4">
              {concerts.map((concert) => (
                <div
                  key={concert.concertId}
                  className="bg-white rounded-2xl overflow-hidden shadow-sm border border-border/30 hover:shadow-md transition-all duration-200 cursor-pointer group"
                  onClick={() => toast.info("아직 미구현입니다.")}
                >
                  <div className="flex gap-4 p-4">
                    {/* 포스터 이미지 */}
                    <div className="w-24 h-32 flex-shrink-0 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 overflow-hidden">
                      {concert.posterImageUrl ? (
                        <img 
                          src={concert.posterImageUrl} 
                          alt={concert.title} 
                          className="w-full h-full object-cover" 
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/5 to-primary/10">
                          <Mic className="w-8 h-8 text-primary/30" />
                        </div>
                      )}
                    </div>
                    
                    {/* 공연 정보 */}
                    <div className="flex flex-col flex-1 min-w-0">
                      <div className="flex-1 space-y-1.5">
                        <p className="text-xs font-semibold text-primary">
                          {formatPerformingSchedule(concert.performingSchedule.map(s => s.date))}
                        </p>
                        <h4 className="text-base font-bold text-foreground line-clamp-2 leading-tight">
                          {concert.title}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {concert.place}
                        </p>
                        {concert.bookingSchedule && concert.bookingSchedule !== 'null' && concert.bookingUrl && (
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <CalendarDays className="h-3 w-3" />
                            <span>예매: {formatDateTime(concert.bookingSchedule)}</span>
                          </div>
                        )}
                      </div>
                      
                      {/* 예매 버튼 - 인라인으로 작게 */}
                      {concert.bookingUrl && concert.bookingSchedule && concert.bookingSchedule !== 'null' && (
                        <Button
                          size="sm"
                          className="mt-3 self-start px-4 py-1.5 h-8 text-xs font-medium rounded-lg"
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(concert.bookingUrl, '_blank', 'noopener,noreferrer');
                          }}
                        >
                          예매하기
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState icon={Mic} message="공연/행사 정보가 없습니다" />
          )}
        </TabsContent>

        <TabsContent value="albums" className="mt-6 px-6 pb-6">
          {albumsLoading ? (
            <div className="grid grid-cols-3 gap-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="aspect-square rounded-2xl" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              ))}
            </div>
          ) : albumsError ? (
            <div className="text-center py-12 text-destructive">{albumsError}</div>
          ) : albums.length > 0 ? (
            <div className="grid grid-cols-3 gap-3">
              {albums.map((album) => (
                <div 
                  key={album.albumId} 
                  className="space-y-2 cursor-pointer group"
                  onClick={() => toast.info("아직 미구현입니다.")}
                >
                  <div className="aspect-square rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 group-hover:scale-[1.03]">
                    {album.coverImageUrl ? (
                      <img 
                        src={album.coverImageUrl} 
                        alt={album.name} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" 
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/5 to-primary/10">
                        <PlayCircle className="w-12 h-12 text-primary/30" />
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground truncate leading-tight">{album.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{new Date(album.releaseDate).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState icon={PlayCircle} message="앨범 정보가 없습니다" />
          )}
        </TabsContent>
        
        <TabsContent value="posts" className="mt-6 px-6 pb-6">
          <EmptyState icon={FileText} message="게시글이 없습니다" />
        </TabsContent>

        <TabsContent value="info" className="mt-6 px-6 pb-6 space-y-8">
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-foreground">소개</h3>
            <div className="bg-white rounded-2xl p-6 border border-border/30 shadow-sm">
              <p className="text-foreground whitespace-pre-wrap leading-relaxed text-sm">
                {artist.description || "아직 소개가 등록되지 않았습니다."}
              </p>
            </div>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-foreground">장르</h3>
            {artist.genre && artist.genre.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {artist.genre.map((g) => (
                  <span
                    key={g}
                    className={`px-4 py-2 text-sm font-medium rounded-full border transition-all hover:scale-105 ${getGenreColorClass(g)}`}
                  >
                    {g}
                  </span>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-2xl p-6 border border-border/30 shadow-sm">
                <p className="text-sm text-muted-foreground">다양한 장르의 음악을 하고 있어요.</p>
              </div>
            )}
          </div>
          
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-foreground">SNS</h3>
            {artist.sns && artist.sns.length > 0 ? (
              <div className="space-y-2">
                {artist.sns.map((s) => (
                  <a
                    key={s.platform}
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 bg-white rounded-2xl p-4 border border-border/30 shadow-sm hover:shadow-md transition-all hover:border-primary/30 group"
                  >
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                      <Link className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                    <span className="font-semibold text-foreground text-sm">{s.platform}</span>
                  </a>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-2xl p-6 border border-border/30 shadow-sm">
                <p className="text-sm text-muted-foreground">아직 SNS 정보를 등록하지 않았어요.</p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ArtistDetail;
