// Post API Types
export interface PostListItem {
  postId: number;
  postType: string; // FREE, MARKET, JOIN, REVIEW, ARTIST, DONGHAENG
  title: string;
  createdAt: string;
  updatedAt: string;
}

export interface PostListResponse {
  posts: PostListItem[];
  totalElements: number;
  totalPages: number;
}

export interface CommentResponse {
  memberId: number;
  postId: number;
  commentId: number;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface MediaResponse {
  mediaId: number;
  postId: number;
  s3Url: string;
  fileSize: number;
  createdAt: string;
}

export interface PostDetailResponse {
  postId: number;
  artistId: number;
  postType: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  media: MediaResponse[];
  comments: CommentResponse[];
}

export interface CreatePostRequest {
  postType: string;
  title: string;
  content: string;
}

export interface CreatePostResponse {
  id: number;
  memberId: number;
  type: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface UpdatePostRequest {
  title: string;
  content: string;
}

export interface ApiResponse<T> {
  data: T;
  message: string;
}

// API Base URL
const API_BASE_URL = "https://bandchu.o-r.kr";

// 인증 토큰 가져오기
const getAuthToken = (): string | null => {
  return localStorage.getItem("accessToken");
};

// 인증 헤더 생성
const getAuthHeaders = (): Record<string, string> => {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
};

// 인증 헤더 (Content-Type 없이 - FormData용)
const getAuthHeadersOnly = (): Record<string, string> => {
  const token = getAuthToken();
  const headers: Record<string, string> = {};
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
};

// PostType을 한글 게시판 이름으로 매핑
export const postTypeToBoardName: Record<string, string> = {
  FREE: "자유 게시판",
  MARKET: "거래 게시판",
  JOIN: "모집 게시판",
  REVIEW: "후기 게시판",
  ARTIST: "아티스트 게시판",
  DONGHAENG: "동행 게시판",
};

// PostType을 boardId로 매핑
export const postTypeToBoardId: Record<string, string> = {
  FREE: "free",
  MARKET: "market",
  JOIN: "join",
  REVIEW: "review",
  ARTIST: "artist",
  DONGHAENG: "companion",
};

// boardId를 PostType으로 매핑
export const boardIdToPostType: Record<string, string> = {
  free: "FREE",
  market: "MARKET",
  join: "JOIN",
  review: "REVIEW",
  artist: "ARTIST",
  companion: "DONGHAENG",
};

// boardId를 한글 이름으로 매핑
export const boardIdToBoardName: Record<string, string> = {
  free: "자유 게시판",
  market: "거래 게시판",
  join: "모집 게시판",
  review: "후기 게시판",
  artist: "아티스트 게시판",
  companion: "동행 게시판",
};

// ============ GET APIs ============

// 모든 게시판의 최신 글 1개씩 조회
export const getAllPosts = async (): Promise<PostListResponse> => {
  const response = await fetch(`${API_BASE_URL}/api/posts`);
  
  if (!response.ok) {
    throw new Error("게시글을 불러오는데 실패했습니다.");
  }
  
  const result: ApiResponse<PostListResponse> = await response.json();
  return result.data;
};

// 특정 게시판 타입별 게시글 조회 (페이징)
export const getPostsByType = async (
  type: string,
  page: number = 1,
  size: number = 10
): Promise<PostListResponse> => {
  const response = await fetch(
    `${API_BASE_URL}/api/posts/postType?type=${type}&page=${page}&size=${size}`
  );

  if (!response.ok) {
    throw new Error("게시글을 불러오는데 실패했습니다.");
  }

  const result: ApiResponse<PostListResponse> = await response.json();
  return result.data;
};

// 게시글 상세 조회
export const getPostDetail = async (postId: number): Promise<PostDetailResponse> => {
  const response = await fetch(`${API_BASE_URL}/api/posts/${postId}`, {
  //  headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error("게시글을 불러오는데 실패했습니다.");
  }

  const result: ApiResponse<PostDetailResponse> = await response.json();
  return result.data;
};

// ============ POST APIs ============

// 게시글 생성
export const createPost = async (request: CreatePostRequest): Promise<CreatePostResponse> => {
  const response = await fetch(`${API_BASE_URL}/api/posts`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.detail || "게시글 작성에 실패했습니다.");
  }

  const result: ApiResponse<CreatePostResponse> = await response.json();
  return result.data;
};

// 미디어 업로드
export const uploadMedia = async (postId: number, file: File): Promise<MediaResponse> => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_BASE_URL}/api/posts/create/media/${postId}`, {
    method: "POST",
    headers: getAuthHeadersOnly(),
    body: formData,
  });

  if (!response.ok) {
    throw new Error("미디어 업로드에 실패했습니다.");
  }

  const result: ApiResponse<MediaResponse> = await response.json();
  return result.data;
};

// ============ PATCH/PUT APIs ============

// 게시글 수정
export const updatePost = async (
  postId: number,
  request: UpdatePostRequest
): Promise<PostDetailResponse> => {
  const response = await fetch(`${API_BASE_URL}/api/posts/${postId}`, {
    method: "PATCH",
    headers: getAuthHeaders(),
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error("게시글 수정에 실패했습니다.");
  }

  const result: ApiResponse<PostDetailResponse> = await response.json();
  return result.data;
};

// ============ DELETE APIs ============

// 게시글 삭제
export const deletePost = async (postId: number): Promise<number> => {
  const response = await fetch(`${API_BASE_URL}/api/posts/${postId}`, {
    method: "DELETE",
    headers: getAuthHeadersOnly(),
  });

  if (!response.ok) {
    throw new Error("게시글 삭제에 실패했습니다.");
  }

  const result: ApiResponse<number> = await response.json();
  return result.data;
};

// ============ Comment APIs ============

// 댓글 생성
export const createComment = async (postId: number, content: string): Promise<CommentResponse> => {
  const response = await fetch(`${API_BASE_URL}/api/posts/comments?postId=${postId}`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(content),
  });

  if (!response.ok) {
    throw new Error("댓글 작성에 실패했습니다.");
  }

  const result: ApiResponse<CommentResponse> = await response.json();
  return result.data;
};

// 댓글 수정
export const updateComment = async (commentId: number, content: string): Promise<CommentResponse> => {
  const response = await fetch(`${API_BASE_URL}/api/posts/comments/${commentId}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(content),
  });

  if (!response.ok) {
    throw new Error("댓글 수정에 실패했습니다.");
  }

  const result: ApiResponse<CommentResponse> = await response.json();
  return result.data;
};

// 댓글 삭제
export const deleteComment = async (commentId: number): Promise<number> => {
  const response = await fetch(`${API_BASE_URL}/api/posts/comments/${commentId}`, {
    method: "DELETE",
    headers: getAuthHeadersOnly(),
  });

  if (!response.ok) {
    throw new Error("댓글 삭제에 실패했습니다.");
  }

  const result: ApiResponse<number> = await response.json();
  return result.data;
};
