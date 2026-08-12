import { WatchHistoryController } from './watch-history.controller';

describe('WatchHistoryController', () => {
  let controller: WatchHistoryController;

  beforeEach(() => {
    controller = new WatchHistoryController({} as any);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
