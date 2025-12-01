import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import ArtistDetail from "./pages/ArtistDetail";
import ArtistList from "./pages/ArtistList";
import Search from "./pages/Search";
import Community from "./pages/Community";
import BoardList from "./pages/BoardList";
import PostDetail from "./pages/PostDetail";
import Feed from "./pages/Feed";
import Chatting from "./pages/Chatting";
import ChatRoom from "./pages/ChatRoom";
import My from "./pages/My";
import NotFound from "./pages/NotFound";
import SubscribedArtistList from "./pages/SubscribedArtistList";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/artist/:artistId" element={<ArtistDetail />} />
          <Route path="/artists" element={<ArtistList />} />
          <Route path="/subscriptions" element={<SubscribedArtistList />} />
          <Route path="/search" element={<Search />} />
          <Route path="/community" element={<Community />} />
          <Route path="/board/:boardId" element={<BoardList />} />
          <Route path="/board/:boardId/post/:postId" element={<PostDetail />} />
          <Route path="/feed" element={<Feed />} />
          <Route path="/chatting" element={<Chatting />} />
          <Route path="/chat/:roomId" element={<ChatRoom />} />
          <Route path="/my" element={<My />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
