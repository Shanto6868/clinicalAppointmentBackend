import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DoctorService } from './doctor.service';
import { DoctorController } from './doctor.controller';
import { Doctor } from './doctor.entity';
import { Appointment } from '../appointments/appointment.entity';
//import { AuthModule } from '../auth/auth.module';



@Module({
  imports: [
    TypeOrmModule.forFeature([Doctor, Appointment]),
    //AuthModule
  ],
  controllers: [DoctorController],
  providers: [DoctorService],
  exports: [DoctorService]
})
export class DoctorModule {}