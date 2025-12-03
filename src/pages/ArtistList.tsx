import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Search, Check, User, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import Header from "@/components/Header";
import { subscribeToArtist, unsubscribeFromArtist, getSubscriptions } from "@/lib/api/subscription";
import { toast } from "sonner";
import { getAllArtists } from "@/data/artistSchedules";
import apiClient from "@/lib/api";
import { ArtistsApiResponse } from "@/types/artist";

interface Artist {
  id: number;
  name: string;
  profileImageUrl?: string;
  isFollowing: boolean;
}

const ArtistList = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [loadingIds, setLoadingIds] = useState<Set<number>>(new Set());
  const [artists, setArtists] = useState<Artist[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadArtists = async () => {
      setLoading(true);
      try {
        // 먼저 API 호출 시도
        const response = await apiClient.get<ArtistsApiResponse>('/api/artists');
        
        if (response.data.success && response.data.data.artists) {
          const apiArtists: Artist[] = response.data.data.artists.map(artist => ({
            id: artist.artistId,
            name: artist.name,
            profileImageUrl: artist.profileImageUrl,
            isFollowing: false,
          }));
          setArtists(apiArtists);
        } else {
          throw new Error(response.data.message || '아티스트 목록을 불러오는데 실패했습니다.');
        }
      } catch (error: any) {
        console.warn('아티스트 목록 API 호출 실패, Mock 데이터로 폴백:', error.message);
        // API 실패 시 Mock 데이터로 폴백
        const allArtistsData = getAllArtists();
        const mockArtists: Artist[] = allArtistsData.map(artist => ({
          ...artist,
          isFollowing: false,
        }));
        setArtists(mockArtists);
      } finally {
        setLoading(false);
      }

      // 구독 상태 업데이트
      const token = localStorage.getItem('accessToken');
      if (!token) return;

      try {
        const subscriptions = await getSubscriptions();
        const subscribedIds = new Set(subscriptions.map(s => s.artiProfileId));
        
        setArtists(prev => prev.map(artist => ({
          ...artist,
          isFollowing: subscribedIds.has(artist.id),
        })));
      } catch (error) {
        console.error('구독 목록 로드 실패:', error);
      }
    };

    loadArtists();
  }, []);

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
        setArtists((prev) => prev.map((a) => 
          a.id === id ? { ...a, isFollowing: false } : a
        ));
        toast.success(`${artist.name} 구독을 취소했습니다.`);
      } else {
        // 구독하기
        await subscribeToArtist(id);
        setArtists((prev) => prev.map((a) => 
          a.id === id ? { ...a, isFollowing: true } : a
        ));
        toast.success(`${artist.name}을(를) 구독했습니다.`);
      }
    } catch (error: any) {
      const errorMessage = error.message || 
        (artist.isFollowing ? '구독 취소에 실패했습니다.' : '구독하기에 실패했습니다.');
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
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-screen-xl mx-auto px-6 py-6">
        {/* 헤더 섹션 */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-5">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
              className="h-9 w-9 hover:bg-gray-100 rounded-lg"
            >
              <ArrowLeft className="h-5 w-5 text-gray-700" />
            </Button>
            <h1 className="text-2xl font-bold text-gray-900">나의 아티스트 추가</h1>
          </div>
          
          {/* 검색 입력 */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              type="text"
              placeholder="아티스트 검색"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-11 h-12 rounded-xl border-gray-200 bg-white shadow-sm hover:shadow-md focus:shadow-md transition-shadow focus:border-primary/40"
            />
          </div>
        </div>

        {/* 아티스트 목록 */}
        {loading ? (
          <div className="text-center py-20">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-gray-400" />
            <p className="text-gray-500">아티스트 목록을 불러오는 중...</p>
          </div>
        ) : filteredArtists.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {filteredArtists.map((artist) => (
              <Card
                key={artist.id}
                className="border border-gray-200/60 shadow-sm bg-white hover:shadow-[0_2px_8px_rgba(0,0,0,0.08)] transition-all duration-200 cursor-pointer rounded-xl overflow-hidden"
                onClick={() => navigate(`/artist/${artist.id}`)}
              >
                <CardContent className="p-5">
                  <div className="flex flex-col items-center gap-4">
                    <div className="relative">
                      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/8 to-primary/12 overflow-hidden flex items-center justify-center border border-gray-200/60 shadow-sm">
                        {artist.profileImageUrl ? (
                          <img 
                            src={artist.profileImageUrl} 
                            alt={artist.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              // 이미지 로드 실패 시 img를 숨기고 부모에 아이콘 표시
                              const img = e.target as HTMLImageElement;
                              img.style.display = 'none';
                              if (!img.nextElementSibling) {
                                const icon = document.createElement('div');
                                icon.className = 'absolute inset-0 flex items-center justify-center';
                                icon.innerHTML = '<svg class="w-10 h-10 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>';
                                img.parentElement?.appendChild(icon);
                              }
                            }}
                          />
                        ) : (
                          <User className="w-10 h-10 text-gray-600" />
                        )}
                      </div>
                      {artist.isFollowing && (
                        <div className="absolute -bottom-0.5 -right-0.5 w-5.5 h-5.5 rounded-full bg-primary flex items-center justify-center border-2 border-white shadow-[0_1px_3px_rgba(0,0,0,0.12)]">
                          <Check className="w-2.5 h-2.5 text-white" strokeWidth={2.5} />
                        </div>
                      )}
                    </div>
                    <div className="text-center w-full">
                      <h3 className="text-sm font-semibold text-gray-900 truncate mb-3">
                        {artist.name}
                      </h3>
                      <Button
                        variant={artist.isFollowing ? "secondary" : "default"}
                        size="sm"
                        className={`mt-2 w-full h-9 text-xs font-medium rounded-lg transition-all duration-200 ${
                          artist.isFollowing
                            ? 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200/60'
                            : 'bg-primary text-white hover:bg-primary/90 shadow-sm hover:shadow-md'
                        }`}
                        disabled={loadingIds.has(artist.id)}
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFollow(artist.id);
                        }}
                      >
                        {loadingIds.has(artist.id) ? (
                          <>
                            <Loader2 className="w-3 h-3 mr-1.5 animate-spin" />
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
          <div className="text-center py-20">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-700 font-medium mb-1.5">검색 결과가 없습니다</p>
            <p className="text-sm text-gray-500">
              다른 키워드로 검색해보세요
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ArtistList;
