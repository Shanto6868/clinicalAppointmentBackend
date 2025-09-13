import { Injectable, NotFoundException, } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Appointment } from './appointment.entity';
import { CreateAppointmentDto } from './create-appointment.dto';
import { UpdateAppointmentDto } from './update-appointment.dto';
import { DoctorService } from '../doctor/doctor.service';

@Injectable()
export class AppointmentService {
  constructor(
    @InjectRepository(Appointment)
    private appointmentRepository: Repository<Appointment>,
    private doctorService: DoctorService
  ) {}

  async create(createAppointmentDto: CreateAppointmentDto): Promise<Appointment> {
  const appointment = this.appointmentRepository.create({
    ...createAppointmentDto,
    doctor: { id: createAppointmentDto.doctorId } 
  });
  
  return this.appointmentRepository.save(appointment);
}

  async findAll(): Promise<Appointment[]> {
    return this.appointmentRepository.find({ 
      relations: ['doctor'],
      order: {  date: 'ASC', time: 'ASC' }
    });
  }

  async findById(id: number): Promise<Appointment> {
    const appointment = await this.appointmentRepository.findOne({ 
      where: { id },
      relations: ['doctor']
    });
    
    if (!appointment) {
      throw new NotFoundException(`Appointment with ID ${id} not found`);
    }
    return appointment;
  }

  async update(id: number, updateAppointmentDto: UpdateAppointmentDto): Promise<Appointment> {
    const appointment = await this.findById(id);
    Object.assign(appointment, updateAppointmentDto);
    return this.appointmentRepository.save(appointment);
  }

  async remove(id: number): Promise<void> {
    const result = await this.appointmentRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Appointment with ID ${id} not found`);
    }
  }

  async findByDoctor(doctorId: number): Promise<Appointment[]> {
    await this.doctorService.findById(doctorId); 
    return this.appointmentRepository.find({
      where: { doctor: { id: doctorId } },
      relations: ['doctor'],
      order: { date: 'ASC', time: 'ASC',  }
    });
  }

  async findByDateRange(startDate: Date, endDate: Date): Promise<Appointment[]> {
    return this.appointmentRepository.find({
      where: {
        date: Between(
          new Date(startDate),
          new Date(endDate)
        )
      },
      relations: ['doctor'],
      order: {  date: 'ASC', time: 'ASC',  }
    });
  }

  async getDoctorAppointmentsByDate(doctorId: number, date: Date): Promise<Appointment[]> {
    await this.doctorService.findById(doctorId);
    return this.appointmentRepository.find({
      where: {
        doctor: { id: doctorId },
        date: new Date(date)
      },
    
    });
  }

  async getDoctorAppointments(doctorId: number): Promise<Appointment[]> {
  return this.appointmentRepository.find({
    where: { doctor: { id: doctorId } },
    relations: ['doctor'] 
  });
}
}