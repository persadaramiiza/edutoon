import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from 'typeorm';
import { Video } from '../videos/video.entity';
import { QuizOption } from './quiz-option.entity';

@Entity('quizzes')
export class Quiz {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column()
  videoId: number;

  @ManyToOne(() => Video, { onDelete: 'CASCADE' })
  video: Video;

  @Column()
  timestamp_seconds: number;

  @Column({ type: 'text' })
  question_text: string;

  @OneToMany(() => QuizOption, (opt) => opt.quiz)
  options: QuizOption[];
}
