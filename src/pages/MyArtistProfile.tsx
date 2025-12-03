import { useEffect, useState } from 'react';
import { Edit, Link, CalendarDays, Mic, PlayCircle, Loader2, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Dialog } from '@/components/ui/dialog';
import { formatPerformingSchedule } from '@/lib/utils';
import { toast } from 'sonner';

import ArtistProfileForm from '@/components/ArtistProfileForm';
import AddItemHeader from '@/components/AddItemHeader';
import ConcertCreationForm from '@/components/ConcertCreationForm';
import AlbumCreationForm from '@/components/AlbumCreationForm';
import { getMyArtistProfile, createArtistProfile, updateArtistProfile } from '@/lib/api/artist';
import { createConcert } from '@/lib/api/concert';
import { createAlbum } from '@/lib/api/album';

import type { ArtistCreationPayload, ArtistDetail } from "@/types/artist";
import type { Album, AlbumCreationPayload } from "@/types/album";
import type { Concert, ConcertCreationPayload } from "@/types/concert";
import EmptyState from '@/components/EmptyState';

import { getGenreColorClass, getGenreColorClassForHeader } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

const MyArtistProfile = () => {
  const navigate = useNavigate();
  
  // Page state
  const [profileExists, setProfileExists] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);
  
  // Modal states
  const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false);
  const [isConcertModalOpen, setIsConcertModalOpen] = useState(false);
  const [isAlbumModalOpen, setIsAlbumModalOpen] = useState(false);

  // Data state
  const [artist, setArtist] = useState<ArtistDetail | null>(null);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [concerts, setConcerts] = useState<Concert[]>([]);

  const loadMyProfile = async () => {
    setPageLoading(true);
    try {
      const response = await getMyArtistProfile();
      if (response.isExists) {
        setArtist(response.artist || null);
        setAlbums(response.albums || []);
        setConcerts(response.concerts || []);
        setProfileExists(true);
      } else {
        setProfileExists(false);
      }
    } catch (error) {
      toast.error("프로필 정보를 불러오는 데 실패했습니다.");
      setProfileExists(false);
    } finally {
      setPageLoading(false);
    }
  };

  useEffect(() => {
    loadMyProfile();
  }, []);

  const handleProfileCreate = async (data: ArtistCreationPayload) => {
    setFormLoading(true);
    try {
      await createArtistProfile(data);
      toast.success("프로필이 성공적으로 생성되었습니다!");
      await loadMyProfile();
    } catch (error) {
      toast.error("프로필 생성에 실패했습니다.");
    } finally {
      setFormLoading(false);
    }
  };

  const handleProfileUpdate = async (data: ArtistCreationPayload) => {
    if (!artist) return;
    setFormLoading(true);
    try {
      await updateArtistProfile(artist.artistId, data);
      toast.success("프로필이 성공적으로 수정되었습니다.");
      setIsEditProfileModalOpen(false);
      await loadMyProfile();
    } catch (error) {
      toast.error("프로필 수정에 실패했습니다.");
    } finally {
      setFormLoading(false);
    }
  };

  const handleConcertCreate = async (data: ConcertCreationPayload) => {
    setFormLoading(true);
    try {
      await createConcert(data);
      toast.success("공연/행사가 성공적으로 추가되었습니다.");
      setIsConcertModalOpen(false);
      await loadMyProfile();
    } catch (error) {
      toast.error("공연/행사 추가에 실패했습니다.");
    } finally {
      setFormLoading(false);
    }
  };

  const handleAlbumCreate = async (data: AlbumCreationPayload) => {
    setFormLoading(true);
    try {
      await createAlbum(data);
      toast.success("앨범이 성공적으로 추가되었습니다.");
      setIsAlbumModalOpen(false);
      await loadMyProfile();
    } catch (error) {
      toast.error("앨범 추가에 실패했습니다.");
    } finally {
      setFormLoading(false);
    }
  };

  if (pageLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* --- Modals --- */}
      <Dialog open={!profileExists && !pageLoading}>
        <ArtistProfileForm mode="create" onSubmit={handleProfileCreate} loading={formLoading} />
      </Dialog>
      <Dialog open={isEditProfileModalOpen} onOpenChange={setIsEditProfileModalOpen}>
        <ArtistProfileForm mode="edit" initialData={artist} onSubmit={handleProfileUpdate} onClose={() => setIsEditProfileModalOpen(false)} loading={formLoading} />
      </Dialog>
      <Dialog open={isConcertModalOpen} onOpenChange={setIsConcertModalOpen}>
        <ConcertCreationForm onSubmit={handleConcertCreate} onClose={() => setIsConcertModalOpen(false)} loading={formLoading} />
      </Dialog>
      <Dialog open={isAlbumModalOpen} onOpenChange={setIsAlbumModalOpen}>
        <AlbumCreationForm onSubmit={handleAlbumCreate} onClose={() => setIsAlbumModalOpen(false)} loading={formLoading} />
      </Dialog>

      {/* Header Section */}
      <div className="relative">
        <div className="relative h-[400px] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 overflow-hidden">
          {artist?.profileImageUrl ? (
            <>
              <img src={artist.profileImageUrl} alt={artist.name} className="w-full h-full object-cover object-center opacity-70" style={{ objectFit: 'cover', objectPosition: 'center top' }} />
              <div className="absolute inset-0 bg-black/40" />
            </>
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary/20 via-primary/10 to-primary/5 flex items-center justify-center">
              <Mic className="w-20 h-20 text-white/30" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-black/0 via-black/30 to-black/70" />
          {profileExists && (
            <Button variant="ghost" size="icon" className="absolute top-6 right-4 z-20 bg-white/10 backdrop-blur-md hover:bg-white/20 rounded-full border border-white/20" onClick={() => setIsEditProfileModalOpen(true)}>
              <Edit className="h-5 w-5 text-white" />
            </Button>
          )}
          <div className="absolute bottom-0 left-0 right-0 z-10 px-6 pb-8 pt-20">
            <h1 className="text-4xl font-bold text-white mb-3 tracking-tight drop-shadow-lg">{artist?.name || '아티스트'}</h1>
            <p className="text-base text-white/90 mb-4 leading-relaxed line-clamp-2 drop-shadow-md">{artist?.description || '프로필을 생성해주세요.'}</p>
            {artist?.genre && artist.genre.length > 0 && (
              <div className="flex gap-2 flex-wrap">
                {artist.genre.slice(0, 3).map((g) => (
                  <span key={g} className={`px-4 py-1.5 text-sm font-medium rounded-full border backdrop-blur-sm transition-all hover:scale-105 ${getGenreColorClassForHeader(g)}`}>{g}</span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <Tabs defaultValue="concerts" className="pt-6">
        <TabsList className="w-full grid grid-cols-4 mb-0 bg-transparent h-auto border-b border-border/50 rounded-none px-6">
          <TabsTrigger value="concerts" className="text-sm font-semibold data-[state=active]:text-foreground data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent rounded-none pb-3 text-muted-foreground">공연/행사</TabsTrigger>
          <TabsTrigger value="albums" className="text-sm font-semibold data-[state=active]:text-foreground data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent rounded-none pb-3 text-muted-foreground">앨범</TabsTrigger>
          <TabsTrigger value="posts" className="text-sm font-semibold data-[state=active]:text-foreground data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent rounded-none pb-3 text-muted-foreground">게시글</TabsTrigger>
          <TabsTrigger value="info" className="text-sm font-semibold data-[state=active]:text-foreground data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent rounded-none pb-3 text-muted-foreground">정보</TabsTrigger>
        </TabsList>

        <TabsContent value="concerts" className="mt-6 px-6 pb-6">
          <AddItemHeader title="공연/행사" buttonText="추가" onButtonClick={() => setIsConcertModalOpen(true)} />
          {concerts.length > 0 ? (
            <div className="space-y-4">
              {concerts.map((concert) => (
                <div key={concert.concertId} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-border/30 hover:shadow-md transition-all duration-200 cursor-pointer group" onClick={() => navigate(`/concert/${concert.concertId}`)}>
                  <div className="flex gap-4 p-4">
                    <div className="w-24 h-32 flex-shrink-0 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 overflow-hidden">
                      {concert.posterImageUrl ? <img src={concert.posterImageUrl} alt={concert.title} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/5 to-primary/10"><Mic className="w-8 h-8 text-primary/30" /></div>}
                    </div>
                    <div className="flex flex-col flex-1 min-w-0">
                      <div className="flex-1 space-y-1.5"><p className="text-xs font-semibold text-primary">{formatPerformingSchedule(concert.performingSchedule.map(s => s.date))}</p><h4 className="text-base font-bold text-foreground line-clamp-2 leading-tight">{concert.title}</h4><p className="text-sm text-muted-foreground">{concert.place}</p></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : <EmptyState icon={Mic} message="공연/행사 정보가 없습니다" description="새로운 공연을 추가해보세요." />}
        </TabsContent>

        <TabsContent value="albums" className="mt-6 px-6 pb-6">
          <AddItemHeader title="앨범" buttonText="추가" onButtonClick={() => setIsAlbumModalOpen(true)} />
          {albums.length > 0 ? (
            <div className="grid grid-cols-3 gap-3">
              {albums.map((album) => (
                <div key={album.albumId} className="space-y-2 cursor-pointer group" onClick={() => navigate(`/album/${album.albumId}`)}>
                  <div className="aspect-square rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 group-hover:scale-[1.03]">
                    {album.coverImageUrl ? <img src={album.coverImageUrl} alt={album.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" /> : <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/5 to-primary/10"><PlayCircle className="w-12 h-12 text-primary/30" /></div>}
                  </div>
                  <div><p className="text-sm font-semibold text-foreground truncate leading-tight">{album.name}</p><p className="text-xs text-muted-foreground mt-0.5">{new Date(album.releaseDate).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })}</p></div>
                </div>
              ))}
            </div>
          ) : <EmptyState icon={PlayCircle} message="앨범 정보가 없습니다" description="새로운 앨범을 추가해보세요." />}
        </TabsContent>
        
        <TabsContent value="posts" className="mt-6 px-6 pb-6">
          <EmptyState icon={FileText} message="게시글이 없습니다" />
        </TabsContent>

        <TabsContent value="info" className="mt-6 px-6 pb-6 space-y-8">
          <div className="space-y-4"><h3 className="text-lg font-bold text-foreground">소개</h3><div className="bg-white rounded-2xl p-6 border border-border/30 shadow-sm"><p className="text-foreground whitespace-pre-wrap leading-relaxed text-sm">{artist?.description || "아직 소개가 등록되지 않았습니다."}</p></div></div>
          <div className="space-y-4"><h3 className="text-lg font-bold text-foreground">장르</h3>{artist?.genre && artist.genre.length > 0 ? <div className="flex flex-wrap gap-2">{artist.genre.map((g) => <span key={g} className={`px-4 py-2 text-sm font-medium rounded-full border transition-all hover:scale-105 ${getGenreColorClass(g)}`}>{g}</span>)}</div> : <div className="bg-white rounded-2xl p-6 border border-border/30 shadow-sm"><p className="text-sm text-muted-foreground">다양한 장르의 음악을 하고 있어요.</p></div>}</div>
          <div className="space-y-4"><h3 className="text-lg font-bold text-foreground">SNS</h3>{artist?.sns && artist.sns.length > 0 ? <div className="space-y-2">{artist.sns.map((s) => <a key={s.platform} href={s.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 bg-white rounded-2xl p-4 border border-border/30 shadow-sm hover:shadow-md transition-all hover:border-primary/30 group"><div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center group-hover:bg-primary/10 transition-colors"><Link className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" /></div><span className="font-semibold text-foreground text-sm">{s.platform}</span></a>)}</div> : <div className="bg-white rounded-2xl p-6 border border-border/30 shadow-sm"><p className="text-sm text-muted-foreground">아직 SNS 정보를 등록하지 않았어요.</p></div>}</div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MyArtistProfile;