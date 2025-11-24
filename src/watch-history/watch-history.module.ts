import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WatchHistory } from './watch-history.entity';
import { WatchHistoryService } from './watch-history.service';
import { WatchHistoryController } from './watch-history.controller';
import { ProfilesModule } from '../profiles/profiles.module';

@Module({
  imports: [TypeOrmModule.forFeature([WatchHistory]), ProfilesModule],
  providers: [WatchHistoryService],
  controllers: [WatchHistoryController],
})
export class WatchHistoryModule {}
