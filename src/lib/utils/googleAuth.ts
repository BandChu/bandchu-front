// Google OAuth 유틸리티 함수

declare global {
  interface Window {
    google?: {
      accounts: {
        oauth2: {
          initTokenClient: (config: {
            client_id: string;
            scope: string;
            callback: (response: { access_token?: string; error?: string }) => void;
          }) => {
            requestAccessToken: () => void;
          };
          hasGrantedAllScopes: (token: string, ...scopes: string[]) => boolean;
        };
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: {
              credential: string;
              select_by?: string;
            }) => void;
            auto_select?: boolean;
            cancel_on_tap_outside?: boolean;
          }) => void;
          prompt: () => void;
          renderButton: (
            element: HTMLElement,
            config: {
              type?: string;
              theme?: string;
              size?: string;
              text?: string;
              shape?: string;
              logo_alignment?: string;
              width?: string;
              locale?: string;
            }
          ) => void;
        };
      };
    };
  }
}

export interface GoogleAuthConfig {
  clientId: string;
  onSuccess: (idToken: string) => void;
  onError?: (error: string) => void;
}

/**
 * Google OAuth ID Token을 받아서 콜백을 호출합니다.
 * @param config Google OAuth 설정
 */
export const handleGoogleSignIn = (config: GoogleAuthConfig) => {
  const { clientId, onSuccess, onError } = config;

  // Google Identity Services가 로드되었는지 확인
  if (!window.google) {
    const errorMsg = 'Google 로그인 서비스를 불러올 수 없습니다. 잠시 후 다시 시도해주세요.';
    console.error(errorMsg);
    onError?.(errorMsg);
    return;
  }

  try {
    // 기존에 초기화된 경우를 대비해 먼저 초기화
    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: (response) => {
        if (response.credential) {
          onSuccess(response.credential);
        } else {
          // 사용자가 취소한 경우도 처리
          const errorMsg = '구글 로그인이 취소되었습니다.';
          console.log(errorMsg);
          onError?.(errorMsg);
        }
      },
      auto_select: false,
      cancel_on_tap_outside: true,
    });

    // One Tap UI 표시
    // 참고: prompt()는 콜백을 받지 않으므로, 사용자가 팝업을 닫으면 콜백이 호출되지 않을 수 있습니다.
    // 이 경우 상위 컴포넌트에서 타임아웃을 설정하여 처리합니다.
    window.google.accounts.id.prompt();
  } catch (error) {
    const errorMsg = '구글 로그인 초기화에 실패했습니다.';
    console.error(error);
    onError?.(errorMsg);
  }
};

/**
 * Google OAuth 클라이언트 ID를 백엔드 API에서 가져옵니다.
 * 백엔드의 GOOGLE_CLIENT_ID와 동일한 값을 사용합니다.
 */
let cachedClientId: string | null = null;

export const getGoogleClientId = async (): Promise<string> => {
  // 캐시된 값이 있으면 반환
  if (cachedClientId) {
    return cachedClientId;
  }

  try {
    // 백엔드 API에서 Client ID 가져오기
    const { fetchGoogleClientId } = await import('@/lib/api/auth');
    cachedClientId = await fetchGoogleClientId();
    return cachedClientId;
  } catch (error) {
    console.error('Google Client ID를 가져오는데 실패했습니다:', error);
    // 폴백: 환경변수에서 가져오기 (개발용)
    const fallbackId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (fallbackId) {
      cachedClientId = fallbackId;
      return fallbackId;
    }
    throw new Error('Google Client ID를 가져올 수 없습니다.');
  }
};

