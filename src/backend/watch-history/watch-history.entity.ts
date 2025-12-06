import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Profile } from '../profiles/profile.entity';
import { Video } from '../videos/video.entity';

@Entity('watch_history')
export class WatchHistory {
    @PrimaryColumn()
    profile_id: number;

    @PrimaryColumn()
    video_id: number;

    @ManyToOne(() => Profile, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'profile_id' })
    profile: Profile;

    @ManyToOne(() => Video, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'video_id' })
    video: Video;

    @Column({ type: 'int', default: 0 })
    last_position_seconds: number;

    @Column({ type: 'boolean', default: false })
    is_completed: boolean;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    updated_at: Date;
}
