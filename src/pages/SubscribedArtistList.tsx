import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import apiClient from "@/lib/api";
import { SubscribedArtist } from "@/types/subscription";

const SubscribedArtistList = () => {
  const navigate = useNavigate();
  const [artists, setArtists] = useState<SubscribedArtist[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSubscribedArtists = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await apiClient.get<{ success: boolean; data: SubscribedArtist[]; message: string }>(
          "/api/subscriptions"
        );
        if (response.data.success) {
          const sortedArtists = response.data.data.sort((a, b) =>
            a.artistName.localeCompare(b.artistName, 'ko')
          );
          setArtists(sortedArtists);
        } else {
          throw new Error(response.data.message || 'Failed to fetch subscribed artists');
        }
      } catch (err) {
        setError("구독한 아티스트 목록을 불러오는 데 실패했습니다.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchSubscribedArtists();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-background border-b border-border px-6 py-4">
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <X className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold text-foreground">구독한 아티스트 목록</h1>
          <div className="w-9 h-9" /> {/* Placeholder for centering title */}
        </div>
      </header>

      <main className="px-6 py-6">
        {loading ? (
          <div className="grid grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex flex-col items-center gap-2">
                <Skeleton className="w-full aspect-square rounded-full" />
                <Skeleton className="h-4 w-16" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-12 text-destructive">{error}</div>
        ) : artists.length > 0 ? (
          <div className="grid grid-cols-3 gap-4">
            {artists.map((artist) => (
              <button
                key={artist.artiProfileId}
                onClick={() => navigate(`/artist/${artist.artiProfileId}`)}
                className="flex flex-col items-center gap-2"
              >
                <div className="w-full aspect-square rounded-full bg-muted overflow-hidden">
                  {artist.profileImage ? (
                    <img src={artist.profileImage} alt={artist.artistName} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-secondary" />
                  )}
                </div>
                <span className="text-sm text-foreground truncate w-full text-center">
                  {artist.artistName}
                </span>
              </button>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            구독한 아티스트가 없습니다.
          </div>
        )}
      </main>
    </div>
  );
};

export default SubscribedArtistList;
