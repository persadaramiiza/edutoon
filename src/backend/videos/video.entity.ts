import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../users/user.entity';

@Entity('videos')
export class Video {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column()
  video_url: string;

  @Column({ nullable: true })
  thumbnail_url: string; // ✅ ADD THIS

  @Column({ default: 'youtube' })
  platform: 'youtube' | 'vimeo' | 'native';

  @Column({ nullable: true })
  category: string;

  @Column({ default: 0 })
  min_age: number;

  @Column({ default: 18 })
  max_age: number;

  @Column({ default: 0 })
  view_count: number;

  @Column({ default: 'draft' })
  status: 'draft' | 'published' | 'archived';

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  creator: User;

  @Column({ nullable: true })
  creator_id: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @Column({ nullable: true })
  published_at: Date;
}