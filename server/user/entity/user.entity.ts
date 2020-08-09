import { Entity, PrimaryGeneratedColumn, Column, BeforeInsert } from 'typeorm';
import { hash } from 'bcrypt'

/**
 * an authentication user
 */
@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;  

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @BeforeInsert()
  async hashPassword() {
    this.password = await hash(this.password, 12);
  }
}