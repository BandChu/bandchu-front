import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";

const My = () => {
  return (
    <div className="min-h-screen bg-background pb-20">
      <Header />
      <main className="max-w-screen-xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold mb-4">My</h1>
        <p className="text-muted-foreground">마이페이지 (준비중)</p>
      </main>
      <BottomNav />
    </div>
  );
};

export default My;
