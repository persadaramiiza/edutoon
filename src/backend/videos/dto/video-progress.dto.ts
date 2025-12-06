import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { Video } from '../video.entity';

@Entity('video_progress')
@Index(['video_id', 'profile_id'], { unique: true })
export class VideoProgress {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column()
  video_id: number;

  @ManyToOne(() => Video, { onDelete: 'CASCADE' })
  video: Video;

  @Column()
  profile_id: number;

  @Column({ type: 'int', default: 0 })
  timestamp_seconds: number;

  @Column({ type: 'boolean', default: false })
  is_completed: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}