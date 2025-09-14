import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminController } from './admin.controller';
import { AdminsService } from './admin.service';
import { Admin } from './entities/admin.entity';
import { AuthModule } from 'src/auth/auth.module';
import { PatientModule } from 'src/patient/patient.module';
import { DoctorModule } from 'src/doctor/doctor.module';
import { Doctor } from 'src/doctor/doctor.entity';
import { Patient } from 'src/patient/patient.entity';


@Module({
  imports: [
    TypeOrmModule.forFeature([Admin,Doctor, Patient]),
    AuthModule,
    PatientModule,
    DoctorModule // 👈 gives access to JwtService, Passport strategies, etc.
  ],
  controllers: [AdminController],
  providers: [AdminsService],
  exports: [AdminsService],
})
export class AdminModule {}
