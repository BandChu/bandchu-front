import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Search as SearchIcon, Loader2, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import apiClient from "@/lib/api";
// 필요한 경우, 아래 타입 정의를 별도로 만드셔야 합니다. (원래 코드에 없었음)
// interface ArtistType { artistId: number; name: string; profileImageUrl?: string; }
// interface ArtistsApiResponse { success: boolean; data: { artists: ArtistType[] }; }

interface ArtistType {
  artistId: number;
  name: string;
  profileImageUrl?: string;
}

interface SearchResult {
  id: number;
  type: "artist" | "event"; // 현재는 artist만 처리
  name: string;
  subtitle?: string;
}

const SearchArtist = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  // 모든 아티스트 목록을 저장
  const [allArtists, setAllArtists] = useState<ArtistType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 모든 아티스트 목록을 서버로부터 가져옴 (GET /api/artists)
    const loadArtists = async () => {
      setLoading(true);
      try {
        const response = await apiClient.get<{ success: boolean, data: { artists: ArtistType[] } }>('/api/artists');
        if (response.data.success && response.data.data.artists) {
          // artistId와 name을 포함한 전체 아티스트 데이터를 저장
          setAllArtists(response.data.data.artists.map(artist => ({
            artistId: artist.artistId,
            name: artist.name,
            profileImageUrl: artist.profileImageUrl // 이미지 URL 필드도 포함
          })));
        }
      } catch (error) {
        console.warn('아티스트 목록 API 호출 실패:', error);
        setAllArtists([]);
      } finally {
        setLoading(false);
      }
    };

    loadArtists();
  }, []);

  // 검색 결과 필터링 (클라이언트 측)
  const filteredResults: SearchResult[] = useMemo(() => {
    if (!searchQuery.trim()) return [];

    const query = searchQuery.toLowerCase().trim();
    
    // allArtists를 기반으로 필터링
    const artistResults: SearchResult[] = allArtists
      .filter(artist => artist.name.toLowerCase().includes(query))
      .map(artist => ({
        id: artist.artistId,
        type: "artist" as const,
        name: artist.name,
        subtitle: '아티스트', // 구분을 위해 추가
      }));

    return artistResults;
  }, [searchQuery, allArtists]);

  const handleResultClick = (result: SearchResult) => {
    if (result.type === "artist") {
      navigate(`/artist/${result.id}`);
    }
    // TODO: Event 로직 추가 시 여기 구현
  };

  const hasResults = filteredResults.length > 0;

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border px-6 py-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1 relative">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="아티스트 이름을 검색하세요"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              autoFocus
            />
            {loading && (
              <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground animate-spin" />
            )}
          </div>
        </div>
      </header>

      <main className="px-6 py-4">
        {loading ? (
          <div className="text-center py-12 text-muted-foreground">
            아티스트 목록을 불러오는 중...
          </div>
        ) : !searchQuery.trim() ? (
            <div className="text-center py-12 text-muted-foreground">
                검색어를 입력하여 아티스트를 찾아보세요
            </div>
        ) : !hasResults ? (
          <div className="text-center py-12 text-muted-foreground">
            검색 결과가 없습니다
          </div>
        ) : (
          <div className="space-y-2">
            {filteredResults.map((result) => (
              <Card
                key={`artist-search-${result.id}`}
                className="p-4 cursor-pointer hover:bg-accent transition-colors"
                onClick={() => handleResultClick(result)}
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-muted flex-shrink-0 overflow-hidden">
                    {/* 해당 아티스트의 프로필 이미지를 찾아 표시 (allArtists 배열에서 id로 찾아야 함) */}
                    <User className="w-full h-full text-muted-foreground/50 p-2" /> 
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground">{result.name}</p>
                    <p className="text-sm text-muted-foreground">{result.subtitle}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default SearchArtist;