import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

const getBaseURL = () => {
  // 개발 환경에서는 프록시 사용 (CORS 문제 해결)
  if (import.meta.env.DEV) {
    return '';
  }
  // 프로덕션 환경에서는 Vercel Serverless Function 프록시 사용
  // Vercel 프록시는 같은 도메인에서 동작하므로 CORS 문제 없음
  return '';
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
    const publicEndpoints = ['/api/members/login', '/api/members/signup', '/api/members/token/refresh'];

    const isPublicEndpoint = publicEndpoints.some(endpoint => config.url?.includes(endpoint));

    if (!isPublicEndpoint) {
      const token = localStorage.getItem('accessToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    // X-User-Id 헤더 제거 - JWT에서 자동으로 추출됨

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

    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshTokenValue = localStorage.getItem('refreshToken');

      if (refreshTokenValue) {
        try {
          const refreshResponse = await axios.post(
            `${getBaseURL()}/api/members/token/refresh`,
            { refreshToken: refreshTokenValue },
            { headers: { 'Content-Type': 'application/json' } }
          );

          const tokenData = refreshResponse.data?.data || refreshResponse.data;

          if (tokenData.accessToken && tokenData.refreshToken) {
            localStorage.setItem('accessToken', tokenData.accessToken);
            localStorage.setItem('refreshToken', tokenData.refreshToken);

            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${tokenData.accessToken}`;
            }

            return apiClient(originalRequest);
          }
        } catch (refreshError) {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');

          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }

          return Promise.reject(refreshError);
        }
      } else {
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