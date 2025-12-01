import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { SubscribedArtistWithConcerts } from "@/types/subscribedConcerts";

interface ArtistCarouselProps {
  artists: SubscribedArtistWithConcerts[];
  selectedArtistIds: number[];
  onArtistSelect: (artistId: number) => void;
}

const ArtistCarousel = ({ artists, selectedArtistIds, onArtistSelect }: ArtistCarouselProps) => {
  const navigate = useNavigate();

  return (
    <div className="px-6 py-4 border-b border-border">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-semibold">구독한 아티스트</p>
        <button 
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          onClick={() => navigate("/subscriptions")}
        >
          + 펼쳐보기 〉
        </button>
      </div>
      <div className="flex gap-4 overflow-x-auto py-2 scrollbar-hide">
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
            key={artist.artistId}
            onClick={() => onArtistSelect(artist.artistId)}
            onDoubleClick={() => navigate(`/artist/${artist.artistId}`)}
            className="flex-shrink-0 flex flex-col items-center gap-2"
          >
            <div className="relative">
              <div className={`w-16 h-16 rounded-full bg-gradient-to-br from-primary/80 to-primary overflow-hidden flex items-center justify-center
                ring-2 transition-all ${selectedArtistIds.includes(artist.artistId) ? 'ring-primary ring-offset-2 ring-offset-background' : 'ring-transparent'}`}>
                {artist.profileImageUrl ? (
                  <img src={artist.profileImageUrl} alt={artist.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-secondary flex items-center justify-center">
                    <span className="text-lg font-bold text-secondary-foreground">
                      {artist.name}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ArtistCarousel;

