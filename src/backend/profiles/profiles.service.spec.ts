import { ProfilesService } from './profiles.service';

describe('ProfilesService', () => {
  let service: ProfilesService;

  beforeEach(() => {
    service = new ProfilesService({} as any);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
