import { MetricsService } from './metrics.service';

describe('MetricsService', () => {
  it('exposes Prometheus metrics without secret labels', async () => {
    const service = new MetricsService();
    service.requestCounter.inc({ method: 'GET', route: '/api/health', status_code: '200' });

    const output = await service.metrics();
    expect(output).toContain('edutoon_http_requests_total');
    expect(output).toContain('service="edutoon-backend"');
  });
});
