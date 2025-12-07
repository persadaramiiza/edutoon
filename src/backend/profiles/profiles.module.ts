import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProfilesService } from './profiles.service';
import { ProfilesController } from './profiles.controller';
import { Profile } from './profile.entity';
import { QuizzesModule } from '../quizzes/quizzes.module';

@Module({
  imports: [TypeOrmModule.forFeature([Profile]), forwardRef(() => QuizzesModule)],
  controllers: [ProfilesController],
  providers: [ProfilesService],
  exports: [ProfilesService],
})
export class ProfilesModule {}