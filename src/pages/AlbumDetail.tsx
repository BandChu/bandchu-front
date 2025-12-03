import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Info, Music, PlayCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getAlbumById } from "@/lib/api/album";
import { Album } from "@/types/album";
import EmptyState from "@/components/EmptyState";

const AlbumDetail = () => {
  const { albumId } = useParams<{ albumId: string }>();
  const navigate = useNavigate();

  const [album, setAlbum] = useState<Album | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!albumId) {
      setError("유효하지 않은 앨범 ID입니다.");
      setLoading(false);
      return;
    }

    const fetchAlbum = async () => {
      setLoading(true);
      setError(null);
      try {
        const albumData = await getAlbumById(albumId);
        setAlbum(albumData);
      } catch (err) {
        setError("앨범 정보를 불러오는 데 실패했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchAlbum();
  }, [albumId]);

  if (loading) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-10 w-10 rounded-full" />
        <Skeleton className="h-[300px] w-full rounded-2xl" />
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-20 w-full" />
      </div>
    );
  }

  if (error) {
    return <div className="flex flex-col items-center justify-center min-h-screen text-destructive">{error}</div>;
  }

  if (!album) {
    return <div className="flex flex-col items-center justify-center min-h-screen text-muted-foreground">앨범 정보를 찾을 수 없습니다.</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="relative">
        <div className="relative h-[400px] bg-slate-900 overflow-hidden">
          {album.coverImageUrl ? (
            <>
              <img src={album.coverImageUrl} alt={album.name} className="w-full h-full object-cover object-center opacity-50 blur-sm" />
              <div className="absolute inset-0 bg-black/50" />
            </>
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          
          <Button variant="ghost" size="icon" className="absolute top-12 left-4 z-20 bg-white/10 backdrop-blur-md hover:bg-white/20 rounded-full border border-white/20" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5 text-white" />
          </Button>

          <div className="absolute bottom-0 left-0 right-0 z-10 p-6 flex items-end gap-6">
            {album.coverImageUrl && (
              <img src={album.coverImageUrl} alt={album.name} className="w-28 h-28 object-cover rounded-lg shadow-2xl flex-shrink-0" />
            )}
            <div className="min-w-0">
              <p className="text-sm text-white/80 drop-shadow">{new Date(album.releaseDate).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
              <h1 className="text-3xl font-bold text-white mt-1 tracking-tight drop-shadow-lg line-clamp-2">{album.name}</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="px-6 py-8 space-y-8">
        {/* Tracklist */}
        <div className="space-y-3">
          <h2 className="text-lg font-bold flex items-center"><Music className="h-5 w-5 mr-3 text-primary" />트랙 목록</h2>
          <div className="p-4 bg-slate-50 rounded-xl space-y-2">
            {album.tracks && album.tracks.length > 0 ? (
              album.tracks.map((track, index) => (
                <div key={track.trackId} className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-100 min-h-[52px]">
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-medium text-muted-foreground w-6 text-center">{index + 1}</span>
                    <span className="font-semibold text-foreground">{track.name}</span>
                  </div>
                  {track.url && (
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => window.open(track.url, '_blank', 'noopener,noreferrer')}
                      className="hover:bg-primary/10 active:bg-primary/20"
                    >
                      <PlayCircle className="h-5 w-5 text-primary" />
                    </Button>
                  )}
                </div>
              ))
            ) : (
              <div className="py-10">
                <EmptyState icon={Music} message="등록된 트랙이 없습니다." />
              </div>
            )}
          </div>
        </div>

        {/* Album Information */}
        {album.description && (
          <div className="space-y-3">
            <h2 className="text-lg font-bold flex items-center"><Info className="h-5 w-5 mr-3 text-primary" />앨범 소개</h2>
            <div className="p-6 bg-slate-50 rounded-xl">
              <p className="text-foreground whitespace-pre-wrap leading-relaxed">{album.description}</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AlbumDetail;
