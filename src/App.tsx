import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useEffect } from "react";
import Index from "./pages/Index";
import ArtistDetail from "./pages/ArtistDetail";
import ArtistList from "./pages/ArtistList";
import PostCreate from "./pages/PostCreate";
import Search from "./pages/Search";
import Community from "./pages/Community";
import BoardList from "./pages/BoardList";
import PostDetail from "./pages/PostDetail";
import Feed from "./pages/Feed";
import Chatting from "./pages/Chatting";
import ChatRoom from "./pages/ChatRoom";
import FriendList from "./pages/FriendList";
import My from "./pages/My";
import Auth from "./pages/Auth";
import PostEdit from "./pages/PostEdit";
import Login from "./pages/Login";
import SignupType from "./pages/SignupType";
import SignupForm from "./pages/SignupForm";
import FriendRequests from "./pages/FriendRequest";
import ProfileSetup from "./pages/ProfileSetup";
import EmailVerification from "./pages/EmailVerification";
import AccountDelete from "./pages/AccountDelete";
import NotFound from "./pages/NotFound";
import ConcertDetail from "./pages/ConcertDetail";
import AlbumDetail from "./pages/AlbumDetail";

const queryClient = new QueryClient();

// 루트 경로 리다이렉트 컴포넌트
const RootRedirect = () => {
  const accessToken = localStorage.getItem('accessToken');
  return <Navigate to={accessToken ? "/home" : "/auth"} replace />;
};

// 페이지 전환 애니메이션을 위한 컴포넌트
const AnimatedRoutes = () => {
  const location = useLocation();

  useEffect(() => {
    // 페이지 전환 시 스크롤을 맨 위로
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [location.pathname]);

  return (
    <div className="page-transition-fadeIn">
      <Routes location={location}>
        <Route path="/" element={<RootRedirect />} />
        <Route path="/home" element={<Index />} />
        <Route path="/artist/:artistId" element={<ArtistDetail />} />
        <Route path="/artists" element={<ArtistList />} />
        <Route path="/search" element={<Search />} />

        <Route path="/community" element={<Community />} />
        <Route path="/board/:boardId" element={<BoardList />} />
         <Route path="/board/:boardId/create" element={<PostCreate />} />
        <Route path="/board/:boardId/post/:postId" element={<PostDetail />} />
         <Route path="/board/:boardId/post/:postId/edit" element={<PostEdit />} />
        <Route path="/feed" element={<Feed />} />
        <Route path="/chatting" element={<Chatting />} />
        <Route path="/chat/:roomId" element={<ChatRoom />} />
        <Route path="/my" element={<My />} />
         <Route path="/my/friend-requests" element={<FriendRequests />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup/type" element={<SignupType />} />
        <Route path="/my/friends" element={<FriendList />} />
        <Route path="/signup/form" element={<SignupForm />} />
        <Route path="/signup/profile" element={<ProfileSetup />} />
        <Route path="/signup/verify" element={<EmailVerification />} />
        <Route path="/account/delete" element={<AccountDelete />} />
        <Route path="/artist/:artistId" element={<ArtistDetail />} />
        <Route path="/concert/:concertId" element={<ConcertDetail />} />
        <Route path="/album/:albumId" element={<AlbumDetail />} />
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AnimatedRoutes />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
