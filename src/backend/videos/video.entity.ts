import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../users/user.entity';

export enum VideoPlatform {
  NATIVE = 'native',
  YOUTUBE = 'youtube',
  VIMEO = 'vimeo',
  OTHER = 'other',
}

export enum VideoStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
}

@Entity('videos')
export class Video {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ length: 200 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ length: 500 })
  video_url: string;

  @Column({ length: 100, nullable: true })
  video_id?: string; // YouTube/Vimeo video ID

  @Column({ length: 500, nullable: true })
  thumbnail_url?: string;

  @Column({
    type: 'enum',
    enum: VideoPlatform,
    default: VideoPlatform.NATIVE,
  })
  platform: VideoPlatform;

  @Column({
    type: 'enum',
    enum: VideoStatus,
    default: VideoStatus.DRAFT,
  })
  status: VideoStatus;

  @Column({ type: 'int', nullable: true })
  duration_seconds?: number;

  @Column({ type: 'int', default: 0 })
  min_age: number;

  @Column({ type: 'int', nullable: true })
  max_age?: number;

  @Column({ length: 100, nullable: true })
  category?: string;

  @Column({ default: 0 })
  view_count: number;

  @ManyToOne(() => User, { eager: true, nullable: true })
  @JoinColumn({ name: 'creator_id' })
  creator?: User;

  @Column({ nullable: true })
  creator_id?: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}