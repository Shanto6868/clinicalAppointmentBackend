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
