import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
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
import Auth from "./pages/Auth";
import Login from "./pages/Login";
import SignupType from "./pages/SignupType";
import SignupForm from "./pages/SignupForm";
import ProfileSetup from "./pages/ProfileSetup";
import EmailVerification from "./pages/EmailVerification";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/auth" replace />} />
          <Route path="/home" element={<Index />} />
          <Route path="/artist/:artistId" element={<ArtistDetail />} />
          <Route path="/artists" element={<ArtistList />} />
          <Route path="/search" element={<Search />} />
          <Route path="/community" element={<Community />} />
          <Route path="/board/:boardId" element={<BoardList />} />
          <Route path="/board/:boardId/post/:postId" element={<PostDetail />} />
          <Route path="/feed" element={<Feed />} />
          <Route path="/chatting" element={<Chatting />} />
          <Route path="/chat/:roomId" element={<ChatRoom />} />
          <Route path="/my" element={<My />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup/type" element={<SignupType />} />
          <Route path="/signup/form" element={<SignupForm />} />
          <Route path="/signup/profile" element={<ProfileSetup />} />
          <Route path="/signup/verify" element={<EmailVerification />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
