import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, BeforeInsert, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { Appointment } from '../appointments/appointment.entity';
import { Admin } from '../admin/entities/admin.entity';

@Entity()
export class Patient {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  @Column({ type: 'varchar', length: 100 })
  fullName: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 255 })
  password: string;

  @Column({ type: 'int', unsigned: true })
  age: number;

  @Column({ type: 'enum', enum: ['male', 'female', 'other'] })
  gender: 'male' | 'female' | 'other';

  @Column({ type: 'varchar', nullable: true })
  image: string | null;

  @Column({ type: 'varchar', length: 255 })
  address: string;

  @Column({
    type: 'enum',
    enum: ['active', 'inactive'],
    default: 'active',
  })
  status: 'active' | 'inactive';

  @CreateDateColumn()
  createdAt: Date;

  // Relationship with Admin
  @ManyToOne(() => Admin, (admin) => admin.patients)
  @JoinColumn({ name: 'adminId' })
  admin: Admin;

  @Column({ nullable: true })
  adminId: number;

  @OneToMany(() => Appointment, appointment => appointment.patient, {
    cascade: true, 
    eager: false 
  })
  appointments: Appointment[];

  @BeforeInsert()
  normalizeName() {
    if (this.fullName) this.fullName = this.fullName.trim();
  }
}