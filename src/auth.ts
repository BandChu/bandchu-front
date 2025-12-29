export const login = async (email: string, password: string) => {
  const response = await fetch(`https://api.bandchu.com/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    throw new Error("로그인 실패");
  }

  const result = await response.json();

  // 🔥 토큰 저장
  const accessToken = result.data.accessToken;
  const refreshToken = result.data.refreshToken;

  localStorage.setItem("accessToken", accessToken);
  localStorage.setItem("refreshToken", refreshToken);

  return result.data;
};
