import { VideosController } from './videos.controller';

describe('VideosController', () => {
  let controller: VideosController;

  beforeEach(() => {
    controller = new VideosController({} as any, {} as any);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
