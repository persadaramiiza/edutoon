import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Quiz } from './quiz.entity';

@Entity('quiz_options')
export class QuizOption {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column()
  quizId: number;

  @ManyToOne(() => Quiz, (quiz) => quiz.options, { onDelete: 'CASCADE' })
  quiz: Quiz;

  @Column({ length: 255 })
  option_text: string;

  @Column({ default: false })
  is_correct: boolean;
}
