import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { Profile } from '../profiles/profile.entity'

@Entity('users')
export  class User{
     @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ unique: true })
  email: string;

  @Column()
  password_hash: string;

  @Column({ nullable: true })
  full_name?: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @OneToMany(() => Profile, (profile) => profile.user)
  profiles: Profile[];
}