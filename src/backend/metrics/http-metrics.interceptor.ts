import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { MetricsService } from './metrics.service';

@Injectable()
export class HttpMetricsInterceptor implements NestInterceptor {
  constructor(private readonly metrics: MetricsService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    if (context.getType() !== 'http') return next.handle();

    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    const started = process.hrtime.bigint();

    return next.handle().pipe(
      finalize(() => {
        const routePath = request.route?.path || request.path || 'unknown';
        if (routePath === '/metrics') return;

        const controllerPath = request.baseUrl || '';
        const route = `${controllerPath}${routePath}` || 'unknown';
        const labels = {
          method: request.method,
          route,
          status_code: String(response.statusCode),
        };
        const durationSeconds = Number(process.hrtime.bigint() - started) / 1e9;
        this.metrics.requestCounter.inc(labels);
        this.metrics.requestDuration.observe(labels, durationSeconds);
      }),
    );
  }
}
