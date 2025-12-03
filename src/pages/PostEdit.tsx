import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import BottomNav from "@/components/BottomNav";
import { getPostDetail, updatePost, boardIdToBoardName } from "@/lib/api/posts";

const PostEdit = () => {
  const { boardId, postId } = useParams();
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchPost = async () => {
      if (!postId) return;

      try {
        const data = await getPostDetail(Number(postId));
        setTitle(data.title);
        setContent(data.content);
      } catch (error) {
        console.error("게시글 로딩 실패:", error);
        toast.error("게시글을 불러오는데 실패했습니다.");
        navigate(-1);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPost();
  }, [postId, navigate]);

  const handleSubmit = async () => {
    if (!title.trim()) {
      toast.error("제목을 입력해주세요.");
      return;
    }
    if (!content.trim()) {
      toast.error("내용을 입력해주세요.");
      return;
    }

    if (!postId) return;

    setIsSubmitting(true);
    try {
      await updatePost(Number(postId), {
        title: title.trim(),
        content: content.trim(),
      });
      toast.success("게시글이 수정되었습니다.");
      navigate(`/board/${boardId}/post/${postId}`);
    } catch (error) {
      console.error("게시글 수정 실패:", error);
      toast.error("게시글 수정에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <header className="bg-background border-b border-border sticky top-0 z-40">
          <div className="max-w-screen-xl mx-auto px-4 py-4 flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="text-foreground">
              <ChevronLeft className="w-6 h-6" />
            </button>
            <h1 className="text-lg font-bold">글 수정</h1>
          </div>
        </header>
        <div className="flex items-center justify-center py-20">
          <p className="text-muted-foreground">로딩 중...</p>
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
            <h1 className="text-lg font-bold">글 수정</h1>
          </div>
          <Button onClick={handleSubmit} size="sm" disabled={isSubmitting}>
            {isSubmitting ? "수정 중..." : "수정"}
          </Button>
        </div>
      </header>

      <main className="max-w-screen-xl mx-auto px-4 py-4">
        <div className="text-sm text-muted-foreground mb-4">
          {boardIdToBoardName[boardId || ""] || "게시판"}
        </div>
        
        <div className="space-y-4">
          <Input
            placeholder="제목을 입력하세요"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="text-lg"
          />
          <Textarea
            placeholder="내용을 입력하세요"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[300px]"
          />
        </div>
      </main>
      <BottomNav />
    </div>
  );
};

export default PostEdit;