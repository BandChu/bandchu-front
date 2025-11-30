import { Plus, Check } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

interface Artist {
  id: number;
  name: string;
  image?: string;
  isFollowing: boolean;
}

const ArtistCarousel = () => {
  const navigate = useNavigate();
  const [artists, setArtists] = useState<Artist[]>([
    { id: 1, name: "실리카겔", isFollowing: true },
    { id: 2, name: "길어지면...", isFollowing: false },
    { id: 3, name: "아티스트명", isFollowing: true },
    { id: 4, name: "아티스트명", isFollowing: false },
  ]);

  const toggleFollow = (id: number) => {
    setArtists(artists.map(artist => 
      artist.id === id ? { ...artist, isFollowing: !artist.isFollowing } : artist
    ));
  };

  return (
    <div className="px-6 py-4 border-b border-border">
      <div className="flex items-center justify-between mb-4">
        <div className="flex-1" />
        <button 
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          onClick={() => navigate("/artists")}
        >
          + 펼쳐보기 〉
        </button>
      </div>
      <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
        <button 
          className="flex-shrink-0 flex flex-col items-center gap-2"
          onClick={() => navigate("/artists")}
        >
          <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center">
            <Plus className="w-6 h-6 text-muted-foreground" />
          </div>
        </button>
        {artists.map((artist) => (
          <button
            key={artist.id}
            onClick={(e) => {
              if (e.detail === 2) {
                // Double click
                navigate(`/artist/${artist.id}`);
              } else {
                // Single click
                toggleFollow(artist.id);
              }
            }}
            className="flex-shrink-0 flex flex-col items-center gap-2"
          >
            <div className="relative">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/80 to-primary overflow-hidden flex items-center justify-center">
                <div className="w-full h-full bg-gradient-to-br from-primary/60 to-primary/90" />
              </div>
              {artist.isFollowing && (
                <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-primary flex items-center justify-center border-2 border-background">
                  <Check className="w-3 h-3 text-primary-foreground" />
                </div>
              )}
            </div>
            <span className="text-xs text-foreground max-w-[70px] truncate">
              {artist.name}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ArtistCarousel;
