import { authenticate, readScenario } from './common.js';

export const options = {
  vus: 1,
  iterations: 1,
  thresholds: {
    checks: ['rate>0.99'],
    http_req_failed: ['rate<0.01'],
    http_req_duration: ['p(95)<1500'],
  },
};

export function setup() {
  return { token: authenticate() };
}

export default function (data) {
  readScenario(data.token);
}
