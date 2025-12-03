import { useState } from 'react';
import { format } from "date-fns";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar as CalendarIcon, Plus, X } from 'lucide-react';
import {
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogContent,
} from '@/components/ui/dialog';
import { AlbumCreationPayload, TrackCreationPayload } from '@/types/album';
import { cn } from "@/lib/utils";

interface AlbumCreationFormProps {
  onSubmit: (data: AlbumCreationPayload) => void;
  onClose: () => void;
  loading: boolean;
}

const AlbumCreationForm = ({ onSubmit, onClose, loading }: AlbumCreationFormProps) => {
  const [name, setName] = useState('');
  const [coverImageUrl, setCoverImageUrl] = useState('');
  const [releaseDate, setReleaseDate] = useState<Date | undefined>();
  const [description, setDescription] = useState('');
  const [tracks, setTracks] = useState<TrackCreationPayload[]>([{ name: '', url: '' }]);

  const handleTrackChange = (index: number, field: keyof TrackCreationPayload, value: string) => {
    if (field === 'name' && value.length > 30) return; // 트랙명 30자 제한
    const newTracks = [...tracks];
    newTracks[index][field] = value;
    setTracks(newTracks);
  };

  const addTrackField = () => setTracks([...tracks, { name: '', url: '' }]);
  const removeTrackField = (index: number) => {
    const newTracks = tracks.filter((_, i) => i !== index);
    setTracks(newTracks);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!releaseDate) {
      alert("발매일을 선택해주세요.");
      return;
    }
    const payload: AlbumCreationPayload = {
      name,
      coverImageUrl,
      releaseDate: releaseDate.toISOString(),
      description,
      tracks: tracks.filter(track => track.name), // 이름이 있는 트랙만 포함
    };
    onSubmit(payload);
  };

  return (
    <DialogContent className="sm:max-w-2xl">
      <form onSubmit={handleSubmit}>
        <DialogHeader>
          <DialogTitle>새 앨범 추가</DialogTitle>
        </DialogHeader>
        <div className="grid gap-6 py-6 max-h-[60vh] overflow-y-auto pr-4">
          {/* Album Name */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="albumName" className="text-right">앨범명</Label>
            <div className="col-span-3">
              <Input id="albumName" value={name} onChange={(e) => { if (e.target.value.length <= 30) setName(e.target.value);}} maxLength={30} required />
              <p className="text-xs text-right text-muted-foreground mt-1.5 pr-1">{name.length} / 30</p>
            </div>
          </div>
          {/* Cover Image URL */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="coverImageUrl" className="text-right">커버 이미지 URL</Label>
            <Input id="coverImageUrl" type="url" value={coverImageUrl} onChange={(e) => setCoverImageUrl(e.target.value)} className="col-span-3" />
          </div>
          {/* Release Date */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">발매일</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant={"outline"} className={cn("col-span-3 justify-start text-left font-normal", !releaseDate && "text-muted-foreground")}>
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {releaseDate ? format(releaseDate, "PPP") : <span>날짜 선택</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={releaseDate} onSelect={setReleaseDate} initialFocus /></PopoverContent>
            </Popover>
          </div>
          {/* Description */}
          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="albumDescription" className="text-right pt-2">앨범 소개</Label>
            <Textarea id="albumDescription" value={description} onChange={(e) => setDescription(e.target.value)} className="col-span-3" rows={3} />
          </div>
          {/* Tracks */}
          <div className="grid grid-cols-4 items-start gap-4">
            <Label className="text-right pt-2">트랙 목록</Label>
            <div className="col-span-3 space-y-3">
              {tracks.map((track, index) => (
                <div key={index} className="flex items-start gap-2">
                  <div className="flex-1 space-y-2">
                    <div>
                    <Input className="mb-2" type="url" value={track.url} onChange={(e) => handleTrackChange(index, 'url', e.target.value)} placeholder="https://..." />
                      <Input value={track.name} onChange={(e) => handleTrackChange(index, 'name', e.target.value)} placeholder={`트랙 ${index + 1} 이름`} maxLength={30} />
                      <p className="text-xs text-right text-muted-foreground mt-1.5 pr-1">{track.name.length} / 30</p>
                    </div>
                  </div>
                  {tracks.length > 1 && <Button type="button" variant="ghost" size="icon" onClick={() => removeTrackField(index)} className="mt-1"><X className="h-4 w-4" /></Button>}
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" onClick={addTrackField}><Plus className="h-4 w-4 mr-2" />트랙 추가</Button>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>취소</Button>
          <Button type="submit" disabled={!name || !releaseDate || loading}>{loading ? '추가 중...' : '추가하기'}</Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
};

export default AlbumCreationForm;
