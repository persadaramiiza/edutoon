import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
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
@Index(['status', 'min_age']) // Composite index for filtering
@Index(['creator_id', 'created_at']) // Index for creator's videos
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
  video_id?: string;

  @Column({ length: 500, nullable: true })
  thumbnail_url?: string;

  @Column({
    type: 'enum',
    enum: VideoPlatform,
    default: VideoPlatform.NATIVE,
  })
  platform: VideoPlatform;

  @Index()
  @Column({
    type: 'enum',
    enum: VideoStatus,
    default: VideoStatus.DRAFT,
  })
  status: VideoStatus;

  @Column({ type: 'int', nullable: true })
  duration_seconds?: number;

  @Index()
  @Column({ type: 'int', default: 0 })
  min_age: number;

  @Column({ type: 'int', nullable: true })
  max_age?: number;

  @Index()
  @Column({ length: 100, nullable: true })
  category?: string;

  @Column({ default: 0 })
  view_count: number;

  @ManyToOne(() => User, { eager: true, nullable: true })
  @JoinColumn({ name: 'creator_id' })
  creator?: User;

  @Index()
  @Column({ nullable: true })
  creator_id?: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @DeleteDateColumn()
  deleted_at?: Date;
}