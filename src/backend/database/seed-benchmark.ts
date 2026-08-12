import * as bcrypt from 'bcrypt';
import { Role } from '../auth/role.enum';
import { Profile } from '../profiles/profile.entity';
import { QuizOption } from '../quizzes/quiz-option.entity';
import { Quiz } from '../quizzes/quiz.entity';
import { User } from '../users/user.entity';
import { Video } from '../videos/video.entity';
import { AppDataSource } from './data-source';

const BENCHMARK_TITLE = '[BENCHMARK] Petualangan Sains EduToon';

async function seed() {
  if (process.env.ALLOW_BENCHMARK_SEED !== 'true') {
    throw new Error('Set ALLOW_BENCHMARK_SEED=true to enable the isolated benchmark seed.');
  }
  if (!process.env.DB_NAME?.toLowerCase().includes('benchmark')) {
    throw new Error('Benchmark seed refused: DB_NAME must contain "benchmark".');
  }

  const email = process.env.BENCHMARK_EMAIL;
  const password = process.env.BENCHMARK_PASSWORD;
  if (!email || !password || password.length < 12) {
    throw new Error('BENCHMARK_EMAIL and BENCHMARK_PASSWORD (minimum 12 characters) are required.');
  }

  await AppDataSource.initialize();
  try {
    await AppDataSource.transaction(async (manager) => {
      const users = manager.getRepository(User);
      let user = await users.findOne({ where: { email } });
      if (!user) {
        user = await users.save(users.create({
          email,
          password_hash: await bcrypt.hash(password, 10),
          full_name: 'EduToon Benchmark',
          role: Role.PARENT,
        }));
      }

      const profiles = manager.getRepository(Profile);
      let profile = await profiles.findOne({ where: { userId: user.id, name: 'Benchmark Child' } });
      if (!profile) {
        profile = await profiles.save(profiles.create({
          name: 'Benchmark Child',
          age_group: 10,
          userId: user.id,
        }));
      }

      const videos = manager.getRepository(Video);
      let video = await videos.findOne({ where: { title: BENCHMARK_TITLE } });
      if (!video) {
        video = await videos.save(videos.create({
          title: BENCHMARK_TITLE,
          description: 'Data terisolasi untuk smoke test lokal EduToon.',
          video_url: 'https://example.invalid/edutoon-benchmark-video',
          platform: 'native',
          category: 'benchmark',
          min_age: 0,
          max_age: 18,
          status: 'published',
          published_at: new Date(),
          view_count: 0,
        }));
      }

      const quizzes = manager.getRepository(Quiz);
      const options = manager.getRepository(QuizOption);
      const existingQuiz = await quizzes.findOne({ where: { videoId: video.id } });
      if (!existingQuiz) {
        const quiz = await quizzes.save(quizzes.create({
          videoId: video.id,
          timestamp_seconds: 15,
          question_text: 'Apa tujuan data benchmark ini?',
        }));
        await options.save([
          options.create({ quizId: quiz.id, option_text: 'Menguji alur baca secara lokal', is_correct: true }),
          options.create({ quizId: quiz.id, option_text: 'Mengubah data production', is_correct: false }),
        ]);
      }

      console.log(`Benchmark fixtures ready: user=${user.id}, profile=${profile.id}, video=${video.id}`);
    });
  } finally {
    await AppDataSource.destroy();
  }
}

seed().catch((error) => {
  console.error('Benchmark seed failed:', error instanceof Error ? error.message : 'unknown error');
  process.exitCode = 1;
});
