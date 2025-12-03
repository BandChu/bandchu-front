import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, CalendarDays, Info, MapPin, Ticket, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { getConcertById, updateConcert, deleteConcert } from "@/lib/api/concert";
import { Concert, ConcertCreationPayload } from "@/types/concert";
import { formatDateTime } from "@/lib/utils";
import { toast } from "sonner";
import ConcertForm from "@/components/ConcertForm";

const ConcertDetail = () => {
  const { concertId } = useParams<{ concertId: string }>();
  const navigate = useNavigate();

  const [concert, setConcert] = useState<Concert | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);

  // Modal states
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [formLoading, setFormLoading] = useState(false);

  const fetchConcert = async () => {
    if (!concertId) {
      setError("유효하지 않은 공연 ID입니다.");
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const concertData = await getConcertById(concertId);
      setConcert(concertData);
    } catch (err) {
      setError("공연 정보를 불러오는 데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setUserRole(localStorage.getItem('userRole'));
    fetchConcert();
  }, [concertId]);

  const handleConcertUpdate = async (data: ConcertCreationPayload) => {
    if (!concertId) return;
    setFormLoading(true);
    try {
      await updateConcert(concertId, data);
      toast.success("공연 정보가 성공적으로 수정되었습니다.");
      setIsEditModalOpen(false);
      await fetchConcert(); // 데이터 새로고침
    } catch (error) {
      toast.error("공연 정보 수정에 실패했습니다.");
    } finally {
      setFormLoading(false);
    }
  };

  const handleConcertDelete = async () => {
    if (!concertId) return;
    try {
      await deleteConcert(concertId);
      toast.success("공연이 삭제되었습니다.");
      navigate(-1); // 이전 페이지로 이동
    } catch (error) {
      toast.error("공연 삭제에 실패했습니다.");
    }
  };

  if (loading) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-10 w-10 rounded-full" />
        <Skeleton className="h-[300px] w-full rounded-2xl" />
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-20 w-full" />
      </div>
    );
  }

  if (error) {
    return <div className="flex flex-col items-center justify-center min-h-screen text-destructive">{error}</div>;
  }

  if (!concert) {
    return <div className="flex flex-col items-center justify-center min-h-screen text-muted-foreground">공연 정보를 찾을 수 없습니다.</div>;
  }

  return (
    <>
      {/* --- Modals --- */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <ConcertForm mode="edit" initialData={concert} onSubmit={handleConcertUpdate} onClose={() => setIsEditModalOpen(false)} loading={formLoading} />
      </Dialog>
      <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>정말로 삭제하시겠습니까?</AlertDialogTitle>
            <AlertDialogDescription>이 작업은 되돌릴 수 없습니다. 이 공연 정보가 서버에서 영구적으로 삭제됩니다.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction onClick={handleConcertDelete}>삭제</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="min-h-screen bg-background">
        <header className="relative">
          <div className="relative h-[400px] bg-slate-900 overflow-hidden">
            {concert.posterImageUrl ? (
              <>
                <img src={concert.posterImageUrl} alt={concert.title} className="w-full h-full object-cover object-center opacity-50 blur-sm" />
                <div className="absolute inset-0 bg-black/50" />
              </>
            ) : <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5" />}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            
            <Button variant="ghost" size="icon" className="absolute top-12 left-4 z-20 bg-white/10 backdrop-blur-md hover:bg-white/20 rounded-full border border-white/20" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-5 w-5 text-white" />
            </Button>

            {userRole === 'ARTIST' && (
              <div className="absolute top-12 right-4 z-20 flex gap-2">
                <Button variant="ghost" size="icon" className="bg-white/10 backdrop-blur-md hover:bg-white/20 rounded-full border border-white/20" onClick={() => setIsEditModalOpen(true)}>
                  <Edit className="h-5 w-5 text-white" />
                </Button>
                <Button variant="ghost" size="icon" className="bg-red-500/20 backdrop-blur-md hover:bg-red-500/40 rounded-full border border-red-400/30" onClick={() => setIsDeleteAlertOpen(true)}>
                  <Trash2 className="h-5 w-5 text-red-200" />
                </Button>
              </div>
            )}

            <div className="absolute bottom-0 left-0 right-0 z-10 p-6 flex items-end gap-6">
              {concert.posterImageUrl && <img src={concert.posterImageUrl} alt={concert.title} className="w-28 h-40 object-cover rounded-lg shadow-2xl flex-shrink-0" />}
              <div className="min-w-0">
                <h1 className="text-3xl font-bold text-white mb-2 tracking-tight drop-shadow-lg line-clamp-2">{concert.title}</h1>
                <div className="flex items-center gap-2 text-white/90 text-sm drop-shadow"><MapPin className="h-4 w-4 flex-shrink-0" /><span>{concert.place}</span></div>
              </div>
            </div>
          </div>
        </header>

        <main className="px-6 py-8 space-y-8">
          <div className="space-y-3">
            <h2 className="text-lg font-bold flex items-center"><CalendarDays className="h-5 w-5 mr-3 text-primary" />공연 일정</h2>
            <div className="p-6 bg-slate-50 rounded-xl space-y-3">
              {concert.performingSchedule.map(schedule => <div key={schedule.id} className="font-medium text-foreground">{formatDateTime(schedule.date)}</div>)}
            </div>
          </div>
          {concert.bookingUrl && concert.bookingSchedule && concert.bookingSchedule !== 'null' && (
            <div className="space-y-3">
              <h2 className="text-lg font-bold flex items-center"><Ticket className="h-5 w-5 mr-3 text-primary" />예매 정보</h2>
              <div className="p-6 bg-slate-50 rounded-xl space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">예매 시작</p>
                  <p className="font-medium text-foreground">{formatDateTime(concert.bookingSchedule)}</p>
                </div>
                <Button className="w-full" onClick={() => window.open(concert.bookingUrl, '_blank', 'noopener,noreferrer')}>예매하러 가기</Button>
              </div>
            </div>
          )}
          {concert.information && (
            <div className="space-y-3">
              <h2 className="text-lg font-bold flex items-center"><Info className="h-5 w-5 mr-3 text-primary" />상세 정보</h2>
              <div className="p-6 bg-slate-50 rounded-xl"><p className="text-foreground whitespace-pre-wrap leading-relaxed">{concert.information}</p></div>
            </div>
          )}
        </main>
      </div>
    </>
  );
};

export default ConcertDetail;