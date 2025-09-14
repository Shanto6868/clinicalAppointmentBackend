import {
  Injectable,
  NotFoundException,
  ConflictException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Admin } from './entities/admin.entity';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import * as bcrypt from 'bcrypt';
import { Doctor } from '../doctor/doctor.entity';
import { Patient } from '../patient/patient.entity';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AdminsService {
  constructor(
    @InjectRepository(Admin)
    private adminRepository: Repository<Admin>,
    @InjectRepository(Doctor)
    private doctorRepository: Repository<Doctor>,
    @InjectRepository(Patient)
    private patientRepository: Repository<Patient>,
    private jwtService: JwtService,
  ) {}

  // Admin Authentication Methods
  async login(email: string, password: string) {
    const admin = await this.findByEmailForAuth(email);
    
    const match = await bcrypt.compare(password, admin.password);
    if (!match) {
      throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED);
    }

    const token = await this.jwtService.signAsync({
      sub: admin.id,
      role: 'admin',
      email: admin.email,
    });

    const { password: _, ...safeAdmin } = admin;
    return { access_token: token, user: safeAdmin };
  }

  logout() {
    return { success: true, message: 'Admin logged out successfully' };
  }

  async changePassword(id: number, currentPassword: string, newPassword: string) {
    const admin = await this.adminRepository.findOne({ 
      where: { id },
      select: ['id', 'password']
    });
    
    if (!admin) {
      throw new NotFoundException('Admin not found');
    }

    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, admin.password);
    if (!isCurrentPasswordValid) {
      throw new HttpException('Current password is incorrect', HttpStatus.BAD_REQUEST);
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    admin.password = hashedNewPassword;

    await this.adminRepository.save(admin);

    return { success: true, message: 'Password changed successfully' };
  }

  async findByEmailForAuth(email: string): Promise<Admin> {
    const admin = await this.adminRepository.findOne({
      where: { email },
      select: ['id', 'email', 'password', 'name'],
    });
    if (!admin) {
      throw new NotFoundException(`Admin with email ${email} not found`);
    }
    return admin;
  }

  // Admin Management Methods
  async findById(id: number): Promise<Admin> {
    const admin = await this.adminRepository.findOne({
      where: { id },
      relations: ['appointments']
    });

    if (!admin) {
      throw new NotFoundException(`Admin with ID ${id} not found`);
    }
    return admin;
  }

  async updateAdmin(id: number, updateAdminDto: UpdateAdminDto): Promise<Admin> {
    const admin = await this.adminRepository.findOne({ where: { id } });
    if (!admin) {
      throw new NotFoundException(`Admin with ID ${id} not found`);
    }

    if (updateAdminDto.password) {
      updateAdminDto.password = await bcrypt.hash(updateAdminDto.password, 10);
    }

    await this.adminRepository.update(id, updateAdminDto);
    const updatedAdmin = await this.adminRepository.findOne({ where: { id } });
    if (!updatedAdmin) {
      throw new NotFoundException(`Admin with ID ${id} not found after update`);
    }
    return updatedAdmin;
  }

  async createAdmin(createAdminDto: CreateAdminDto): Promise<Admin> {
    const existingAdmin = await this.adminRepository.findOne({
      where: { email: createAdminDto.email },
    });

    if (existingAdmin) {
      throw new ConflictException('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(createAdminDto.password, 10);

    const admin = this.adminRepository.create({
      ...createAdminDto,
      password: hashedPassword,
    });

    return this.adminRepository.save(admin);
  }

  async updatePhone(id: number, updateAdminDto: UpdateAdminDto) {
    await this.adminRepository.update(id, { phone: updateAdminDto.phone });
    return this.adminRepository.findOneBy({ id });
  }

  findNullFullNames() {
    return this.adminRepository.find({
      where: { name: IsNull() },
    });
  }

  remove(id: number) {
    return this.adminRepository.delete(id);
  }

  // Patient Management Methods
  async getAllPatients() {
    return this.patientRepository.find();
  }

  async getPatientById(id: number) {
    const patient = await this.patientRepository.findOne({ where: { id } });
    if (!patient) {
      throw new NotFoundException(`Patient with ID ${id} not found`);
    }
    return patient;
  }

  async getInactivePatients() {
    return this.patientRepository.find({ where: { status: 'inactive' } });
  }

  async getPatientsOlderThan(age: number) {
    return this.patientRepository
      .createQueryBuilder('patient')
      .where('patient.age > :age', { age })
      .getMany();
  }

  async updatePatientStatus(id: number, status: 'active' | 'inactive') {
    const patient = await this.patientRepository.findOne({ where: { id } });
    if (!patient) {
      throw new NotFoundException(`Patient with ID ${id} not found`);
    }
    patient.status = status;
    return this.patientRepository.save(patient);
  }

  async deletePatient(id: number) {
    const result = await this.patientRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Patient with ID ${id} not found`);
    }
    return { message: 'Patient deleted successfully' };
  }

  // Doctor Management Methods
  async getAllDoctors() {
    return this.doctorRepository.find({
      relations: ['appointments'],
      order: { fullName: 'ASC' }
    });
  }

  async getDoctorById(id: number) {
    const doctor = await this.doctorRepository.findOne({
      where: { id },
      relations: ['appointments']
    });
    if (!doctor) {
      throw new NotFoundException(`Doctor with ID ${id} not found`);
    }
    return doctor;
  }

  async getDoctorAppointments(id: number) {
    const doctor = await this.doctorRepository.findOne({
      where: { id },
      relations: ['appointments'],
      order: { appointments: { date: 'ASC', time: 'ASC' } }
    });
    if (!doctor) {
      throw new NotFoundException('Doctor not found');
    }
    return doctor.appointments;
  }

  async updateDoctorAppointmentStatus(doctorId: number, appointmentId: number, status: string) {
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

    appointment.status = status as any;
    return this.doctorRepository.manager.save(appointment);
  }

  async updateDoctorStatus(id: number, isActive: boolean): Promise<Doctor> {
    const doctor = await this.doctorRepository.findOne({ where: { id } });
    if (!doctor) {
      throw new NotFoundException(`Doctor with ID ${id} not found`);
    }

    doctor.isActive = isActive;
    return this.doctorRepository.save(doctor);
  }

  async getDoctorCount(): Promise<number> {
    return await this.doctorRepository.count();
  }

  async getDoctorSpecializationStats(): Promise<{ [key: string]: number }> {
    const doctors = await this.doctorRepository.find();
    const stats: { [key: string]: number } = {};

    doctors.forEach(doctor => {
      const spec = doctor.specialization || 'Unknown';
      stats[spec] = (stats[spec] || 0) + 1;
    });

    return stats;
  }

  async getInactiveDoctors(): Promise<Doctor[]> {
    return await this.doctorRepository.find({ 
      where: { isActive: false },
      relations: ['appointments']
    });
  }

  // Patient Statistics Methods
  async getPatientCount(): Promise<number> {
    return await this.patientRepository.count();
  }

  async getPatientStatusStats(): Promise<{ active: number; inactive: number }> {
    const [active, inactive] = await Promise.all([
      this.patientRepository.count({ where: { status: 'active' } }),
      this.patientRepository.count({ where: { status: 'inactive' } }),
    ]);
    
    return { active, inactive };
  }

  async getAgeDistribution(): Promise<{ [key: string]: number }> {
    const patients = await this.patientRepository.find();
    const distribution = {
      '0-18': patients.filter(p => p.age <= 18).length,
      '19-35': patients.filter(p => p.age > 18 && p.age <= 35).length,
      '36-50': patients.filter(p => p.age > 35 && p.age <= 50).length,
      '51+': patients.filter(p => p.age > 50).length,
    };
    
    return distribution;
  }

  // Dashboard Overview
  async getDashboardOverview(): Promise<any> {
    const [
      totalPatients,
      totalDoctors,
      activePatients,
      activeDoctors,
      patientStatusStats,
      doctorSpecializationStats,
    ] = await Promise.all([
      this.getPatientCount(),
      this.getDoctorCount(),
      this.patientRepository.count({ where: { status: 'active' } }),
      this.doctorRepository.count({ where: { isActive: true } }),
      this.getPatientStatusStats(),
      this.getDoctorSpecializationStats(),
    ]);

    return {
      totals: {
        patients: totalPatients,
        doctors: totalDoctors,
        activePatients,
        activeDoctors,
      },
      patientStatus: patientStatusStats,
      doctorSpecializations: doctorSpecializationStats,
    };
  }

  // Utility Methods
  async checkEmailExists(email: string): Promise<boolean> {
    const admin = await this.adminRepository.findOne({
      where: { email },
    });
    return !!admin;
  }

  async findByEmail(email: string): Promise<Admin | null> {
    return await this.adminRepository.findOne({
      where: { email },
    });
  }
}