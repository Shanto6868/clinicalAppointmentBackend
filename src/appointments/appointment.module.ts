import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Appointment } from './appointment.entity';
import { AppointmentService } from './appointments.service';
import { AppointmentController } from './appointments.controller';
import { DoctorModule } from '../doctor/doctor.module';
import { Patient } from '../patient/patient.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Appointment, Patient]), // ✅ Register both
    DoctorModule,
  ],
  controllers: [AppointmentController],
  providers: [AppointmentService],
  exports: [AppointmentService],
})
export class AppointmentModule {}
