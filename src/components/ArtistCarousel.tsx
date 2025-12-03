import { Plus, Check, User, Loader2, ChevronRight, ChevronDown } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { subscribeToArtist, unsubscribeFromArtist, getSubscriptions } from "@/lib/api/subscription";
import { toast } from "sonner";
import { getAllArtists } from "@/data/artistSchedules";
import { Badge } from "@/components/ui/badge";
import apiClient from "@/lib/api";
import { ArtistsApiResponse, ArtistDetail } from "@/types/artist";

interface Artist {
  id: number;
  name: string;
  image?: string;
  profileImageUrl?: string;
  isFollowing: boolean;
  genre?: string[];
  description?: string;
}

const artistGenres: Record<number, string[]> = {
  1: ['인디 록', '록'],
  2: ['인디 록', '록'],
  3: ['인디 록', '록'],
  4: ['인디 록', '록'],
  5: ['인디 록', '록'],
  6: ['힙합', '랩'],
  7: ['힙합', '랩'],
  8: ['힙합', '랩'],
  9: ['인디 록', '록'],
  10: ['인디 록', '록'],
};

const artistDescriptions: Record<number, string> = {
  1: '감성적인 인디 록 밴드로 따뜻한 멜로디와 진솔한 가사로 사랑받고 있어요.',
  2: '독특한 사운드와 유머러스한 가사로 많은 사랑을 받는 인디 밴드예요.',
  3: '감성적인 발라드와 록을 결합한 음악으로 많은 이들의 마음을 사로잡아요.',
  4: '독창적인 사운드와 감각적인 연주로 인디씬의 대표 밴드예요.',
  5: '따뜻하고 서정적인 음악으로 많은 사랑을 받고 있어요.',
  6: '독창적인 플로우와 감각적인 비트로 힙합씬을 대표하는 아티스트예요.',
  7: '독특한 스타일과 진솔한 가사로 많은 사랑을 받는 힙합 아티스트예요.',
  8: '깊이 있는 가사와 감각적인 비트로 힙합의 새로운 지평을 열어가고 있어요.',
  9: '따뜻하고 감성적인 음악으로 많은 이들의 마음을 따뜻하게 해주는 밴드예요.',
  10: '서정적이고 감성적인 발라드로 많은 사랑을 받고 있어요.',
};

const genreColors: Record<string, string> = {
  '인디 록': 'bg-blue-50 text-blue-600 border-blue-200/60',
  '록': 'bg-red-50 text-red-600 border-red-200/60',
  '힙합': 'bg-purple-50 text-purple-600 border-purple-200/60',
  '랩': 'bg-orange-50 text-orange-600 border-orange-200/60',
  '팝': 'bg-pink-50 text-pink-600 border-pink-200/60',
  '발라드': 'bg-cyan-50 text-cyan-600 border-cyan-200/60',
  'R&B': 'bg-indigo-50 text-indigo-600 border-indigo-200/60',
  '일렉트로닉': 'bg-green-50 text-green-600 border-green-200/60',
};

const getGenreColorClass = (genre: string): string => {
  return genreColors[genre] || 'bg-muted text-muted-foreground border-border';
};

interface ArtistCarouselProps {
  onArtistToggle?: (artistId: number) => void;
  selectedArtistIds?: number[];
}

