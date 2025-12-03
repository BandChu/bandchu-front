import { useEffect, useState } from 'react';
import { Edit, Link, CalendarDays, Mic, PlayCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog } from '@/components/ui/dialog';
import { formatPerformingSchedule } from '@/lib/utils';
import { toast } from 'sonner';

import ArtistProfileForm from '@/components/ArtistProfileForm'; // 범용 폼 import
import { getMyArtistProfile, createArtistProfile, updateArtistProfile } from '@/lib/api/artist';

import type { ArtistCreationPayload, ArtistDetail } from "@/types/artist";
import type { Album } from "@/types/album";
import type { Concert } from "@/types/concert";

const MyArtistProfile = () => {
  // Page state
  const [profileExists, setProfileExists] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

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
      await loadMyProfile(); // 성공 후 프로필 다시 로드
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
      setIsEditDialogOpen(false);
      await loadMyProfile(); // 성공 후 프로필 다시 로드
    } catch (error) {
      toast.error("프로필 수정에 실패했습니다.");
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
      {/* --- 프로필 생성 모달 --- */}
      <Dialog open={!profileExists && !pageLoading}>
        <ArtistProfileForm mode="create" onSubmit={handleProfileCreate} loading={formLoading} />
      </Dialog>

      {/* --- 프로필 수정 모달 --- */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <ArtistProfileForm 
          mode="edit"
          initialData={artist}
          onSubmit={handleProfileUpdate}
          onClose={() => setIsEditDialogOpen(false)}
          loading={formLoading}
        />
      </Dialog>

      <div className="relative h-[280px] bg-gradient-to-br from-purple-200/80 via-purple-100/70 to-purple-200/75">
        {artist?.profileImageUrl && <img src={artist.profileImageUrl} alt={artist.name} className="absolute inset-0 w-full h-full object-cover opacity-10" />}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
        
        {profileExists && (
          <Button variant="outline" size="sm" className="absolute top-4 right-4 z-10 bg-white/50 hover:bg-white/80" onClick={() => setIsEditDialogOpen(true)}>
            <Edit className="h-4 w-4 mr-2" />
            프로필 수정
          </Button>
        )}

        <div className="absolute bottom-6 left-6 right-6 z-10">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{artist?.name || '아티스트'}</h1>
          <p className="text-sm text-gray-600 line-clamp-2">{artist?.description || '프로필을 생성해주세요.'}</p>
        </div>
      </div>

      <Tabs defaultValue="concerts" className="px-6 py-4">
        <TabsList className="w-full grid grid-cols-4 mb-6">
          <TabsTrigger value="concerts">공연/행사</TabsTrigger>
          <TabsTrigger value="albums">앨범</TabsTrigger>
          <TabsTrigger value="posts">게시글</TabsTrigger>
          <TabsTrigger value="info">정보</TabsTrigger>
        </TabsList>

        <TabsContent value="concerts" className="space-y-4">
          <div className="mb-4"><h3 className="text-lg font-semibold text-foreground">공연/행사</h3></div>
          {concerts.length > 0 ? (
            <div className="space-y-4">
              {concerts.map((concert) => (
                <Card key={concert.concertId} className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow" onClick={() => toast.info("공연 상세 페이지는 아직 미구현입니다.")}>
                  <div className="flex gap-4 p-4">
                    <div className="w-24 h-32 rounded-lg bg-muted flex-shrink-0 overflow-hidden flex items-center justify-center">
                      {concert.posterImageUrl ? <img src={concert.posterImageUrl} alt={concert.title} className="w-full h-full object-cover" /> : <Mic className="w-10 h-10 text-muted-foreground/50" />}
                    </div>
                    <div className="flex flex-col justify-between flex-1 min-w-0">
                      <div>
                        <p className="text-sm text-primary font-semibold mb-1">{formatPerformingSchedule(concert.performingSchedule.map(s => s.date))}</p>
                        <h4 className="font-bold text-foreground mb-1 truncate">{concert.title}</h4>
                        <p className="text-sm text-muted-foreground mb-1">{concert.place}</p>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : <div className="text-center py-12 text-muted-foreground">공연/행사 정보가 없습니다</div>}
        </TabsContent>

        <TabsContent value="albums" className="space-y-4">
          <div className="mb-4"><h3 className="text-lg font-semibold text-foreground">앨범</h3></div>
          {albums.length > 0 ? (
            <div className="grid grid-cols-3 gap-4">
              {albums.map((album) => (
                <div key={album.albumId} className="space-y-2 cursor-pointer" onClick={() => toast.info("앨범 상세 페이지는 아직 미구현입니다.")}>
                  <div className="aspect-square rounded-lg bg-muted overflow-hidden flex items-center justify-center relative hover:bg-muted/80 transition-colors">
                    {album.coverImageUrl ? <img src={album.coverImageUrl} alt={album.name} className="w-full h-full object-cover" /> : <PlayCircle className="w-12 h-12 text-muted-foreground/50" />}
                  </div>
                  <p className="text-sm font-semibold text-foreground truncate">{album.name}</p>
                  <p className="text-xs text-muted-foreground">{new Date(album.releaseDate).toLocaleDateString()}</p>
                </div>
              ))}
            </div>
          ) : <div className="text-center py-12 text-muted-foreground">앨범 정보가 없습니다</div>}
        </TabsContent>
        
        <TabsContent value="posts" className="text-center py-12 text-muted-foreground">게시글이 없습니다</TabsContent>

        <TabsContent value="info" className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-2">소개</h3>
            <p className="text-foreground whitespace-pre-wrap">{artist?.description || "아직 소개가 등록되지 않았습니다."}</p>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-2">장르</h3>
            {artist && artist.genre.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {artist.genre.map((g) => <Badge key={g} variant="secondary">{g}</Badge>)}
              </div>
            ) : <p className="text-sm text-muted-foreground">등록된 장르가 없습니다.</p>}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-2">SNS</h3>
            {artist && artist.sns.length > 0 ? (
               <div className="space-y-2">
                {artist.sns.map((s) => (
                  <a key={s.platform} href={s.url} target="_blank" rel="noopener noreferrer" className="flex items-center text-sm text-foreground hover:underline">
                    <Link className="h-4 w-4 mr-2 text-muted-foreground" />
                    {s.platform}
                  </a>
                ))}
              </div>
            ) : <p className="text-sm text-muted-foreground">아직 SNS 정보를 등록하지 않았어요.</p>}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MyArtistProfile;
