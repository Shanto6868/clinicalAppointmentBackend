import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, JoinColumn } from 'typeorm';
import { Patient } from '../patient/patient.entity';
// import { Doctor } from '../doctor/doctor.entity'; // Import Doctor entity

@Entity()
export class Appointment {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  @Column({ type: 'timestamptz' })
  dateTime: Date;

  @Column({ type: 'varchar', length: 200 })
  reason: string;

  @Column({
    type: 'enum',
    enum: ['pending', 'confirmed', 'cancelled'],
    default: 'pending',
  })
  status: 'pending' | 'confirmed' | 'cancelled';

  @ManyToOne(() => Patient, (patient) => patient.id, {
    onDelete: 'CASCADE',
    eager: false,
  })
  @JoinColumn({ name: 'patientId' })
  patient: Patient;

  @Column({ type: 'int', unsigned: true })
  patientId: number;

  //  Add doctor relation
  // @ManyToOne(() => Doctor, (doctor) => doctor.id, {
  //   onDelete: 'CASCADE',
  //   eager: false,
  // })
  // @JoinColumn({ name: 'doctorId' })
  // doctor: Doctor;

  // @Column({ type: 'int', unsigned: true })
  // doctorId: number;

  // @CreateDateColumn()
  // createdAt: Date;
}
