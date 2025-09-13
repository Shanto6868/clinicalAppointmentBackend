import {Controller,Get,Post,Body,Param, Patch,Delete,Query, UseGuards } from '@nestjs/common';
import { AppointmentService } from './appointments.service';
import { CreateAppointmentDto } from './create-appointment.dto';
import { UpdateAppointmentDto } from './update-appointment.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('appointments')
@UseGuards(JwtAuthGuard) // Protect all appointment routes
export class AppointmentController {
  constructor(private readonly appointmentService: AppointmentService) {}

  @Post()
  create(@Body() createAppointmentDto: CreateAppointmentDto) {
    return this.appointmentService.create(createAppointmentDto);
  }

  @Get()
  findAll(
    @Query('doctorId') doctorId?: number,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string
  ) {
    if (doctorId && startDate) {
      return this.appointmentService.getDoctorAppointmentsByDate(
        doctorId, 
        new Date(startDate)
      );
    }
    if (doctorId) {
      return this.appointmentService.findByDoctor(doctorId);
    }
    if (startDate && endDate) {
      return this.appointmentService.findByDateRange(
        new Date(startDate), 
        new Date(endDate)
      );
    }
    return this.appointmentService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.appointmentService.findById(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateAppointmentDto: UpdateAppointmentDto
  ) {
    return this.appointmentService.update(+id, updateAppointmentDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.appointmentService.remove(+id);
  }
}