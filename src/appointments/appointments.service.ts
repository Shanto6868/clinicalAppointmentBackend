import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Appointment } from './appointment.entity';
import { CreateAppointmentDto } from './create-appointment.dto';
import { UpdateAppointmentDto } from './update-appointment.dto';
import { DoctorService } from '../doctor/doctor.service';
import { Patient } from '../patient/patient.entity';

@Injectable()
export class AppointmentService {
  constructor(
    @InjectRepository(Appointment)
    private appointmentRepository: Repository<Appointment>,

    @InjectRepository(Patient)
    private patientRepository: Repository<Patient>,

    private doctorService: DoctorService,
  ) {}

  // Create appointment for a patient (adminId optional)
async create(
  createAppointmentDto: CreateAppointmentDto,
  patientId: any, // initially, it could be string
): Promise<Appointment> {
  const parsedPatientId = Number(patientId);

  if (isNaN(parsedPatientId)) {
    throw new BadRequestException(`Invalid patientId: ${patientId}`);
  }

  // Ensure doctor exists
  await this.doctorService.findById(createAppointmentDto.doctorId);

  // Ensure patient exists
  const patient = await this.patientRepository.findOne({
    where: { id: parsedPatientId },
  });

  if (!patient) {
    throw new NotFoundException(`Patient with ID ${parsedPatientId} not found`);
  }

  const appointment = this.appointmentRepository.create({
    doctorId: createAppointmentDto.doctorId,
    patientId: parsedPatientId,
    date: new Date(createAppointmentDto.date),
    time: createAppointmentDto.time,
    status: createAppointmentDto.status ?? 'pending',
  });

  return this.appointmentRepository.save(appointment);
}

  // Admin: Get all appointments (adminId optional filter)
  async findAll(adminId?: number): Promise<Appointment[]> {
    const where: any = {};
    // if (adminId) {
    //   where.admin = { id: adminId };
    // } 

    return this.appointmentRepository.find({
      where,
      relations: ['doctor', 'patient', 'admin'],
      order: { date: 'ASC', time: 'ASC' },
    });
  }

  // Shared: Get by ID (controller restricts access by role)
  async findById(id: number): Promise<Appointment> {
    const appointment = await this.appointmentRepository.findOne({
      where: { id },
      relations: ['doctor', 'patient', 'admin'],
    });

    if (!appointment) {
      throw new NotFoundException(`Appointment with ID ${id} not found`);
    }
    return appointment;
  }

  async update(
    id: number,
    updateAppointmentDto: UpdateAppointmentDto,
  ): Promise<Appointment> {
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
      relations: ['doctor', 'patient', 'admin'],
      order: { date: 'ASC', time: 'ASC' },
    });
  }

  async getPatientAppointments(patientId: number): Promise<Appointment[]> {
    return this.appointmentRepository.find({
      where: { patient: { id: patientId } },
      relations: ['doctor', 'patient', 'admin'],
      order: { date: 'ASC', time: 'ASC' },
    });
  }

  async findByDateRange(startDate: Date, endDate: Date): Promise<Appointment[]> {
    return this.appointmentRepository.find({
      where: { date: Between(new Date(startDate), new Date(endDate)) },
      relations: ['doctor', 'patient', 'admin'],
      order: { date: 'ASC', time: 'ASC' },
    });
  }

  async getDoctorAppointmentsByDate(
    doctorId: number,
    date: Date,
  ): Promise<Appointment[]> {
    await this.doctorService.findById(doctorId);
    return this.appointmentRepository.find({
      where: { doctor: { id: doctorId }, date: new Date(date) },
      relations: ['doctor', 'patient', 'admin'],
    });
  }
}
