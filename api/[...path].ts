import type { VercelRequest, VercelResponse } from '@vercel/node';

const API_BASE_URL = 'https://bandchu.o-r.kr';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
) {
  // 함수가 실행되는지 확인하기 위한 로깅
  console.log(`[API Proxy Handler] ${req.method} ${req.url}`);
  console.log(`[API Proxy Handler] Query:`, req.query);
  
  // CORS preflight 요청 처리
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    return res.status(200).end();
  }

  const { path, ...queryParams } = req.query;
  const pathString = Array.isArray(path) ? path.join('/') : path || '';
  // /api 접두사를 유지하여 백엔드 API 경로와 일치시킴
  const apiPath = pathString ? `/api/${pathString}` : '/api';

  // path를 제외한 쿼리 파라미터만 URL에 추가
  const queryEntries = Object.entries(queryParams).filter(([key]) => key !== 'path');
  const queryString = queryEntries.length > 0 
    ? '?' + new URLSearchParams(queryEntries.map(([k, v]) => [k, String(v)])).toString()
    : '';
  
  const url = `${API_BASE_URL}${apiPath}${queryString}`;

  // 디버깅을 위한 로깅
  console.log(`[API Proxy] ${req.method} ${url}`);

  try {
    // 요청 헤더 준비
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Authorization 헤더 전달
    if (req.headers.authorization) {
      headers['Authorization'] = req.headers.authorization;
    }

    // 요청 옵션
    const options: RequestInit = {
      method: req.method,
      headers,
    };

    // POST, PUT, PATCH 요청인 경우 body 전달
    if (req.method !== 'GET' && req.method !== 'HEAD' && req.body) {
      options.body = JSON.stringify(req.body);
    }

    // 백엔드 API 호출
    const response = await fetch(url, options);
    
    // 응답이 JSON인지 확인
    const contentType = response.headers.get('content-type');
    let data;
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    // CORS 헤더 설정
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    // Content-Type 헤더 명시적으로 설정 (axios가 JSON 파싱을 제대로 하도록)
    if (contentType && contentType.includes('application/json')) {
      res.setHeader('Content-Type', 'application/json');
    }

    // 응답 상태 코드와 데이터 반환
    res.status(response.status).json(data);
  } catch (error: any) {
    console.error('[API Proxy] 오류 발생:', error);
    console.error('[API Proxy] 오류 스택:', error.stack);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'application/json');
    res.status(500).json({ 
      success: false, 
      message: error.message || 'API 호출 중 오류가 발생했습니다.',
      error: error.toString()
    });
  }
}

