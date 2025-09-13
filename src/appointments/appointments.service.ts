import { Injectable, NotFoundException } from '@nestjs/common';
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

  // ✅ Create appointment for a patient
  async create(
    createAppointmentDto: CreateAppointmentDto,
    patientId: number,
  ): Promise<Appointment> {
    // Ensure doctor exists
    await this.doctorService.findById(createAppointmentDto.doctorId);

    // Ensure patient exists
    const patient = await this.patientRepository.findOne({
      where: { id: patientId },
    });
    if (!patient) {
      throw new NotFoundException(`Patient with ID ${patientId} not found`);
    }

    const appointment = this.appointmentRepository.create({
      doctor: { id: createAppointmentDto.doctorId },
      patient: { id: patientId },
      date: createAppointmentDto.date,
      time: createAppointmentDto.time,
      status: createAppointmentDto.status ?? 'pending',
    });

    return this.appointmentRepository.save(appointment);
  }

  // ✅ Admin: Get all appointments
  async findAll(): Promise<Appointment[]> {
    return this.appointmentRepository.find({
      relations: ['doctor', 'patient'],
      order: { date: 'ASC', time: 'ASC' },
    });
  }

  // ✅ Shared: Get by ID (controller restricts access by role)
  async findById(id: number): Promise<Appointment> {
    const appointment = await this.appointmentRepository.findOne({
      where: { id },
      relations: ['doctor', 'patient'],
    });

    if (!appointment) {
      throw new NotFoundException(`Appointment with ID ${id} not found`);
    }
    return appointment;
  }

  // ✅ Admin / Doctor (controller decides who can call this)
  async update(
    id: number,
    updateAppointmentDto: UpdateAppointmentDto,
  ): Promise<Appointment> {
    const appointment = await this.findById(id);
    Object.assign(appointment, updateAppointmentDto);
    return this.appointmentRepository.save(appointment);
  }

  // ✅ Admin only
  async remove(id: number): Promise<void> {
    const result = await this.appointmentRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Appointment with ID ${id} not found`);
    }
  }

  // ✅ Doctor: Get their appointments
  async findByDoctor(doctorId: number): Promise<Appointment[]> {
    await this.doctorService.findById(doctorId);
    return this.appointmentRepository.find({
      where: { doctor: { id: doctorId } },
      relations: ['doctor', 'patient'],
      order: { date: 'ASC', time: 'ASC' },
    });
  }

  // ✅ Admin: Find by date range
  async findByDateRange(
    startDate: Date,
    endDate: Date,
  ): Promise<Appointment[]> {
    return this.appointmentRepository.find({
      where: { date: Between(new Date(startDate), new Date(endDate)) },
      relations: ['doctor', 'patient'],
      order: { date: 'ASC', time: 'ASC' },
    });
  }

  // ✅ Doctor: Get appointments by date
  async getDoctorAppointmentsByDate(
    doctorId: number,
    date: Date,
  ): Promise<Appointment[]> {
    await this.doctorService.findById(doctorId);
    return this.appointmentRepository.find({
      where: { doctor: { id: doctorId }, date: new Date(date) },
      relations: ['doctor', 'patient'],
    });
  }

  // ✅ Doctor: Get all their appointments
  async getDoctorAppointments(doctorId: number): Promise<Appointment[]> {
    return this.appointmentRepository.find({
      where: { doctor: { id: doctorId } },
      relations: ['doctor', 'patient'],
    });
  }

  // ✅ Patient: Get their own appointments
  async getPatientAppointments(patientId: number): Promise<Appointment[]> {
    return this.appointmentRepository.find({
      where: { patient: { id: patientId } },
      relations: ['doctor', 'patient'],
      order: { date: 'ASC', time: 'ASC' },
    });
  }
}
