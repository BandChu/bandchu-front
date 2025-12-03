import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Search as SearchIcon, Loader2, User, Music } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { searchByKeyword } from "@/lib/api/search"; // GET /api/artists/search 호출
import { SearchResponse, ArtistSearchResult, ConcertSearchResult } from "@/types/search";

const Search = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState(query);
  const [results, setResults] = useState<SearchResponse | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // 검색어 디바운싱 로직 (300ms)
    const handler = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [query]);

  useEffect(() => {
    // 디바운싱된 검색어로 백엔드 통합 검색 API 호출
    const performSearch = async () => {
      if (!debouncedQuery.trim()) {
        setResults(null);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        // 백엔드 통합 검색 API 호출 (GET /api/artists/search)
        const searchResults = await searchByKeyword(debouncedQuery);
        setResults(searchResults);
      } catch (error) {
        console.error("Search failed", error);
        setResults({ artists: [], concerts: [] }); // Clear results on error
      } finally {
        setLoading(false);
      }
    };

    performSearch();
  }, [debouncedQuery]);

  const handleArtistClick = (artist: ArtistSearchResult) => {
    navigate(`/artist/${artist.artistId}`);
  };

  const handleConcertClick = (concert: ConcertSearchResult) => {
    navigate(`/concert/${concert.concertId}`); // TODO: 공연 상세 페이지 경로에 맞게 수정
  };

  const hasResults = results && (results.artists.length > 0 || results.concerts.length > 0);

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
              placeholder="아티스트 또는 공연을 검색하세요"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
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
        {!debouncedQuery.trim() ? (
          <div className="text-center py-12 text-muted-foreground">
            아티스트 또는 공연/행사를 검색해보세요
          </div>
        ) : !loading && !hasResults ? (
          <div className="text-center py-12 text-muted-foreground">
            검색 결과가 없습니다
          </div>
        ) : (
          results && (
            <div className="space-y-6">
              {results.artists.length > 0 && (
                <section>
                  <h2 className="text-lg font-semibold mb-3">아티스트</h2>
                  <div className="space-y-2">
                    {results.artists.map((artist) => (
                      <Card
                        key={`artist-${artist.artistId}`}
                        className="p-4 cursor-pointer hover:bg-accent transition-colors"
                        onClick={() => handleArtistClick(artist)}
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full bg-muted flex-shrink-0 overflow-hidden">
                            {artist.profileImageUrl ? (
                              <img src={artist.profileImageUrl} alt={artist.name} className="w-full h-full object-cover" />
                            ) : (
                              <User className="w-full h-full text-muted-foreground/50 p-2" />
                            )}
                          </div>
                          <p className="font-medium text-foreground">{artist.name}</p>
                        </div>
                      </Card>
                    ))}
                  </div>
                </section>
              )}

              {results.artists.length > 0 && results.concerts.length > 0 && <Separator />}

              {results.concerts.length > 0 && (
                <section>
                  <h2 className="text-lg font-semibold mb-3">공연</h2>
                  <div className="space-y-2">
                    {results.concerts.map((concert) => (
                      <Card
                        key={`concert-${concert.concertId}`}
                        className="p-4 cursor-pointer hover:bg-accent transition-colors"
                        onClick={() => handleConcertClick(concert)}
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-lg bg-muted flex-shrink-0 overflow-hidden">
                            {concert.posterImageUrl ? (
                              <img src={concert.posterImageUrl} alt={concert.title} className="w-full h-full object-cover" />
                            ) : (
                              <Music className="w-full h-full text-muted-foreground/50 p-2" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-foreground truncate">{concert.title}</p>
                            <p className="text-sm text-muted-foreground truncate">{concert.place}</p>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </section>
              )}
            </div>
          )
        )}
      </main>
    </div>
  );
};

export default Search;