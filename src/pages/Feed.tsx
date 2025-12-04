import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import { Music2 } from "lucide-react";

const Feed = () => {
  return (
    <div className="min-h-screen bg-white pb-20">
      <Header />
      <main className="max-w-screen-xl mx-auto px-4">
        <div className="flex flex-col items-center justify-center min-h-[75vh]">
          <div className="text-center space-y-6">
            {/* 아이콘 */}
            <div className="flex justify-center">
              <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center">
                <Music2 className="w-10 h-10 text-gray-400" />
              </div>
            </div>

            {/* 메시지 */}
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-gray-900">
                피드 준비중
              </h1>
              <p className="text-base text-gray-500">
                곧 만나요
              </p>
            </div>
          </div>
        </div>
      </main>
      <BottomNav />
    </div>
  );
};

export default Feed;
