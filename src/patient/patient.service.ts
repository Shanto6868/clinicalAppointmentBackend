import {
  Injectable,
  HttpException,
  HttpStatus,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Patient } from './patient.entity';
import { CreatePatientDto } from './add-patient.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { ChangePasswordDto } from './change-password-patient.dto';

@Injectable()
export class PatientService {
  findByEmail(email: string) {
    throw new Error('Method not implemented.');
  }
  constructor(
    @InjectRepository(Patient) private repo: Repository<Patient>,
    private jwtService: JwtService,
  ) {}



    async findById(id: number): Promise<Patient> {
      const patient = await this.repo.findOne({
        where: { id },
        relations: ['appointments']
      });
  
      if (!patient) {
        throw new NotFoundException(`Patient with ID ${id} not found`);
      }
      return patient;
    }


  async findByEmailForAuth(email: string): Promise<Patient> {
    const patient = await this.repo.findOne({
      where: { email },
      select: ['id', 'email', 'password', 'fullName'],
    });
    if (!patient) {
      throw new NotFoundException(`Doctor with email ${email} not found`);
    }
    return patient;
  }
  // Register patient with optional image
  async register(dto: CreatePatientDto, imageFilename?: string) {
    const exists = await this.repo.findOne({ where: { email: dto.email } });
    if (exists)
      throw new HttpException('Email already exists', HttpStatus.BAD_REQUEST);

    const hashed = await bcrypt.hash(dto.password, 10);
    const patient = this.repo.create({
      ...dto,
      password: hashed,
      image: imageFilename ?? null,
    });

    const saved = await this.repo.save(patient);
    const { password, ...safe } = saved;
    return safe;
  }

  // Login
  async login(email: string, password: string) {
    const patient = await this.repo.findOne({ where: { email } });
    if (!patient)
      throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED);

    const match = await bcrypt.compare(password, patient.password);
    if (!match)
      throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED);

    const token = await this.jwtService.signAsync({
      sub: patient.id,
      role: 'patient',
    });
    const { password: _, ...safe } = patient;
    return { access_token: token, user: safe };
  }

  // Logout (dummy version)
  logout() {
    // In real apps: implement blacklist here
    return { success: true, message: `Patient logged out successfully` };
  }

  // Change Password
  async changePassword(id: number, dto: ChangePasswordDto) {
    const patient = await this.repo.findOne({ where: { id } });
    if (!patient)
      throw new HttpException('Patient not found', HttpStatus.NOT_FOUND);

    const isMatch = await bcrypt.compare(dto.currentPassword, patient.password);
    if (!isMatch) {
      throw new HttpException(
        'Current password is incorrect',
        HttpStatus.BAD_REQUEST,
      );
    }

    patient.password = await bcrypt.hash(dto.newPassword, 10);
    await this.repo.save(patient);

    return { success: true, message: 'Password changed successfully' };
  }

  // Get all
  getAllPatients() {
    return this.repo.find();
  }

  // Get by ID
  async getPatientById(id: number) {
    const patient = await this.repo.findOne({ where: { id } });
    if (!patient)
      throw new HttpException('Patient not found', HttpStatus.NOT_FOUND);
    
    // Remove password from returned data
    const { password, ...patientWithoutPassword } = patient;
    return patientWithoutPassword;
  }

  // Update status
  async updateStatus(id: number, status: 'active' | 'inactive') {
    const patient = await this.repo.findOne({ where: { id } });
    if (!patient)
      throw new HttpException('Patient not found', HttpStatus.NOT_FOUND);
    patient.status = status;
    return this.repo.save(patient);
  }

  // Get inactive
  getInactivePatients() {
    return this.repo.find({ where: { status: 'inactive' } });
  }

  // Get older than X
  getPatientsOlderThan(age: number) {
    return this.repo
      .createQueryBuilder('patient')
      .where('patient.age > :age', { age })
      .getMany();
  }

  // Delete
  async deletePatient(id: number) {
    const result = await this.repo.delete(id);
    if (result.affected === 0)
      throw new HttpException('Patient not found', HttpStatus.NOT_FOUND);
    return { message: 'Patient deleted successfully' };
  }

  // Update Patient
  async updatePatient(
    id: number,
    dto: Partial<CreatePatientDto>,
    imageFilename?: string,
  ) {
    const patient = await this.repo.findOne({ where: { id } });
    if (!patient)
      throw new HttpException('Patient not found', HttpStatus.NOT_FOUND);

    // Check if email is being changed and if it already exists
    if (dto.email && dto.email !== patient.email) {
      const existingPatient = await this.repo.findOne({ where: { email: dto.email } });
      if (existingPatient && existingPatient.id !== id) {
        throw new HttpException('Email already exists', HttpStatus.BAD_REQUEST);
      }
    }

    if (dto.password) {
      dto.password = await bcrypt.hash(dto.password, 10);
    }

    if (imageFilename) {
      patient.image = imageFilename;
    }

    Object.assign(patient, dto);
    const updatedPatient = await this.repo.save(patient);
    
    // Remove password from returned data
    const { password, ...patientWithoutPassword } = updatedPatient;
    return patientWithoutPassword;
  }
}