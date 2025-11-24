import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { User } from '../users/user.entity';

@Entity('profiles')
export class Profile{
      @PrimaryGeneratedColumn('increment')
  id: number;

  @Column()
  profile_name: string;

  @Column({ nullable: true })
  avatar_url?: string;

  @Column()
  age_group: number;

  @Column({ length: 4, nullable: true })
  passcode?: string;

  @ManyToOne(() => User, (user) => user.profiles, { onDelete: 'CASCADE' })
  user: User;

  @Column()
  userId: number; // kolom FK
}