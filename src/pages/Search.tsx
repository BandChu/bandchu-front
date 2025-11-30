import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Search as SearchIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

interface SearchResult {
  id: number;
  type: "artist" | "event";
  name: string;
  subtitle?: string;
}

const Search = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  // Mock search results
  const getSearchResults = (query: string): SearchResult[] => {
    if (!query) return [];

    const allResults: SearchResult[] = [
      { id: 1, type: "artist", name: "실리카겔" },
      { id: 2, type: "artist", name: "실리카코" },
      {
        id: 3,
        type: "event",
        name: "실리카코 공연",
        subtitle: "12.27(토) | 콘서트 | 일산 킨텍스",
      },
    ];

    return allResults.filter(
      (result) =>
        result.name.toLowerCase().includes(query.toLowerCase()) ||
        result.subtitle?.toLowerCase().includes(query.toLowerCase())
    );
  };

  const results = getSearchResults(searchQuery);

  const handleResultClick = (result: SearchResult) => {
    if (result.type === "artist") {
      navigate(`/artist/${result.id}`);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-background border-b border-border px-6 py-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1 relative">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="아티스트"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              autoFocus
            />
          </div>
        </div>
      </header>

      <main className="px-6 py-4">
        {searchQuery && results.length > 0 ? (
          <div className="space-y-2">
            {results.map((result) => (
              <Card
                key={`${result.type}-${result.id}`}
                className="p-4 cursor-pointer hover:bg-accent transition-colors"
                onClick={() => handleResultClick(result)}
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/60 to-primary/90 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground">{result.name}</p>
                    {result.subtitle && (
                      <p className="text-sm text-muted-foreground">{result.subtitle}</p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      {result.type === "artist" ? "아티스트" : "공연/행사"}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : searchQuery ? (
          <div className="text-center py-12 text-muted-foreground">
            검색 결과가 없습니다
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            아티스트 또는 공연/행사를 검색해보세요
          </div>
        )}
      </main>
    </div>
  );
};

export default Search;
