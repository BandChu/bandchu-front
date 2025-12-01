import { Plus, Check, User, Loader2 } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { subscribeToArtist, unsubscribeFromArtist } from "@/lib/api/subscription";
import { toast } from "sonner";

interface Artist {
  id: number;
  name: string;
  image?: string;
  isFollowing: boolean;
}

interface ArtistCarouselProps {
  onArtistToggle?: (artistId: number) => void;
  selectedArtistIds?: number[];
}

const ArtistCarousel = ({ onArtistToggle, selectedArtistIds = [] }: ArtistCarouselProps) => {
  const navigate = useNavigate();
  const [loadingIds, setLoadingIds] = useState<Set<number>>(new Set());
  // TODO: 구독 목록 조회 API 연동 필요
  const [artists, setArtists] = useState<Artist[]>([
    { id: 1, name: "실리카겔", isFollowing: true },
    { id: 2, name: "장기하와 얼굴들", isFollowing: false },
    { id: 3, name: "잔나비", isFollowing: true },
    { id: 4, name: "혁오", isFollowing: false },
  ]);

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
        {artists.map((artist) => {
          const isSelected = selectedArtistIds.includes(artist.id);
          
          return (
            <button
              key={artist.id}
              onClick={(e) => {
                if (e.detail === 2) {
                  // Double click: 상세 페이지 이동
                  navigate(`/artist/${artist.id}`);
                } else {
                  // Single click: 아티스트 토글 (캘린더에 일정 표시/제거)
                  if (onArtistToggle) {
                    onArtistToggle(artist.id);
                  }
                }
              }}
              className={`flex-shrink-0 flex flex-col items-center gap-2 transition-all ${
                isSelected ? 'scale-105' : ''
              }`}
            >
              <div className="relative">
                <div className={`w-16 h-16 rounded-full bg-gradient-to-br from-primary/10 to-primary/20 overflow-hidden flex items-center justify-center border-2 transition-all ${
                  isSelected ? 'border-primary shadow-lg ring-2 ring-primary/20' : 'border-primary/20'
                }`}>
                  <User className="w-8 h-8 text-primary" />
                </div>
                {artist.isFollowing && (
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-primary flex items-center justify-center border-2 border-background shadow-sm">
                    <Check className="w-3 h-3 text-primary-foreground" />
                  </div>
                )}
              </div>
              <span className={`text-xs max-w-[70px] truncate transition-colors ${
                isSelected ? 'text-primary font-semibold' : 'text-foreground'
              }`}>
                {artist.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default ArtistCarousel;
