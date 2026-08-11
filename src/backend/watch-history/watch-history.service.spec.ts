import { WatchHistoryService } from './watch-history.service';

describe('WatchHistoryService', () => {
  let service: WatchHistoryService;

  beforeEach(() => {
    service = new WatchHistoryService({} as any, {} as any, {} as any);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
