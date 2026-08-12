import { Injectable } from '@nestjs/common';
import {
  collectDefaultMetrics,
  Counter,
  Histogram,
  Registry,
} from 'prom-client';

@Injectable()
export class MetricsService {
  readonly registry = new Registry();
  readonly requestCounter: Counter<'method' | 'route' | 'status_code'>;
  readonly requestDuration: Histogram<'method' | 'route' | 'status_code'>;

  constructor() {
    this.registry.setDefaultLabels({
      service: 'edutoon-backend',
      cluster: process.env.CLUSTER_LABEL || 'unknown',
      namespace: process.env.KUBERNETES_NAMESPACE || 'unknown',
      pod: process.env.POD_NAME || 'unknown',
    });
    collectDefaultMetrics({ register: this.registry, prefix: 'edutoon_' });

    this.requestCounter = new Counter({
      name: 'edutoon_http_requests_total',
      help: 'Total HTTP requests handled by EduToon.',
      labelNames: ['method', 'route', 'status_code'],
      registers: [this.registry],
    });
    this.requestDuration = new Histogram({
      name: 'edutoon_http_request_duration_seconds',
      help: 'EduToon HTTP request duration in seconds.',
      labelNames: ['method', 'route', 'status_code'],
      buckets: [0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5],
      registers: [this.registry],
    });
  }

  contentType() {
    return this.registry.contentType;
  }

  metrics() {
    return this.registry.metrics();
  }
}
