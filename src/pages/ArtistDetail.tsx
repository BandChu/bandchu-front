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

import { getGenreColorClass, getGenreColorClassForHeader } from "@/lib/utils";

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
        // const mockArtist = getArtistById(id);
        // if (mockArtist) {
        //   const mockArtistData = {
        //     artistId: mockArtist.id,
        //     name: mockArtist.name,
        //     profileImageUrl: '',
        //     description: `${mockArtist.name}의 음악을 즐겨보세요.`,
        //     genre: artistGenres[id] || [],
        //     sns: [],
        //   };
        //   setArtist(mockArtistData);
        //   // Mock 데이터를 사용할 때도 앨범과 공연 정보 가져오기
        //   fetchAlbums();
        //   fetchConcerts();
        // } else {
        //   setError("아티스트 정보를 찾을 수 없습니다.");
        //   // 아티스트 정보가 없어도 앨범과 공연 정보는 가져오기 시도
        //   fetchAlbums();
        //   fetchConcerts();
        // }
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
                  onClick={() => navigate(`/concert/${concert.concertId}`)}
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
