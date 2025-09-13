import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { DoctorService } from '../doctor/doctor.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private doctorService: DoctorService,
    private jwtService: JwtService,
  ) {}

  async validateDoctor(email: string, password: string): Promise<any> {
    const doctor = await this.doctorService.findByEmailForAuth(email);
    
    if (doctor && await bcrypt.compare(password, doctor.password)) {
      const { password, ...result } = doctor;
      return result;
    }
    return null;
  }

  async login(doctor: any) {
    const payload = { 
      email: doctor.email, 
      sub: doctor.id,
      username: doctor.username,
      fullName: doctor.fullName
    };
    
    return {
      access_token: this.jwtService.sign(payload),
      doctor: {
        id: doctor.id,
        email: doctor.email,
        username: doctor.username,
        fullName: doctor.fullName
      }
    };
  }

  async changePassword(doctorId: number, currentPassword: string, newPassword: string): Promise<boolean> {
    const doctor = await this.doctorService.findByIdForPasswordChange(doctorId);
    
    if (!doctor) {
      throw new UnauthorizedException('Doctor not found');
    }
    
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, doctor.password);
    
    if (!isCurrentPasswordValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }
    
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    await this.doctorService.updatePassword(doctorId, hashedNewPassword);
    
    return true;
  } 
}