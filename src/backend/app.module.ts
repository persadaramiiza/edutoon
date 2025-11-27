import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

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

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get('DB_Host'),
        port: Number(config.get('DB_PORT')),
        username: config.get('DB_USER'),
        password: config.get('DB_PASS'),
        database: config.get('DB_NAME'),
        entities: [User, Profile, Video, Quiz, QuizOption, QuizAttempt, WatchHistory],
        synchronize: true,
      }),
    }),
    AuthModule,
    UsersModule,
    ProfilesModule,
    VideosModule,
    QuizzesModule,
    WatchHistoryModule,
  ],
})
export class AppModule { }
