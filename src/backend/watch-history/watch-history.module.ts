import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WatchHistory } from './watch-history.entity';
import { WatchHistoryService } from './watch-history.service';
import { WatchHistoryController } from './watch-history.controller';
import { ProfilesModule } from '../profiles/profiles.module';
import { Video } from '../videos/video.entity';

@Module({
  imports: [TypeOrmModule.forFeature([WatchHistory, Video]), ProfilesModule],
  providers: [WatchHistoryService],
  controllers: [WatchHistoryController],
})
export class WatchHistoryModule { }
