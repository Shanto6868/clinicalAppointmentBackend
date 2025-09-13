import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn,  } from 'typeorm';
import { Doctor } from '../doctor/doctor.entity';

@Entity()
export class Appointment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column() 
  patientName: string;

  @Column({ type: 'date' })
  date: Date;

  @Column()
  time: string;

 @Column({ nullable: false })  
doctorId: number;

@ManyToOne(() => Doctor, doctor => doctor.appointments, { 
  eager: false,
  onDelete: 'CASCADE'
})

@JoinColumn({ name: 'doctorId' })
doctor: Doctor;

   @Column({ 
    type: 'varchar',
    default: 'pending',
    enum: ['pending', 'confirmed', 'cancelled', 'completed']
  })
  status: string;
  
}
