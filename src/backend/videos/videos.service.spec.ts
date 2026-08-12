import { VideosService } from './videos.service';

describe('VideosService', () => {
  let service: VideosService;

  beforeEach(() => {
    service = new VideosService({} as any, {} as any, {} as any, {} as any);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
