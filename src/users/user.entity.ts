import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { Profile } from '../profiles/profile.entity'
import { Role } from '../auth/role.enum';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ unique: true, length: 255 })
  email: string;

  @Column({ name: 'password_hash', length: 255 })
  password_hash: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column({ name: 'full_name', length: 100, nullable: true })
  full_name?: string;

  @Column({
    type: 'enum',
    enum: Role,
    default: Role.PARENT,
  })
  role: Role;

  @OneToMany(() => Profile, (profile) => profile.user)
  profiles: Profile[];
}