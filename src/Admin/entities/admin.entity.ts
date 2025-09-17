import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Patient } from '../../patient/patient.entity';
import { Doctor } from '../../doctor/doctor.entity';
import { Appointment } from '../../appointments/appointment.entity'; 

@Entity('admin')
export class Admin {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: true })
  isActive: boolean;

  @Column({ nullable: true })
  name: string;

  @Column({ type: 'bigint', unsigned: true })
  phone: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ type: 'enum', enum: ['male', 'female'] })
  gender: string;

  @Column({ default: 0 })
  failedLoginAttempts: number;

  // ✅ Relationship with Patients
  @OneToMany(() => Patient, (patient) => patient.admin)
  patients: Patient[];

  // ✅ Relationship with Doctors
  @OneToMany(() => Doctor, (doctor) => doctor.admin)
  doctors: Doctor[];

  // ✅ Relationship with Appointments
  @OneToMany(() => Appointment, (appointment) => appointment.admin)
  appointments: Appointment[];
}
