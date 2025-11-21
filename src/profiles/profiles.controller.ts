import { Controller, Get, Post, Body } from '@nestjs/common';
import { ProfilesService } from './profiles.service';

@Controller('api/profiles')
export class ProfilesController {
  constructor(private readonly profilesService: ProfilesService) {}

  // nanti ini pakai userId dari JWT, sementara hardcode dulu untuk testing
  @Get()
  async getProfilesMock() {
    const userId = 1; // TODO: ganti dengan user dari token
    return this.profilesService.findByUser(userId);
  }

  @Post()
  async createProfileMock(
    @Body() body: { name: string; age: number; passcode?: string },
  ) {
    const userId = 1; // TODO: ganti dengan user dari token
    return this.profilesService.create(userId, body);
  }
}
