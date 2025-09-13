import { Injectable, NotFoundException, ConflictException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Doctor } from './doctor.entity';
import { CreateDoctorDto } from './create-doctor.dto';
import { UpdateDoctorDto } from './update-doctor.dto';
import { LoginDoctorDto } from './login-doctor.dto';
import * as bcrypt from 'bcrypt';
import { Appointment } from '../appointments/appointment.entity';

@Injectable()
export class DoctorService {
  constructor(
    @InjectRepository(Doctor)
    private doctorRepository: Repository<Doctor>,
  ) {}

  async register(createDoctorDto: CreateDoctorDto): Promise<Doctor> {
    const existingDoctor = await this.doctorRepository.findOne({
      where: [
        { email: createDoctorDto.email },
        { username: createDoctorDto.username }
      ]
    });

    if (existingDoctor) {
      throw new ConflictException('Email or username already in use');
    }

    const doctor = this.doctorRepository.create(createDoctorDto);
    return this.doctorRepository.save(doctor);
  }

  async login(loginDoctorDto: LoginDoctorDto): Promise<any> {
    const doctor = await this.doctorRepository.findOne({
      where: { email: loginDoctorDto.email },
      select: ['id', 'email', 'password', 'isActive', 'fullName']
    });

    if (!doctor) {
      throw new NotFoundException('Doctor account not found');
    }

    if (!doctor.isActive) {
      throw new UnauthorizedException('Account is deactivated');
    }

    const isPasswordValid = await bcrypt.compare(
      loginDoctorDto.password,
      doctor.password
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid password');
    }

    const { password, ...result } = doctor;
    return result;
  }

async findByEmailForAuth(email: string): Promise<Doctor> {
  const doctor = await this.doctorRepository.findOne({
    where: { email },
    select: ['id', 'email', 'password', 'isActive', 'username', 'fullName']
  });
  if (!doctor) {
    throw new NotFoundException(`Doctor with email ${email} not found`);
  }
  return doctor;
}

 async findByIdForPasswordChange(id: number): Promise<Doctor> {
    const doctor = await this.doctorRepository.findOne({
      where: { id },
      select: ['id', 'password']
    });

    if (!doctor) {
      throw new NotFoundException(`Doctor with ID ${id} not found`);
    }
    return doctor;
  }

  async updatePassword(id: number, newPassword: string): Promise<void> {
    await this.doctorRepository.update(id, { password: newPassword });
  }

  async findAll(): Promise<Doctor[]> {
    return this.doctorRepository.find({
      relations: ['appointments'],
      order: { fullName: 'ASC' }
    });
  }

  async findById(id: number): Promise<Doctor> {
    const doctor = await this.doctorRepository.findOne({
      where: { id },
      relations: ['appointments']
    });

    if (!doctor) {
      throw new NotFoundException(`Doctor with ID ${id} not found`);
    }
    return doctor;
  }

  async deactivate(id: number): Promise<Doctor> {
    const doctor = await this.findById(id);
    doctor.isActive = false;
    return this.doctorRepository.save(doctor);
  }

  async update(id: number, updateDoctorDto: UpdateDoctorDto): Promise<Doctor> {
    const doctor = await this.findById(id);
    Object.assign(doctor, updateDoctorDto);
    return this.doctorRepository.save(doctor);
  }

  async getAppointments(doctorId: number): Promise<Appointment[]> {
    const doctor = await this.doctorRepository.findOne({
      where: { id: doctorId },
      relations: ['appointments'],
      order: { appointments: { date: 'ASC', time: 'ASC',  } }
    });

    if (!doctor) {
      throw new NotFoundException('Doctor not found');
    }
    return doctor.appointments;
  }

  async updateAppointmentStatus(
    doctorId: number,
    appointmentId: number,
    status: string
  ): Promise<Appointment> {
    const doctor = await this.doctorRepository.findOne({
      where: { id: doctorId },
      relations: ['appointments']
    });
    
    if (!doctor) {
      throw new NotFoundException('Doctor not found');
    }

    const appointment = doctor.appointments.find(a => a.id === appointmentId);
    if (!appointment) {
      throw new NotFoundException('Appointment not found for this doctor');
    }

    appointment.status =  status as any;
    return this.doctorRepository.manager.save(appointment);
  }
}