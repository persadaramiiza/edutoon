import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { ProfilesService } from './profiles.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import type { JwtUser } from '../auth/jwt-user.interface';

@Controller('api/profiles')
export class ProfilesController {
  constructor(private readonly profilesService: ProfilesService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async getProfiles(@CurrentUser() user: JwtUser) {
    return this.profilesService.findByUser(user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  async createProfile(
    @CurrentUser() user: JwtUser,
    @Body() body: { name: string; age: number; passcode?: string },
  ) {
    return this.profilesService.create(user.userId, body);
  }
}
