import { useState, useEffect } from 'react';
import { format, parseISO } from "date-fns";
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
import { Concert, ConcertCreationPayload } from '@/types/concert';
import { cn } from "@/lib/utils";

interface ConcertFormProps {
  mode: 'create' | 'edit';
  initialData?: Concert | null;
  onSubmit: (data: ConcertCreationPayload) => void;
  onClose: () => void;
  loading: boolean;
}

const ConcertForm = ({ mode, initialData, onSubmit, onClose, loading }: ConcertFormProps) => {
  const [title, setTitle] = useState('');
  const [place, setPlace] = useState('');
  const [posterImageUrl, setPosterImageUrl] = useState('');
  const [information, setInformation] = useState('');
  const [bookingUrl, setBookingUrl] = useState('');
  const [bookingSchedule, setBookingSchedule] = useState<Date | undefined>();
  const [performingDates, setPerformingDates] = useState<(Date | undefined)[]>([undefined]);

  useEffect(() => {
    if (mode === 'edit' && initialData) {
      setTitle(initialData.title || '');
      setPlace(initialData.place || '');
      setPosterImageUrl(initialData.posterImageUrl || '');
      setInformation(initialData.information || '');
      setBookingUrl(initialData.bookingUrl || '');
      if (initialData.bookingSchedule && initialData.bookingSchedule !== 'null') {
        setBookingSchedule(parseISO(initialData.bookingSchedule));
      }
      if (initialData.performingSchedule && initialData.performingSchedule.length > 0) {
        setPerformingDates(initialData.performingSchedule.map(s => parseISO(s.date)));
      } else {
        setPerformingDates([undefined]);
      }
    }
  }, [mode, initialData]);

  const handleDateChange = (index: number, date: Date | undefined) => {
    const newDates = [...performingDates];
    newDates[index] = date;
    setPerformingDates(newDates);
  };

  const addDateField = () => setPerformingDates([...performingDates, undefined]);
  const removeDateField = (index: number) => {
    if (performingDates.length <= 1) return; // 최소 1개의 날짜 필드는 유지
    const newDates = performingDates.filter((_, i) => i !== index);
    setPerformingDates(newDates);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload: ConcertCreationPayload = {
      title,
      place,
      posterImageUrl,
      information,
      bookingUrl,
      bookingSchedule: bookingSchedule ? bookingSchedule.toISOString() : undefined,
      performingSchedule: performingDates
        .filter((date): date is Date => !!date)
        .map(date => ({ date: date.toISOString() })),
    };
    onSubmit(payload);
  };
  
  const isCreateMode = mode === 'create';

  return (
    <DialogContent className="sm:max-w-2xl">
      <form onSubmit={handleSubmit}>
        <DialogHeader>
          <DialogTitle>{isCreateMode ? '새 공연/행사 추가' : '공연/행사 수정'}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-6 py-6 max-h-[60vh] overflow-y-auto pr-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="title" className="text-right">공연명</Label>
            <div className="col-span-3">
              <Input id="title" value={title} onChange={(e) => { if (e.target.value.length <= 30) setTitle(e.target.value); }} maxLength={30} required />
              <p className="text-xs text-right text-muted-foreground mt-1.5 pr-1">{title.length} / 30</p>
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="place" className="text-right">장소</Label>
            <Input id="place" value={place} onChange={(e) => setPlace(e.target.value)} className="col-span-3" required />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="posterImageUrl" className="text-right">포스터 URL</Label>
            <Input id="posterImageUrl" type="url" value={posterImageUrl} onChange={(e) => setPosterImageUrl(e.target.value)} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="information" className="text-right pt-2">상세 정보</Label>
            <Textarea id="information" value={information} onChange={(e) => setInformation(e.target.value)} className="col-span-3" rows={4} />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="bookingUrl" className="text-right">예매 링크</Label>
            <Input id="bookingUrl" type="url" value={bookingUrl} onChange={(e) => setBookingUrl(e.target.value)} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">예매 시작일</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant={"outline"} className={cn("w-[280px] justify-start text-left font-normal", !bookingSchedule && "text-muted-foreground")}>
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {bookingSchedule ? format(bookingSchedule, "PPP") : <span>날짜 선택</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={bookingSchedule} onSelect={setBookingSchedule} initialFocus /></PopoverContent>
            </Popover>
          </div>
          <div className="grid grid-cols-4 items-start gap-4">
            <Label className="text-right pt-2">공연 날짜</Label>
            <div className="col-span-3 space-y-2">
              {performingDates.map((date, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant={"outline"} className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}>
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date ? format(date, "PPP") : <span>날짜 선택</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={date} onSelect={(d) => handleDateChange(index, d)} initialFocus /></PopoverContent>
                  </Popover>
                  {performingDates.length > 1 && <Button type="button" variant="ghost" size="icon" onClick={() => removeDateField(index)}><X className="h-4 w-4" /></Button>}
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" onClick={addDateField}><Plus className="h-4 w-4 mr-2" />날짜 추가</Button>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>취소</Button>
          <Button type="submit" disabled={!title || !place || loading}>{loading ? (isCreateMode ? '추가 중...' : '저장 중...') : (isCreateMode ? '추가하기' : '저장하기')}</Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
};

export default ConcertForm;