import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Doctor } from '../doctor/doctor.entity';
import { Patient } from '../patient/patient.entity';
import { Admin } from '../admin/entities/admin.entity'; // ✅ Import Admin

@Entity()
export class Appointment {
  @PrimaryGeneratedColumn()
  id: number;

  // ✅ Relation with Patient
  @ManyToOne(() => Patient, (patient) => patient.appointments, {
    eager: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'patientId' })
  patient: Patient;

  @Column()
  patientId: number;

  // ✅ Relation with Doctor
  @ManyToOne(() => Doctor, (doctor) => doctor.appointments, {
    eager: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'doctorId' })
  doctor: Doctor;

  @Column()
  doctorId: number;

  // ✅ Relation with Admin
  @ManyToOne(() => Admin, (admin) => admin.appointments, {
    eager: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'adminId' })
  admin: Admin;

  @Column({nullable: true})
  adminId: number;

  // Appointment details
  @Column({ type: 'date' })
  date: Date;

  @Column()
  time: string;

  @Column({
    type: 'enum',
    enum: ['pending', 'confirmed', 'cancelled', 'completed'],
    default: 'pending',
  })
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';

  @CreateDateColumn()
  createdAt: Date;
}
