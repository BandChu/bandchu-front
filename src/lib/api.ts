import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

// 개발 환경에서는 프록시를 사용하고, 프로덕션에서는 직접 URL 사용
const getBaseURL = () => {
  if (import.meta.env.DEV) {
    // 개발 환경: Vite 프록시 사용 (상대 경로)
    return '';
  }
  // 프로덕션 환경: 직접 서버 URL 사용
  return import.meta.env.VITE_API_BASE_URL || 'https://bandchu.o-r.kr';
};

const apiClient = axios.create({
  baseURL: getBaseURL(),
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: false,
});

apiClient.interceptors.request.use(
  (config) => {
    // 인증이 필요 없는 엔드포인트 목록
    const publicEndpoints = ['/api/members/login', '/api/members/signup', '/api/members/token/refresh'];
    
    // 인증이 필요 없는 엔드포인트가 아니고 토큰이 있는 경우에만 Authorization 헤더 추가
    const isPublicEndpoint = publicEndpoints.some(endpoint => config.url?.includes(endpoint));
    
    if (!isPublicEndpoint) {
      const token = localStorage.getItem('accessToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    
    // 401 에러이고, 아직 재시도하지 않은 경우
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true;
      
      const refreshTokenValue = localStorage.getItem('refreshToken');
      
      if (refreshTokenValue) {
        try {
          // 토큰 갱신 시도 (순환 참조 방지를 위해 직접 axios 호출)
          const refreshResponse = await axios.post(
            `${getBaseURL()}/api/members/token/refresh`,
            { refreshToken: refreshTokenValue },
            { headers: { 'Content-Type': 'application/json' } }
          );
          
          const tokenData = refreshResponse.data?.data || refreshResponse.data;
          
          // 새 토큰 저장
          if (tokenData.accessToken && tokenData.refreshToken) {
            localStorage.setItem('accessToken', tokenData.accessToken);
            localStorage.setItem('refreshToken', tokenData.refreshToken);
            
            // 원래 요청 재시도
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${tokenData.accessToken}`;
            }
            
            return apiClient(originalRequest);
          }
        } catch (refreshError) {
          // 토큰 갱신 실패 시 로그아웃 처리
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          
          // 로그인 페이지로 리다이렉트 (브라우저 환경인 경우)
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }
          
          return Promise.reject(refreshError);
        }
      } else {
        // Refresh Token이 없으면 로그아웃 처리
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
      }
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;
