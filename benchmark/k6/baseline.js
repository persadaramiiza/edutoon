import { sleep } from 'k6';
import { authenticate, readScenario } from './common.js';

export const options = {
  scenarios: {
    baseline: {
      executor: 'per-vu-iterations',
      vus: 1,
      iterations: 10,
      maxDuration: '2m',
    },
  },
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
  sleep(5);
}
