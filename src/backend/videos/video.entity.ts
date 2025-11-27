import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('videos')
export class Video {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ length: 200 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ length: 500 })
  video_url: string; // URL HLS/M3U8

  @Column({ length: 500, nullable: true })
  thumbnail_url?: string;

  @Column({ type: 'int', nullable: true })
  duration_seconds?: number;

  @Column({ type: 'int', default: 0 })
  min_age: number; // rating usia minimal

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;
}
