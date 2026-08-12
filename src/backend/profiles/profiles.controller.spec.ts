import { ProfilesController } from './profiles.controller';

describe('ProfilesController', () => {
  let controller: ProfilesController;

  beforeEach(() => {
    controller = new ProfilesController({} as any, {} as any);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
