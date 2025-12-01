import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VideosService } from './videos.service';
import { VideosController } from './videos.controller';
import { Video } from './video.entity';
import { ProfilesModule } from '../profiles/profiles.module';

@Module({
  imports: [TypeOrmModule.forFeature([Video]), ProfilesModule],
  providers: [VideosService],
  controllers: [VideosController],
  exports: [VideosService], // Export untuk digunakan module lain
})
export class VideosModule {}