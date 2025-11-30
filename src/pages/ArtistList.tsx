import { useNavigate } from "react-router-dom";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

const ArtistList = () => {
  const navigate = useNavigate();

  const artists = [
    { id: 1, name: "실리카겔" },
    { id: 2, name: "길어지면..." },
    { id: 3, name: "아티스트명" },
    { id: 4, name: "아티스트명" },
    { id: 5, name: "아티스트명" },
    { id: 6, name: "아티스트명" },
    { id: 7, name: "아티스트명" },
    { id: 8, name: "아티스트명" },
    { id: 9, name: "아티스트명" },
    { id: 10, name: "아티스트명" },
    { id: 11, name: "아티스트명" },
    { id: 12, name: "아티스트명" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-background border-b border-border px-6 py-4">
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <X className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold text-foreground">나의 아티스트 추가</h1>
          <Button variant="ghost" onClick={() => navigate("/search")}>
            완료
          </Button>
        </div>
      </header>

      <main className="px-6 py-6">
        <p className="text-sm text-muted-foreground mb-6">
          추가하고 싶은 아티스트를 검색해보세요.
        </p>
        <div className="grid grid-cols-3 gap-4">
          {artists.map((artist) => (
            <button
              key={artist.id}
              onClick={() => navigate(`/artist/${artist.id}`)}
              className="flex flex-col items-center gap-2"
            >
              <div className="w-full aspect-square rounded-full bg-gradient-to-br from-primary/60 to-primary/90 overflow-hidden" />
              <span className="text-sm text-foreground truncate w-full text-center">
                {artist.name}
              </span>
            </button>
          ))}
        </div>
      </main>
    </div>
  );
};

export default ArtistList;
