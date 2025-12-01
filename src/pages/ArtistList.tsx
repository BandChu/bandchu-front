import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Search, Check, User, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import Header from "@/components/Header";
import { subscribeToArtist, unsubscribeFromArtist } from "@/lib/api/subscription";
import { toast } from "sonner";

interface Artist {
  id: number;
  name: string;
  isFollowing: boolean;
}

const ArtistList = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [loadingIds, setLoadingIds] = useState<Set<number>>(new Set());
  const [artists, setArtists] = useState<Artist[]>([
    { id: 1, name: "실리카겔", isFollowing: true },
    { id: 2, name: "장기하와 얼굴들", isFollowing: false },
    { id: 3, name: "잔나비", isFollowing: false },
    { id: 4, name: "혁오", isFollowing: true },
    { id: 5, name: "새소년", isFollowing: false },
    { id: 6, name: "딘딘", isFollowing: false },
    { id: 7, name: "기리보이", isFollowing: true },
    { id: 8, name: "에픽하이", isFollowing: false },
    { id: 9, name: "버스커 버스커", isFollowing: false },
    { id: 10, name: "10cm", isFollowing: true },
  ]);

  const filteredArtists = artists.filter((artist) =>
    artist.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleFollow = async (id: number) => {
    const artist = artists.find((a) => a.id === id);
    if (!artist) return;

    // 로그인 상태 확인
    const token = localStorage.getItem('accessToken');
    if (!token) {
      toast.error('로그인이 필요합니다.');
      navigate('/auth');
      return;
    }

    // 로딩 상태 추가
    setLoadingIds((prev) => new Set(prev).add(id));

    try {
      if (artist.isFollowing) {
        // 구독 취소
        await unsubscribeFromArtist(id);
        setArtists(artists.map((a) => 
          a.id === id ? { ...a, isFollowing: false } : a
        ));
        toast.success(`${artist.name} 구독을 취소했습니다.`);
      } else {
        // 구독하기
        await subscribeToArtist(id);
        setArtists(artists.map((a) => 
          a.id === id ? { ...a, isFollowing: true } : a
        ));
        toast.success(`${artist.name}을(를) 구독했습니다.`);
      }
    } catch (error: any) {
      console.error('구독 토글 에러:', error);
      console.error('에러 응답:', error.response?.data);
      console.error('에러 상태:', error.response?.status);
      
      let errorMessage = 
        error.response?.data?.message || 
        error.response?.data?.error || 
        error.message ||
        artist.isFollowing ? '구독 취소에 실패했습니다.' : '구독하기에 실패했습니다.';
      
      // 네트워크 에러 또는 404 에러인 경우 (서버 다운타임 가능성)
      if (!error.response || error.response?.status === 404) {
        errorMessage = '서버에 일시적인 문제가 발생했습니다. 잠시 후 다시 시도해주세요.';
      }
      
      // 403 에러인 경우
      if (error.response?.status === 403) {
        errorMessage = errorMessage || '권한이 없습니다. 로그인 상태를 확인해주세요.';
      }
      
      toast.error(errorMessage);
    } finally {
      // 로딩 상태 제거
      setLoadingIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="max-w-screen-xl mx-auto px-6 py-6">
        {/* 헤더 섹션 */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
              className="h-9 w-9"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-bold text-foreground">나의 아티스트 추가</h1>
          </div>
          
          {/* 검색 입력 */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="아티스트 검색"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12 rounded-xl border-border bg-background"
            />
          </div>
        </div>

        {/* 아티스트 목록 */}
        {filteredArtists.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {filteredArtists.map((artist) => (
              <Card
                key={artist.id}
                className="border-0 shadow-sm bg-card hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => navigate(`/artist/${artist.id}`)}
              >
                <CardContent className="p-4">
                  <div className="flex flex-col items-center gap-3">
                    <div className="relative">
                      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/10 to-primary/20 overflow-hidden flex items-center justify-center border-2 border-primary/20">
                        <User className="w-10 h-10 text-primary" />
                      </div>
                      {artist.isFollowing && (
                        <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-primary flex items-center justify-center border-2 border-background shadow-sm">
                          <Check className="w-3 h-3 text-primary-foreground" />
                        </div>
                      )}
                    </div>
                    <div className="text-center w-full">
                      <h3 className="text-sm font-semibold text-foreground truncate">
                        {artist.name}
                      </h3>
                      <Button
                        variant={artist.isFollowing ? "secondary" : "default"}
                        size="sm"
                        className="mt-2 w-full h-8 text-xs"
                        disabled={loadingIds.has(artist.id)}
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFollow(artist.id);
                        }}
                      >
                        {loadingIds.has(artist.id) ? (
                          <>
                            <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                            처리 중...
                          </>
                        ) : (
                          artist.isFollowing ? "구독 중" : "구독하기"
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-muted-foreground mb-2">검색 결과가 없습니다</p>
            <p className="text-sm text-muted-foreground">
              다른 키워드로 검색해보세요
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ArtistList;
