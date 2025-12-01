import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello() {
    return {
      name: 'EduToon API',
      version: '1.0.0',
      description: 'Platform edukasi webtoon untuk anak',
      docs: '/api/docs',
      health: '/api/health',
      timestamp: new Date().toISOString(),
    };
  }
}
