import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { ProfilesService } from './profiles.service';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import type { JwtUser } from '../auth/jwt-user.interface';
import { QuizzesService } from '../quizzes/quizzes.service';

@ApiTags('Profiles')
@Controller('api/profiles')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ProfilesController {
  constructor(
    private readonly profilesService: ProfilesService,
    private readonly quizzesService: QuizzesService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Buat profile anak baru' })
  @ApiBody({ type: CreateProfileDto })
  create(@Body() dto: CreateProfileDto, @CurrentUser() user: JwtUser) {
    return this.profilesService.create(dto, user.sub);
  }

  @Get()
  @ApiOperation({ summary: 'Daftar semua profile anak milik user' })
  findAll(@CurrentUser() user: JwtUser) {
    return this.profilesService.findAllByUser(user.sub);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detail profile anak' })
  findOne(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: JwtUser) {
    return this.profilesService.findOneByUser(id, user.sub);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update profile anak' })
  @ApiBody({ type: UpdateProfileDto })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateProfileDto,
    @CurrentUser() user: JwtUser,
  ) {
    return this.profilesService.update(id, dto, user.sub);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Hapus profile anak' })
  remove(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: JwtUser) {
    return this.profilesService.remove(id, user.sub);
  }

  // Get quiz attempts by profile
  @Get(':profileId/quiz-attempts')
  @ApiOperation({ summary: 'Get all quiz attempts by profile' })
  async getQuizAttemptsByProfile(
    @Param('profileId', ParseIntPipe) profileId: number,
    @CurrentUser() user: JwtUser,
  ) {
    console.log(`📥 Fetching quiz attempts for profile ${profileId}`);
    return this.quizzesService.getAttemptsByProfile(profileId, user.userId);
  }
}