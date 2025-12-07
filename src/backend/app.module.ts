import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

import { AppController } from './app.controller';
import { AppService } from './app.service';

import { User } from './users/user.entity';
import { Profile } from './profiles/profile.entity';

import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ProfilesModule } from './profiles/profiles.module';

import { VideosModule } from './videos/videos.module';
import { Video } from './videos/video.entity';

import { Quiz } from './quizzes/quiz.entity';
import { QuizOption } from './quizzes/quiz-option.entity';
import { QuizAttempt } from './quizzes/quiz-attempt.entity';
import { QuizzesModule } from './quizzes/quizzes.module';

import { WatchHistory } from './watch-history/watch-history.entity';
import { WatchHistoryModule } from './watch-history/watch-history.module';

import { HealthModule } from './health/health.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

    // Rate Limiting: 60 requests per minute per IP
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 60,
    }]),

    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get('DB_HOST') || config.get('DB_Host'),
        port: Number(config.get('DB_PORT')),
        username: config.get('DB_USER'),
        password: config.get('DB_PASS'),
        database: config.get('DB_NAME'),
        entities: [User, Profile, Video, Quiz, QuizOption, QuizAttempt, WatchHistory],
        synchronize: process.env.NODE_ENV !== 'production',
        logging: false,
      }),
    }),
    AuthModule,
    UsersModule,
    ProfilesModule,
    VideosModule,
    QuizzesModule,
    WatchHistoryModule,
    HealthModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}