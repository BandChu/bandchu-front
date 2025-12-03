import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft, Plus, Search, Heart, MessageCircle, UserPlus, MessageSquare, Send, Trash2, Edit2 } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { getOrCreateChatRoom } from "@/lib/chatstore";
import {
  getPostDetail,
  createComment,
  deleteComment,
  deletePost,
  PostDetailResponse,
  CommentResponse,
  boardIdToBoardName,
} from "@/lib/api/posts";
import { sendFriendRequest } from "@/lib/api/friends";

const PostDetail = () => {
  const { boardId, postId } = useParams();
  const navigate = useNavigate();
  const [liked, setLiked] = useState(false);
  const [post, setPost] = useState<PostDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newComment, setNewComment] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  useEffect(() => {
    const fetchPostDetail = async () => {
      if (!postId) return;

      try {
        setLoading(true);
        const data = await getPostDetail(Number(postId));
        setPost(data);
        setError(null);
      } catch (err) {
        console.error("게시글 로딩 실패:", err);
        setError("게시글을 불러오는데 실패했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchPostDetail();
  }, [postId]);

  const handleAddFriend = async (memberId: number, displayName: string) => {
    try {
      await sendFriendRequest(memberId);
      toast.success(`${displayName}님에게 친구 요청을 보냈습니다.`);
    } catch (error: any) {
      toast.error(error.message || '친구 요청에 실패했습니다.');
    }
  };

  const handleStartChat = (username: string) => {
    const boardName = boardIdToBoardName[boardId || ""] || "게시판";
    getOrCreateChatRoom(username, boardName);
    navigate(`/chat/${username}?user=${username}&board=${encodeURIComponent(boardName)}`);
  };

  const handleSubmitComment = async () => {
    if (!newComment.trim()) {
      toast.error("댓글 내용을 입력해주세요.");
      return;
    }

    if (!postId) return;

    setIsSubmittingComment(true);
    try {
      const newCommentData = await createComment(Number(postId), newComment.trim());
      setPost((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          comments: [...prev.comments, newCommentData],
        };
      });
      setNewComment("");
      toast.success("댓글이 작성되었습니다.");
    } catch (error) {
      console.error("댓글 작성 실패:", error);
      toast.error("댓글 작성에 실패했습니다.");
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    try {
      await deleteComment(commentId);
      setPost((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          comments: prev.comments.filter((c) => c.commentId !== commentId),
        };
      });
      toast.success("댓글이 삭제되었습니다.");
    } catch (error) {
      console.error("댓글 삭제 실패:", error);
      toast.error("댓글 삭제에 실패했습니다.");
    }
  };

  const handleDeletePost = async () => {
    if (!postId) return;

    if (!confirm("정말 게시글을 삭제하시겠습니까?")) return;

    try {
      await deletePost(Number(postId));
      toast.success("게시글이 삭제되었습니다.");
      navigate(`/board/${boardId}`);
    } catch (error) {
      console.error("게시글 삭제 실패:", error);
      toast.error("게시글 삭제에 실패했습니다.");
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, "0")}.${String(date.getDate()).padStart(2, "0")}`;
  };

  const formatCommentDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${String(date.getMonth() + 1).padStart(2, "0")}.${String(date.getDate()).padStart(2, "0")} ${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
  };

  const UserPopover = ({ memberId, displayName }: { memberId: number; displayName: string }) => (
    <Popover>
      <PopoverTrigger asChild>
        <button className="font-semibold text-foreground hover:text-primary transition-colors cursor-pointer">
          {displayName}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-48 p-2">
        <div className="flex flex-col gap-1">
          <div className="text-sm font-semibold text-foreground px-2 py-1 border-b border-border mb-1">
            {displayName}
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="justify-start gap-2"
            onClick={() => handleAddFriend(memberId, displayName)}
          >
            <UserPlus className="w-4 h-4" />
            친구 추가
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="justify-start gap-2"
            onClick={() => handleStartChat(displayName)}
          >
            <MessageSquare className="w-4 h-4" />
            채팅하기
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <header className="bg-background border-b border-border sticky top-0 z-40">
          <div className="max-w-screen-xl mx-auto px-4 py-4 flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="text-foreground">
              <ChevronLeft className="w-6 h-6" />
            </button>
            <h1 className="text-lg font-bold">{boardIdToBoardName[boardId || ""] || "게시판"}</h1>
          </div>
        </header>
        <div className="flex items-center justify-center py-20">
          <p className="text-muted-foreground">로딩 중...</p>
        </div>
        <BottomNav />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <header className="bg-background border-b border-border sticky top-0 z-40">
          <div className="max-w-screen-xl mx-auto px-4 py-4 flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="text-foreground">
              <ChevronLeft className="w-6 h-6" />
            </button>
            <h1 className="text-lg font-bold">{boardIdToBoardName[boardId || ""] || "게시판"}</h1>
          </div>
        </header>
        <div className="flex items-center justify-center py-20">
          <p className="text-destructive">{error || "게시글을 찾을 수 없습니다."}</p>
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="bg-background border-b border-border sticky top-0 z-40">
        <div className="max-w-screen-xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="text-foreground">
              <ChevronLeft className="w-6 h-6" />
            </button>
            <h1 className="text-lg font-bold">{boardIdToBoardName[boardId || ""] || "게시판"}</h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate(`/board/${boardId}/post/${postId}/edit`)}
              className="text-foreground"
            >
              <Edit2 className="w-5 h-5" />
            </button>
            <button onClick={handleDeletePost} className="text-destructive">
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-screen-xl mx-auto px-4 py-6">
        <div className="bg-card rounded-lg p-4 mb-6">
          <h1 className="text-xl font-bold text-foreground mb-3">{post.title}</h1>
          <div className="text-sm text-muted-foreground mb-4">
            <UserPopover memberId={post.artistId} displayName={`사용자${post.artistId}`} /> · {formatDate(post.createdAt)}
          </div>

          {/* 미디어 표시 */}
          {post.media && post.media.length > 0 && (
            <div className="mb-4 space-y-2">
              {post.media.map((media) => (
                <img
                  key={media.mediaId}
                  src={media.s3Url}
                  alt="첨부 이미지"
                  className="max-w-full rounded-lg"
                />
              ))}
            </div>
          )}

          <div className="text-foreground whitespace-pre-wrap mb-6">{post.content}</div>
          <button
            onClick={() => setLiked(!liked)}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            <Heart className={`w-5 h-5 ${liked ? "fill-primary text-primary" : ""}`} />
            <span>좋아요</span>
          </button>
        </div>

        {/* 댓글 섹션 */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-muted-foreground">
            댓글 {post.comments.length > 0 && `(${post.comments.length})`}
          </h2>

          {/* 댓글 입력 */}
          <div className="flex gap-2">
            <Input
              placeholder="댓글을 입력하세요"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSubmitComment()}
              disabled={isSubmittingComment}
            />
            <Button
              onClick={handleSubmitComment}
              disabled={isSubmittingComment}
              size="icon"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>

          {/* 댓글 목록 */}
          {post.comments.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              아직 댓글이 없습니다. 첫 댓글을 작성해보세요!
            </p>
          ) : (
            post.comments.map((comment) => (
              <div key={comment.commentId} className="bg-card rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-muted flex-shrink-0" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <UserPopover memberId={comment.memberId} displayName={`사용자${comment.memberId}`} />
                      <button
                        onClick={() => handleDeleteComment(comment.commentId)}
                        className="text-muted-foreground hover:text-destructive transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="text-sm text-foreground mb-2">{comment.content}</div>
                    <div className="text-xs text-muted-foreground mb-2">
                      {formatCommentDate(comment.createdAt)}
                    </div>
                    <div className="flex items-center gap-4">
                      <button className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors">
                        <Heart className="w-4 h-4" />
                        <span>좋아요</span>
                      </button>
                      <button className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors">
                        <MessageCircle className="w-4 h-4" />
                        <span>답글</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
      <BottomNav />
    </div>
  );
};

export default PostDetail;