import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";

const ArtistDetail = () => {
  const { artistId } = useParams();
  const navigate = useNavigate();

  // Mock data - 실제로는 artistId로 데이터를 가져와야 함
  const artist = {
    id: artistId,
    name: "실리카겔",
    description: "일이삼사오육칠팔구십일이삼사오육칠팔구십일이삼사오육칠팔구십",
    image: "",
  };

  const concerts = [
    {
      id: 1,
      title: "2025 연말 콘서트 [어쩌구저쩌구]",
      date: "12.27(토) - 12.28(일)",
      location: "콘서트 | 일산 킨텍스",
    },
    {
      id: 2,
      title: "○○ 연말 콘서트 티켓 오픈",
      date: "12.27(토)",
      location: "예매일정 | NOL 티켓",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="relative h-[280px] bg-gradient-to-b from-primary/20 to-background">
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 left-4 z-10"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="absolute bottom-6 left-6 right-6">
          <h1 className="text-3xl font-bold text-foreground mb-2">{artist.name}</h1>
          <p className="text-sm text-muted-foreground line-clamp-2">{artist.description}</p>
          <Button variant="secondary" size="sm" className="mt-4">
            인디플
          </Button>
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
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-foreground">공연/행사</h3>
            <button className="flex items-center text-sm text-muted-foreground hover:text-foreground">
              더보기 <ChevronRight className="h-4 w-4" />
            </button>
          </div>
          {concerts.map((concert) => (
            <Card key={concert.id} className="overflow-hidden">
              <div className="flex gap-4 p-4">
                <div className="w-20 h-20 rounded-lg bg-muted flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-muted-foreground mb-1">{concert.date}</p>
                  <h4 className="font-semibold text-foreground mb-1 truncate">
                    {concert.title}
                  </h4>
                  <p className="text-sm text-muted-foreground">{concert.location}</p>
                </div>
              </div>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="albums" className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-foreground">앨범</h3>
            <button className="flex items-center text-sm text-muted-foreground hover:text-foreground">
              더보기 <ChevronRight className="h-4 w-4" />
            </button>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-2">
                <div className="aspect-square rounded-lg bg-muted" />
                <p className="text-sm text-foreground">앨범명</p>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="posts" className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-foreground">게시글</h3>
            <button className="flex items-center text-sm text-muted-foreground hover:text-foreground">
              더보기 <ChevronRight className="h-4 w-4" />
            </button>
          </div>
          <div className="text-center py-12 text-muted-foreground">
            게시글이 없습니다
          </div>
        </TabsContent>

        <TabsContent value="info" className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground mb-4">아티스트 정보</h3>
          <p className="text-foreground">{artist.description}</p>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ArtistDetail;
