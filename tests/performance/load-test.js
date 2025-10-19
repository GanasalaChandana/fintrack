import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

const errorRate = new Rate('errors');

export const options = {
  stages: [
    { duration: '10s', target: 5 },   // Ramp up
    { duration: '30s', target: 5 },   // Stay at 5 users
    { duration: '10s', target: 10 },  // Spike to 10
    { duration: '20s', target: 10 },  // Stay at 10
    { duration: '10s', target: 0 },   // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<1000'], // 95% under 1s
    http_req_failed: ['rate<0.05'],    // Less than 5% errors
    errors: ['rate<0.05'],
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:8084';

export default function () {
  // Health check
  const healthRes = http.get(`${BASE_URL}/actuator/health`, {
    timeout: '10s',
  });
  
  const success = check(healthRes, {
    'health check status is 200': (r) => r.status === 200,
    'health check response time OK': (r) => r.timings.duration < 1000,
  });
  
  errorRate.add(!success);

  sleep(1);
}
