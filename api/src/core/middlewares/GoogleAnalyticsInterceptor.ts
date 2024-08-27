import { round } from '@/@utils';
import { CallHandler, ExecutionContext, Injectable, Logger, NestInterceptor } from '@nestjs/common';
import axios from 'axios';
import { Request, Response } from 'express';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

// GA4 -> Sidebar:Admin -> Data collection -> Data streams (GA_CLIENT_ID = STREAM ID, GA_MEASUREMENT_ID = MEASUREMENT ID) -> Measurement Protocol API secrets -> Create (GA_API_SECRET)

// GA4 Measuramente Protocol:
// https://web.archive.org/web/20240602064240/https://developers.google.com/analytics/devguides/collection/protocol/ga4/
// https://web.archive.org/web/20240602060944/https://developers.google.com/analytics/devguides/collection/protocol/ga4/sending-events?client_type=gtag

// Debug: debug/mp/collect or debug_mode (Sidebar:Admin -> Data display -> DebugView)

@Injectable()
export class GoogleAnalyticsInterceptor implements NestInterceptor {
  private logger: Logger = new Logger(GoogleAnalyticsInterceptor.name);

  private baseUrl = 'https://www.google-analytics.com/mp/collect';
  // private baseUrl = 'https://www.google-analytics.com/debug/mp/collect';

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest<Request>();
    const startTime = Date.now();

    const handleError = (error) => this.logger.error('Error logging to Google Analytics:', error);

    return next.handle().pipe(
      tap(async () => {
        try {
          if (!process.env.GA_MEASUREMENT_ID || !process.env.GA_CLIENT_ID || !process.env.GA_API_SECRET) return;

          const res = context.switchToHttp().getResponse<Response>();

          const eventData = {
            client_id: req.headers['x-ga-client-id'] || process.env.GA_CLIENT_ID,
            events: [{
              name: 'api_access',
              params: {
                method: req.method,
                path: req.path,
                query_string: JSON.stringify(req.query),
                status_code: res.statusCode,
                duration: round((Date.now() - startTime) / 1000, 1),
                // debug_mode: 'true',
              },
            }],
          };

          const params = { measurement_id: process.env.GA_MEASUREMENT_ID, api_secret: process.env.GA_API_SECRET };
          axios.post(this.baseUrl, eventData, { headers: { 'Content-Type': 'application/json' }, params })
            // .then(r => this.logger.log(`${r.status} ${r.statusText} ${r.data && JSON.stringify(r.data)}`)) // debug
            .catch((err) => handleError(err));
        } catch (err) {
          handleError(err);
        }
      })
    );
  }
}