const ArtistCarousel = ({ onArtistToggle, selectedArtistIds = [] }: ArtistCarouselProps) => {
  const navigate = useNavigate();
  const [loadingIds, setLoadingIds] = useState<Set<number>>(new Set());
  const [artists, setArtists] = useState<Artist[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);

  // 구독된 아티스트 목록 로드 (API에서 description 포함)
  const loadSubscribedArtists = async () => {
    try {
      // 먼저 API를 통해 실제 아티스트 목록 가져오기
      const response = await apiClient.get<ArtistsApiResponse>('/api/artists');
      if (response.data.success && response.data.data.artists) {
        // 구독 목록 가져오기
        const subscriptions = await getSubscriptions();
        const subscribedIds = new Set(subscriptions.map(s => s.artiProfileId));
        
        // 구독된 아티스트만 필터링하고, 각 아티스트의 상세 정보 가져오기
        const subscribedArtistsPromises = response.data.data.artists
          .filter(artist => subscribedIds.has(artist.artistId))
          .map(async (artist) => {
            try {
              // 각 아티스트의 상세 정보 가져오기 (description 포함)
              const detailResponse = await apiClient.get<{ success: boolean; data: ArtistDetail; message: string }>(
                `/api/artists/${artist.artistId}`
              );
              if (detailResponse.data.success) {
                return {
                  id: artist.artistId,
                  name: artist.name,
                  profileImageUrl: detailResponse.data.data.profileImageUrl || artist.profileImageUrl,
                  description: detailResponse.data.data.description || artistDescriptions[artist.artistId] || '',
                  genre: detailResponse.data.data.genre || artistGenres[artist.artistId] || [],
                };
              }
            } catch (e) {
              // 상세 정보 가져오기 실패 시 기본 정보만 사용
            }
            return {
              id: artist.artistId,
              name: artist.name,
              profileImageUrl: artist.profileImageUrl,
              description: artistDescriptions[artist.artistId] || '',
              genre: artistGenres[artist.artistId] || [],
            };
          });
        
        const subscribedArtists = await Promise.all(subscribedArtistsPromises);
        setArtists(subscribedArtists.map(artist => ({
          ...artist,
          isFollowing: true,
        })));
        return;
      } else {
        throw new Error(response.data.message || '아티스트 목록을 불러오는데 실패했습니다.');
      }
    } catch (error) {
      console.warn('아티스트 목록 API 호출 실패, Mock 데이터로 폴백:', error.message);
      // API 실패 시 Mock 데이터로 폴백
      const allArtistsData = getAllArtists();
      const subscriptions = await getSubscriptions();
      const subscribedIds = new Set(subscriptions.map(s => s.artiProfileId));
      
      const subscribedArtists = allArtistsData
        .filter(artist => subscribedIds.has(artist.id))
        .map(artist => ({
          ...artist,
          isFollowing: true,
          genre: artistGenres[artist.id] || [],
          description: artistDescriptions[artist.id] || '',
        }));
      
      setArtists(subscribedArtists);
    }
  };

  useEffect(() => {
    const loadSubscriptions = async () => {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        setArtists([]);
        return;
      }

      try {
        await loadSubscribedArtists();
      } catch (error) {
        console.error('구독 목록 로드 실패:', error);
        setArtists([]);
      }
    };

    loadSubscriptions();
  }, []);

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
        toast.success(`${artist.name} 구독을 취소했습니다.`);
      } else {
        // 구독하기
        await subscribeToArtist(id);
        toast.success(`${artist.name}을(를) 구독했습니다.`);
      }
      
      // 구독 목록 다시 로드
      await loadSubscribedArtists();
      
      window.dispatchEvent(new CustomEvent('subscriptionChanged'));
    } catch (error) {
      let errorMessage = (artist.isFollowing ? '구독 취소에 실패했습니다.' : '구독하기에 실패했습니다.');
      
      if (error && typeof error === 'object' && 'message' in error && typeof error.message === 'string') {
        errorMessage = error.message;
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

  const token = localStorage.getItem('accessToken');
  const hasSubscribedArtists = artists.length > 0;

  return (
    <div className="px-6 py-5 border-b border-border/50">
      {token ? (
        <>
          {hasSubscribedArtists ? (
            <>
            <div className="flex gap-3 overflow-x-auto py-2 scrollbar-hide items-end">
              <button 
                className="flex-shrink-0 flex flex-col items-center gap-2.5"
                onClick={() => navigate("/artists")}
                title="아티스트 추가하기"
              >
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center border border-gray-200/60 hover:border-primary/40 hover:from-primary/5 hover:to-primary/10 transition-all duration-200 shadow-sm hover:shadow-md">
                  <Plus className="w-6 h-6 text-gray-500 hover:text-primary transition-colors" />
                </div>
                <span className="text-xs text-gray-600 whitespace-nowrap font-medium">
                  추가하기
                </span>
              </button>
              {artists.map((artist) => {
          const isSelected = selectedArtistIds.includes(artist.id);
          
          return (
            <button
              key={artist.id}
              onClick={(e) => {
                e.preventDefault();
                // Single click: 아티스트 토글 (캘린더에 일정 표시/제거)
                if (onArtistToggle) {
                  onArtistToggle(artist.id);
                }
              }}
              onDoubleClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                // Double click: 상세 페이지 이동
                navigate(`/artist/${artist.id}`);
              }}
              className={`flex-shrink-0 flex flex-col items-center gap-2.5 transition-all duration-200 active:scale-[0.98] relative ${
                isSelected ? 'scale-105 z-10' : 'hover:scale-[1.02]'
              }`}
            >
              <div className="relative">
                <div className={`w-16 h-16 rounded-full bg-gradient-to-br from-primary/8 to-primary/12 overflow-hidden flex items-center justify-center border transition-all duration-200 shadow-sm ${
                  isSelected 
                    ? 'border-primary/40 shadow-[0_2px_8px_rgba(0,0,0,0.08)] bg-gradient-to-br from-primary/12 to-primary/18' 
                    : 'border-gray-200/60 hover:border-primary/30 hover:shadow-[0_2px_8px_rgba(0,0,0,0.06)]'
                }`}>
                  <User className={`w-8 h-8 transition-colors duration-200 ${
                    isSelected ? 'text-primary' : 'text-gray-600'
                  }`} />
                </div>
                {artist.isFollowing && (
                  <div className={`absolute -bottom-0.5 -right-0.5 w-5.5 h-5.5 rounded-full bg-primary flex items-center justify-center border-2 border-white shadow-[0_1px_3px_rgba(0,0,0,0.12)] transition-transform duration-200 ${
                    isSelected ? 'scale-110' : ''
                  }`}>
                    {isSelected && <Check className="w-2.5 h-2.5 text-white" strokeWidth={2.5} />}
                  </div>
                )}
              </div>
              <span className={`text-xs w-[90px] text-center leading-tight transition-all duration-200 ${
                isSelected 
                  ? 'text-primary font-semibold' 
                  : 'text-gray-700 hover:text-primary/70 font-medium'
              }`} style={{
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                wordBreak: 'keep-all',
              }}>
                {artist.name}
              </span>
            </button>
          );
        })}
              <button 
                className="flex-shrink-0 flex flex-col items-center gap-2.5 ml-2"
                onClick={() => setIsExpanded(!isExpanded)}
                title="구독한 아티스트 목록 펼치기"
              >
                <div className={`w-16 h-16 rounded-full bg-gradient-to-br from-primary/8 to-primary/12 flex items-center justify-center border shadow-sm transition-all duration-200 hover:shadow-md ${
                  isExpanded 
                    ? 'border-primary/40 bg-gradient-to-br from-primary/12 to-primary/18 shadow-[0_2px_8px_rgba(0,0,0,0.08)]' 
                    : 'border-gray-200/60 hover:border-primary/30'
                }`}>
                  {isExpanded ? (
                    <ChevronDown className="w-6 h-6 text-primary" strokeWidth={2} />
                  ) : (
                    <ChevronRight className="w-6 h-6 text-primary" strokeWidth={2} />
                  )}
                </div>
                <span className={`text-xs font-medium whitespace-nowrap transition-colors duration-200 ${
                  isExpanded ? 'text-primary' : 'text-gray-600'
                }`}>
                  {isExpanded ? '접기' : '펼쳐보기'}
                </span>
              </button>
            </div>
            {isExpanded && (
              <div className="mt-6 pt-6 border-t border-gray-100/80 animate-in slide-in-from-top-2 duration-300">
                <div className="mb-4 px-1">
                  <p className="text-sm font-semibold text-gray-700 mb-1">
                    구독한 아티스트
                  </p>
                  <p className="text-xs text-gray-500">
                    총 {artists.length}명의 아티스트를 구독 중이에요
                  </p>
                </div>
                <div className="space-y-1.5">
                  {artists.map((artist) => (
                    <div
                      key={artist.id}
                      className="flex items-start justify-between p-4 rounded-2xl hover:bg-gray-50/60 active:bg-gray-100/80 transition-all duration-200 cursor-pointer group border border-transparent hover:border-gray-100/60 hover:shadow-[0_1px_3px_rgba(0,0,0,0.04)]"
                      onClick={() => navigate(`/artist/${artist.id}`)}
                    >
                      <div className="flex items-start gap-3.5 flex-1 min-w-0">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/8 to-primary/12 flex items-center justify-center border border-gray-200/50 flex-shrink-0 shadow-[0_1px_2px_rgba(0,0,0,0.04)] group-hover:shadow-[0_2px_4px_rgba(0,0,0,0.06)] transition-shadow">
                          <User className="w-6 h-6 text-gray-600" />
                        </div>
                        <div className="flex-1 min-w-0 pt-0.5">
                          <h4 className="text-sm font-semibold text-gray-900 mb-1.5 leading-tight">
                            {artist.name}
                          </h4>
                          {artist.description && (
                            <p className="text-xs text-gray-500 line-clamp-2 mb-2 leading-relaxed">
                              {artist.description}
                            </p>
                          )}
                          {artist.genre && artist.genre.length > 0 && (
                            <div className="flex gap-1.5 flex-wrap">
                              {artist.genre.slice(0, 2).map((g) => (
                                <span
                                  key={g}
                                  className={`text-xs px-2.5 py-1 rounded-full border font-medium shadow-[0_1px_2px_rgba(0,0,0,0.04)] ${getGenreColorClass(g)}`}
                                >
                                  {g}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-300 flex-shrink-0 ml-4 mt-1 group-hover:text-gray-500 transition-colors" />
                    </div>
                  ))}
                </div>
              </div>
            )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="w-16 h-16 rounded-full bg-muted/30 flex items-center justify-center mb-4">
                <User className="w-8 h-8 text-muted-foreground/50" />
              </div>
              <p className="text-base font-medium text-foreground mb-1.5">
                구독한 아티스트가 없습니다
              </p>
              <p className="text-sm text-muted-foreground mb-4">
                아티스트를 구독하면 일정을 확인할 수 있어요
              </p>
              <button
                onClick={() => navigate("/artists")}
                className="text-sm text-primary hover:text-primary/80 font-medium transition-colors"
              >
                아티스트 추가하기 〉
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="w-16 h-16 rounded-full bg-muted/30 flex items-center justify-center mb-4">
            <User className="w-8 h-8 text-muted-foreground/50" />
          </div>
          <p className="text-base font-medium text-foreground mb-1.5">
            로그인이 필요합니다
          </p>
          <p className="text-sm text-muted-foreground mb-4">
            로그인 후 아티스트를 구독하고 일정을 확인하세요
          </p>
          <button
            onClick={() => navigate("/auth")}
            className="text-sm text-primary hover:text-primary/80 font-medium transition-colors"
          >
            로그인하기 〉
          </button>
        </div>
      )}
    </div>
  );
};

export default ArtistCarousel;
