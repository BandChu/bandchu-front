import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, ChevronRight, Link } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import apiClient from "@/lib/api";
import { Artist } from "@/types/artist";
import { Skeleton } from "@/components/ui/skeleton";

const ArtistDetail = () => {
  const { artistId } = useParams<{ artistId: string }>();
  const navigate = useNavigate();

  const [artist, setArtist] = useState<Artist | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

    fetchArtist();
  }, [artistId]);

  // Mock data for concerts (can be replaced with API data later)
  const concerts = [
    {
      id: 1,
      title: "2025 연말 콘서트 [어쩌구저쩌구]",
      date: "12.27(토) - 12.28(일)",
      location: "콘서트 | 일산 킨텍스",
    },
    {
      id: 2,
      title: "○○ 연말 콘서트 티켓 오픈",
      date: "12.27(토)",
      location: "예매일정 | NOL 티켓",
    },
  ];

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
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-foreground">공연/행사</h3>
            <button className="flex items-center text-sm text-muted-foreground hover:text-foreground">
              더보기 <ChevronRight className="h-4 w-4" />
            </button>
          </div>
          {concerts.map((concert) => (
            <Card key={concert.id} className="overflow-hidden">
              <div className="flex gap-4 p-4">
                <div className="w-20 h-20 rounded-lg bg-muted flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-muted-foreground mb-1">
                    {concert.date}
                  </p>
                  <h4 className="font-semibold text-foreground mb-1 truncate">
                    {concert.title}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {concert.location}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="albums" className="space-y-4">
          {/* Album content can be fetched and displayed here */}
           <div className="text-center py-12 text-muted-foreground">
            앨범 정보가 없습니다
          </div>
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
