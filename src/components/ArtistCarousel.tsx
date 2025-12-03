import { Plus, Check, User, ChevronRight, ChevronDown } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getGenreColorClass } from "@/lib/utils";

interface ArtistCarouselProps {
  artists: ArtistWithConcerts[];
  onArtistToggle?: (artistId: number) => void;
  selectedArtistIds?: number[];
}

const ArtistCarousel = ({ artists = [], onArtistToggle, selectedArtistIds = [] }: ArtistCarouselProps) => {
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = useState(false);

  const token = localStorage.getItem('accessToken');
  const hasSubscribedArtists = artists.length > 0;

  return (
    <div className="px-6 py-5 border-b border-border/50">
      {token ? (
        <>
          {hasSubscribedArtists ? (
            <>
              <div className="flex gap-3 overflow-x-auto py-2 scrollbar-hide items-end">
                {/* '추가하기' 버튼 */}
                <button className="flex-shrink-0 flex flex-col items-center gap-2.5" onClick={() => navigate("/artists")} title="아티스트 추가하기">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center border border-gray-200/60 hover:border-primary/40 hover:from-primary/5 hover:to-primary/10 transition-all duration-200 shadow-sm hover:shadow-md">
                    <Plus className="w-6 h-6 text-gray-500 hover:text-primary transition-colors" />
                  </div>
                  <span className="text-xs text-gray-600 whitespace-nowrap font-medium">추가하기</span>
                </button>
                
                {/* 아티스트 목록 (캐러셀) */}
                {artists.map((artist) => {
                  const isSelected = selectedArtistIds.includes(artist.artistId);
                  return (
                    <button key={artist.artistId} onClick={() => onArtistToggle?.(artist.artistId)} onDoubleClick={() => navigate(`/artist/${artist.artistId}`)}
                      className={`flex-shrink-0 flex flex-col items-center gap-2.5 transition-all duration-200 active:scale-[0.98] relative ${isSelected ? 'scale-105 z-10' : 'hover:scale-[1.02]'}`}>
                      <div className="relative">
                        <div className={`w-16 h-16 rounded-full bg-gradient-to-br from-primary/8 to-primary/12 overflow-hidden flex items-center justify-center border transition-all duration-200 shadow-sm ${isSelected ? 'border-primary/40 shadow-[0_2px_8px_rgba(0,0,0,0.08)] bg-gradient-to-br from-primary/12 to-primary/18' : 'border-gray-200/60 hover:border-primary/30 hover:shadow-[0_2px_8px_rgba(0,0,0,0.06)]'}`}>
                          {artist.profileImageUrl ? <img src={artist.profileImageUrl} alt={artist.name} className="w-full h-full object-cover" /> : <User className={`w-8 h-8 transition-colors duration-200 ${isSelected ? 'text-primary' : 'text-gray-600'}`} />}
                        </div>
                        <div className={`absolute -bottom-0.5 -right-0.5 w-5.5 h-5.5 rounded-full bg-primary flex items-center justify-center border-2 border-white shadow-[0_1px_3px_rgba(0,0,0,0.12)] transition-transform duration-200 ${isSelected ? 'scale-110' : ''}`}>
                          {isSelected && <Check className="w-2.5 h-2.5 text-white" strokeWidth={2.5} />}
                        </div>
                      </div>
                      <span className={`text-xs w-[90px] text-center leading-tight transition-all duration-200 ${isSelected ? 'text-primary font-semibold' : 'text-gray-700 hover:text-primary/70 font-medium'}`} style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', wordBreak: 'keep-all' }}>
                        {artist.name}
                      </span>
                    </button>
                  );
                })}

                {/* '펼쳐보기' 버튼 */}
                <button className="flex-shrink-0 flex flex-col items-center gap-2.5 ml-2" onClick={() => setIsExpanded(!isExpanded)} title="구독한 아티스트 목록 펼치기">
                  <div className={`w-16 h-16 rounded-full bg-gradient-to-br from-primary/8 to-primary/12 flex items-center justify-center border shadow-sm transition-all duration-200 hover:shadow-md ${isExpanded ? 'border-primary/40 bg-gradient-to-br from-primary/12 to-primary/18 shadow-[0_2px_8px_rgba(0,0,0,0.08)]' : 'border-gray-200/60 hover:border-primary/30'}`}>
                    {isExpanded ? <ChevronDown className="w-6 h-6 text-primary" strokeWidth={2} /> : <ChevronRight className="w-6 h-6 text-primary" strokeWidth={2} />}
                  </div>
                  <span className={`text-xs font-medium whitespace-nowrap transition-colors duration-200 ${isExpanded ? 'text-primary' : 'text-gray-600'}`}>{isExpanded ? '접기' : '펼쳐보기'}</span>
                </button>
              </div>

              {/* '펼쳐보기' 클릭 시 보이는 전체 목록 */}
              {isExpanded && (
                <div className="mt-6 pt-6 border-t border-gray-100/80 animate-in slide-in-from-top-2 duration-300">
                  <div className="mb-4 px-1">
                    <p className="text-sm font-semibold text-gray-700 mb-1">구독한 아티스트</p>
                    <p className="text-xs text-gray-500">총 {artists.length}명의 아티스트를 구독 중이에요</p>
                  </div>
                  <div className="space-y-1.5">
                    {artists.map((artist) => (
                      <div key={artist.artistId} className="flex items-start justify-between p-4 rounded-2xl hover:bg-gray-50/60 active:bg-gray-100/80 transition-all duration-200 cursor-pointer group border border-transparent hover:border-gray-100/60 hover:shadow-[0_1px_3px_rgba(0,0,0,0.04)]" onClick={() => navigate(`/artist/${artist.artistId}`)}>
                        <div className="flex items-start gap-3.5 flex-1 min-w-0">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/8 to-primary/12 flex items-center justify-center border border-gray-200/50 flex-shrink-0 shadow-[0_1px_2px_rgba(0,0,0,0.04)] group-hover:shadow-[0_2px_4px_rgba(0,0,0,0.06)] transition-shadow overflow-hidden">
                            {artist.profileImageUrl ? <img src={artist.profileImageUrl} alt={artist.name} className="w-full h-full object-cover" /> : <User className="w-6 h-6 text-gray-600" />}
                          </div>
                          <div className="flex-1 min-w-0 pt-0.5">
                            <h4 className="text-sm font-semibold text-gray-900 mb-1.5 leading-tight">{artist.name}</h4>
                            <p className="text-xs text-gray-500 line-clamp-2 mb-2 leading-relaxed">{artist.description || ''}</p>
                            {artist.genre && artist.genre.length > 0 && (
                              <div className="flex gap-1.5 flex-wrap">
                                {artist.genre.slice(0, 2).map((g) => (
                                  <span key={g} className={`text-xs px-2.5 py-1 rounded-full border font-medium shadow-[0_1px_2px_rgba(0,0,0,0.04)] ${getGenreColorClass(g)}`}>{g}</span>
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
              <div className="w-16 h-16 rounded-full bg-muted/30 flex items-center justify-center mb-4"><User className="w-8 h-8 text-muted-foreground/50" /></div>
              <p className="text-base font-medium text-foreground mb-1.5">구독한 아티스트가 없습니다</p>
              <p className="text-sm text-muted-foreground mb-4">아티스트를 구독하면 일정을 확인할 수 있어요</p>
              <button onClick={() => navigate("/artists")} className="text-sm text-primary hover:text-primary/80 font-medium transition-colors">아티스트 추가하기 〉</button>
            </div>
          )}
        </>
      ) : (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="w-16 h-16 rounded-full bg-muted/30 flex items-center justify-center mb-4"><User className="w-8 h-8 text-muted-foreground/50" /></div>
          <p className="text-base font-medium text-foreground mb-1.5">로그인이 필요합니다</p>
          <p className="text-sm text-muted-foreground mb-4">로그인 후 아티스트를 구독하고 일정을 확인하세요</p>
          <button onClick={() => navigate("/auth")} className="text-sm text-primary hover:text-primary/80 font-medium transition-colors">로그인하기 〉</button>
        </div>
      )}
    </div>
  );
};

export default ArtistCarousel;