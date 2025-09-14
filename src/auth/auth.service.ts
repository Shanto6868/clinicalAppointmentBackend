// auth.service.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { DoctorService } from '../doctor/doctor.service';

import * as bcrypt from 'bcrypt';
import { PatientService } from 'src/patient/patient.service';
import { AdminsService } from 'src/admin/admin.service';

@Injectable()
export class AuthService {
  constructor(
    public doctorService: DoctorService,    // ✅ Proper typing
    public patientService: PatientService, // ✅ Proper typing  
    public adminService: AdminsService,    // ✅ Proper typing
    public jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string,  type: 'doctor' | 'patient' | 'admin' = 'patient'): Promise<any> {
    let user: any;
    
    switch (type) {
      case 'doctor':
        user = await this.doctorService.findByEmailForAuth(email);
        break;
      case 'patient':
        user = await this.patientService.findByEmailForAuth(email);
        break;
      case 'admin':
        user = await this.adminService.findByEmailForAuth(email);
        break;
      default:
        return null;
    }
    
    if (user && await bcrypt.compare(password, user.password)) {
      const { password, ...result } = user;
      return { ...result, type };
    }
    return null;
  }

  async login(user: any, type: string) {
    const payload = { 
      email: user.email, 
      sub: user.id,
      username: user.username,
      fullName: user.fullName,
      type: type
    };
    
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        fullName: user.fullName,
        type: type
      }
    };
  }

  // CHANGE PASSWORD FOR DOCTORS ONLY
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