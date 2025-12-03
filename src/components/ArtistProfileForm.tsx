import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { X } from 'lucide-react';
import {
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogContent,
} from '@/components/ui/dialog';
import { ArtistCreationPayload, SnsLink, ArtistDetail } from '@/types/artist';

interface ArtistProfileFormProps {
  mode: 'create' | 'edit';
  initialData?: ArtistDetail | null;
  onSubmit: (data: ArtistCreationPayload) => void;
  loading: boolean;
  onClose?: () => void; // onClose is optional, only needed for edit mode
}

const GENRE_OPTIONS = ["BALLAD", "DANCE", "RAP", "HIPHOP", "ROCK", "METAL", "POP", "INDIE", "JAZZ", "JPOP"];
const SNS_PLATFORMS = ["YOUTUBE", "INSTAGRAM", "SOUNDCLOUD"];

const ArtistProfileForm = ({ mode, initialData, onSubmit, loading, onClose }: ArtistProfileFormProps) => {
  const [name, setName] = useState('');
  const [profileImageUrl, setProfileImageUrl] = useState('');
  const [description, setDescription] = useState('');
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [snsLinks, setSnsLinks] = useState<SnsLink[]>([{ platform: '', url: '' }]);

  useEffect(() => {
    if (mode === 'edit' && initialData) {
      setName(initialData.name || '');
      setProfileImageUrl(initialData.profileImageUrl || '');
      setDescription(initialData.description || '');
      setSelectedGenres(initialData.genre || []);
      setSnsLinks(initialData.sns.length > 0 ? initialData.sns : [{ platform: '', url: '' }]);
    }
  }, [mode, initialData]);

  const handleSnsChange = (index: number, field: keyof SnsLink, value: string) => {
    const newSnsLinks = [...snsLinks];
    newSnsLinks[index][field] = value;
    setSnsLinks(newSnsLinks);
  };

  const addSnsField = () => {
    setSnsLinks([...snsLinks, { platform: '', url: '' }]);
  };

  const removeSnsField = (index: number) => {
    const newSnsLinks = snsLinks.filter((_, i) => i !== index);
    setSnsLinks(newSnsLinks);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload: ArtistCreationPayload = {
      name,
      profileImageUrl,
      description,
      genre: selectedGenres,
      sns: snsLinks.filter(link => link.platform && link.url),
    };
    onSubmit(payload);
  };

  const isCreateMode = mode === 'create';

  return (
    <DialogContent
      className="sm:max-w-2xl"
      onInteractOutside={(e) => { if (isCreateMode) e.preventDefault(); }}
      onEscapeKeyDown={(e) => { if (isCreateMode) e.preventDefault(); }}
    >
      <form onSubmit={handleSubmit}>
        <DialogHeader>
          <DialogTitle>{isCreateMode ? '아티스트 프로필 생성' : '프로필 수정'}</DialogTitle>
          <DialogDescription>
            {isCreateMode 
              ? 'Bandchu 활동을 시작하기 위해, 아티스트 프로필을 먼저 생성해야 합니다.'
              : '아티스트 프로필을 수정합니다. 변경사항을 저장하려면 \'저장\'을 클릭하세요.'
            }
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 py-6 max-h-[60vh] overflow-y-auto pr-4">
          {/* Artist Name */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">아티스트명</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="col-span-3" placeholder="활동명을 입력하세요" required />
          </div>

          {/* Profile Image URL */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="profileImageUrl" className="text-right">프로필 이미지 URL</Label>
            <Input id="profileImageUrl" type="url" value={profileImageUrl} onChange={(e) => setProfileImageUrl(e.target.value)} className="col-span-3" placeholder="https://..." />
          </div>

          {/* Description */}
          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="description" className="text-right pt-2">소개</Label>
            <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} className="col-span-3" placeholder="아티스트를 소개하는 글을 작성해주세요" rows={4} />
          </div>

          {/* Genres */}
          <div className="grid grid-cols-4 items-start gap-4">
            <Label className="text-right pt-2">장르</Label>
            <ToggleGroup type="multiple" value={selectedGenres} onValueChange={setSelectedGenres} className="col-span-3 flex-wrap justify-start gap-2">
              {GENRE_OPTIONS.map(genre => (
                <ToggleGroupItem key={genre} value={genre} aria-label={`Toggle ${genre}`} variant="outline" className="rounded-full">
                  {genre}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>

          {/* SNS Links */}
          <div className="grid grid-cols-4 items-start gap-4">
            <Label className="text-right pt-2">SNS</Label>
            <div className="col-span-3 space-y-3">
              {snsLinks.map((link, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Select value={link.platform} onValueChange={(value) => handleSnsChange(index, 'platform', value)}>
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="플랫폼 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      {SNS_PLATFORMS.map(platform => (
                        <SelectItem key={platform} value={platform}>{platform}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input type="url" value={link.url} onChange={(e) => handleSnsChange(index, 'url', e.target.value)} placeholder="https://..." />
                  {snsLinks.length > 1 && (
                    <Button type="button" variant="ghost" size="icon" onClick={() => removeSnsField(index)}>
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" onClick={addSnsField}>
                SNS 추가
              </Button>
            </div>
          </div>
        </div>
        <DialogFooter>
          {!isCreateMode && (
            <Button type="button" variant="outline" onClick={onClose}>
              취소
            </Button>
          )}
          <Button type="submit" className={isCreateMode ? 'w-full' : ''} disabled={!name || loading}>
            {loading 
              ? (isCreateMode ? '생성 중...' : '저장 중...')
              : (isCreateMode ? '프로필 생성하고 시작하기' : '저장')
            }
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
};

export default ArtistProfileForm;
