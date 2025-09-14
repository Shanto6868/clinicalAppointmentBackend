import { Entity, PrimaryGeneratedColumn, Column, BeforeInsert, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { Appointment } from '../appointments/appointment.entity';
import { Admin } from '../admin/entities/admin.entity';
import * as bcrypt from 'bcrypt';

@Entity()
export class Doctor {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ 
    type: 'varchar', 
    length: 100, 
    unique: true 
  })
  username: string;

  @Column({ 
    type: 'varchar', 
    length: 150 
  })
  fullName: string;

  @Column({ 
    type: 'boolean', 
    default: true 
  })
  isActive: boolean;

  @Column({ 
    type: 'varchar', 
    unique: true 
  })
  customId: string;

  @Column({ type: 'varchar', unique: true,  nullable: true })
  email: string;

  @Column({ type: 'varchar', select: false,  nullable: true }) 
  password: string;

  @Column({ type: 'varchar',  nullable: true })
  phone: string;

  @Column({ nullable: true})
  specialization: string;

  @Column({ type: 'int',  nullable: true })
  experience: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  // Relationship with Admin
  @ManyToOne(() => Admin, (admin) => admin.doctors)
  @JoinColumn({ name: 'adminId' })
  admin: Admin;

  @Column({ nullable: true })
  adminId: number;

  @OneToMany(() => Appointment, appointment => appointment.doctor, {
    cascade: true, 
    eager: false 
  })
  appointments: Appointment[];

  @BeforeInsert()
  generateCustomId() {
    const randomId = Math.floor(Math.random() * 1000000);
    this.customId = `DOC-${randomId}`;
  }

  @BeforeInsert()
  async hashPassword() {
    this.password = await bcrypt.hash(this.password, 10);
  }
}