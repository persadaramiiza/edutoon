import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('quiz_attempts')
export class QuizAttempt {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column()
  profile_id: number; // id profil anak yang menjawab

  @Column()
  quiz_id: number;

  @Column()
  is_correct: boolean;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  attempted_at: Date;
}
