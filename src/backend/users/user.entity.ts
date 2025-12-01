import { Entity, PrimaryGeneratedColumn, Column, OneToMany, Index, DeleteDateColumn } from "typeorm";
import { Profile } from '../profiles/profile.entity'
import { Role } from '../auth/role.enum';
import { Exclude } from 'class-transformer';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Index({ unique: true })
  @Column({ unique: true, length: 255 })
  email: string;

  @Exclude()
  @Column({ name: 'password_hash', length: 255 })
  password_hash: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column({ name: 'full_name', length: 100, nullable: true })
  full_name?: string;

  @Index()
  @Column({
    type: 'enum',
    enum: Role,
    default: Role.PARENT,
  })
  role: Role;

  @OneToMany(() => Profile, (profile) => profile.user)
  profiles: Profile[];

  @DeleteDateColumn()
  deleted_at?: Date;
}