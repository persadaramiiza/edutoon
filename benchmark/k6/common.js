import http from 'k6/http';
import { check, fail } from 'k6';

export const baseUrl = __ENV.BASE_URL || 'http://edutoon-backend:3000';

export function authenticate() {
  const response = http.post(`${baseUrl}/api/auth/login`, JSON.stringify({
    email: __ENV.BENCHMARK_EMAIL,
    password: __ENV.BENCHMARK_PASSWORD,
  }), { headers: { 'Content-Type': 'application/json' }, tags: { endpoint: 'login' } });

  const ok = check(response, {
    'login returns 200': (r) => r.status === 200,
    'login returns token': (r) => Boolean(r.json('access_token')),
  });
  if (!ok) fail(`Benchmark login failed with status ${response.status}`);
  return response.json('access_token');
}

export function readScenario(token) {
  const params = {
    headers: { Authorization: `Bearer ${token}` },
  };
  const list = http.get(`${baseUrl}/api/videos?limit=10`, {
    ...params,
    tags: { endpoint: 'video-list' },
  });
  check(list, {
    'video list returns 200': (r) => r.status === 200,
    'video list contains benchmark data': (r) => Array.isArray(r.json('data')) && r.json('data').length > 0,
  });

  const videoId = list.json('data.0.id');
  if (!videoId) fail('No benchmark video is available.');

  const detail = http.get(`${baseUrl}/api/videos/${videoId}`, {
    ...params,
    tags: { endpoint: 'video-detail' },
  });
  check(detail, { 'video detail returns 200': (r) => r.status === 200 });

  const quizzes = http.get(`${baseUrl}/api/videos/${videoId}/quizzes`, {
    ...params,
    tags: { endpoint: 'quiz-list' },
  });
  check(quizzes, {
    'quiz list returns 200': (r) => r.status === 200,
    'quiz list is readable': (r) => Array.isArray(r.json()),
  });
}
