import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, ChevronRight, Link, CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import apiClient from "@/lib/api";
import { Artist } from "@/types/artist";
import { Album } from "@/types/album";
import { Concert } from "@/types/concert";
import { Skeleton } from "@/components/ui/skeleton";
import { formatPerformingSchedule, formatDateTime } from "@/lib/utils";

const ArtistDetail = () => {
  const { artistId } = useParams<{ artistId: string }>();
  const navigate = useNavigate();

  const [artist, setArtist] = useState<Artist | null>(null);
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

    const fetchArtist = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await apiClient.get<{ success: boolean; data: Artist; message: string }>(
          `/api/artists/${artistId}`
        );
        if (response.data.success) {
          setArtist(response.data.data);
        } else {
          throw new Error(response.data.message || 'Failed to fetch artist data');
        }
      } catch (err) {
        setError("아티스트 정보를 불러오는 데 실패했습니다.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    const fetchAlbums = async () => {
      setAlbumsLoading(true);
      setAlbumsError(null);
      try {
        const response = await apiClient.get<{ success: boolean; data: { albums: Album[] }; message: string }>(
          `/api/albums?artistId=${artistId}`
        );
        if (response.data.success) {
          setAlbums(response.data.data.albums);
        } else {
          throw new Error(response.data.message || 'Failed to fetch albums');
        }
      } catch (err) {
        setAlbumsError("앨범 정보를 불러오는 데 실패했습니다.");
        console.error(err);
      } finally {
        setAlbumsLoading(false);
      }
    };

    const fetchConcerts = async () => {
      setConcertsLoading(true);
      setConcertsError(null);
      try {
        const response = await apiClient.get<{ success: boolean; data: { concerts: Concert[] }; message: string }>(
          `/api/concerts?artistId=${artistId}`
        );
        if (response.data.success) {
          setConcerts(response.data.data.concerts);
        } else {
          throw new Error(response.data.message || 'Failed to fetch concerts');
        }
      } catch (err) {
        setConcertsError("공연 정보를 불러오는 데 실패했습니다.");
        console.error(err);
      } finally {
        setConcertsLoading(false);
      }
    };

    fetchArtist();
    fetchAlbums();
    fetchConcerts();
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
      <div className="relative h-[280px] bg-gradient-to-b from-primary/20 to-background">
        {artist.profileImageUrl ? (
          <img
            src={artist.profileImageUrl}
            alt={artist.name}
            className="absolute inset-0 w-full h-full object-cover opacity-30"
          />
        ) : (
          <div className="absolute inset-0 w-full h-full bg-muted opacity-50" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-transparent" />
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 left-4 z-10"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="absolute bottom-6 left-6 right-6 z-10">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            {artist.name}
          </h1>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {artist.description}
          </p>
        </div>
      </div>

      <Tabs defaultValue="concerts" className="px-6 py-4">
        <TabsList className="w-full grid grid-cols-4 mb-6">
          <TabsTrigger value="concerts">공연/행사</TabsTrigger>
          <TabsTrigger value="albums">앨범</TabsTrigger>
          <TabsTrigger value="posts">게시글</TabsTrigger>
          <TabsTrigger value="info">정보</TabsTrigger>
        </TabsList>

        <TabsContent value="concerts" className="space-y-4">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-foreground">공연/행사</h3>
          </div>
          {concertsLoading ? (
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <Card key={i} className="flex gap-4 p-4">
                  <Skeleton className="w-24 h-32 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-5 w-1/2" />
                    <Skeleton className="h-4 w-1/3" />
                    <Skeleton className="h-4 w-2/3 mt-1" />
                  </div>
                </Card>
              ))}
            </div>
          ) : concertsError ? (
            <div className="text-center py-12 text-destructive">{concertsError}</div>
          ) : concerts.length > 0 ? (
            <div className="space-y-4">
              {concerts.map((concert) => (
                <Card key={concert.concertId} className="overflow-hidden">
                  <div className="flex gap-4 p-4">
                    <div className="w-24 h-32 rounded-lg bg-muted flex-shrink-0 overflow-hidden">
                      {concert.posterImageUrl ? (
                        <img src={concert.posterImageUrl} alt={concert.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-secondary" />
                      )}
                    </div>
                    <div className="flex flex-col justify-between flex-1 min-w-0">
                      <div>
                        <p className="text-sm text-primary font-semibold mb-1">
                          {formatPerformingSchedule(concert.performingSchedule.map(s => s.date))}
                        </p>
                        <h4 className="font-bold text-foreground mb-1 truncate">
                          {concert.title}
                        </h4>
                        <p className="text-sm text-muted-foreground mb-1">{concert.place}</p>
                        {concert.bookingSchedule && concert.bookingSchedule !== 'null' && (
                          <p className="text-xs text-muted-foreground flex items-center">
                            <CalendarDays className="h-3 w-3 mr-1.5" />
                            예매: {formatDateTime(concert.bookingSchedule)}
                          </p>
                        )}
                      </div>
                      {concert.bookingUrl && (
                        <a href={concert.bookingUrl} target="_blank" rel="noopener noreferrer" className="mt-2">
                          <Button size="sm">예매하기</Button>
                        </a>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              공연/행사 정보가 없습니다
            </div>
          )}
        </TabsContent>

        <TabsContent value="albums" className="space-y-4">
          {albumsLoading ? (
            <div className="grid grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="aspect-square rounded-lg" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              ))}
            </div>
          ) : albumsError ? (
            <div className="text-center py-12 text-destructive">{albumsError}</div>
          ) : albums.length > 0 ? (
            <div className="grid grid-cols-3 gap-4">
              {albums.map((album) => (
                <div key={album.albumId} className="space-y-2">
                  <div className="aspect-square rounded-lg bg-muted overflow-hidden">
                    {album.coverImageUrl ? (
                      <img src={album.coverImageUrl} alt={album.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-secondary" />
                    )}
                  </div>
                  <p className="text-sm font-semibold text-foreground truncate">{album.name}</p>
                  <p className="text-xs text-muted-foreground">{new Date(album.releaseDate).toLocaleDateString()}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              앨범 정보가 없습니다
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="posts" className="space-y-4">
          {/* Posts content can be fetched and displayed here */}
           <div className="text-center py-12 text-muted-foreground">
            게시글이 없습니다
          </div>
        </TabsContent>

        <TabsContent value="info" className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-2">소개</h3>
            <p className="text-foreground whitespace-pre-wrap">
              {artist.description || "아직 소개가 등록되지 않았습니다."}
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-2">장르</h3>
            {artist.genre && artist.genre.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {artist.genre.map((g) => (
                  <Badge key={g} variant="secondary">
                    {g}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">다양한 장르의 음악을 하고 있어요.</p>
            )}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-2">SNS</h3>
            {artist.sns && artist.sns.length > 0 ? (
              <div className="space-y-2">
                {artist.sns.map((s) => (
                  <a
                    key={s.platform}
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center text-sm text-foreground hover:underline"
                  >
                    <Link className="h-4 w-4 mr-2 text-muted-foreground" />
                    {s.platform}
                  </a>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">아직 SNS 정보를 등록하지 않았어요.</p>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ArtistDetail;
