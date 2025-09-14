import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  Query,
  UseGuards,
  Req,
  ForbiddenException,
} from '@nestjs/common';
import { AppointmentService } from './appointments.service';
import { CreateAppointmentDto } from './create-appointment.dto';
import { UpdateAppointmentDto } from './update-appointment.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('appointments')
@UseGuards(JwtAuthGuard) // Protect all appointment routes
export class AppointmentController {
  constructor(private readonly appointmentService: AppointmentService) {}

  // ✅ Patients only: Create appointment
  @Post()
  async create(@Req() req, @Body() createAppointmentDto: CreateAppointmentDto) {
    if (req.user.role !== 'patient') {
      throw new ForbiddenException('Only patients can create appointments');
    }
    const patientId = req.user.id; // 👈 patientId from JWT
    return this.appointmentService.create(createAppointmentDto, patientId);
  }

  // ✅ Admin only: Get all appointments
 @Get()
async findAll(@Req() req) {
  // Optional: check if user is admin
  // if (req.user.role !== 'admin') {
  //   throw new ForbiddenException('Only admin can view all appointments');
  // }

  return this.appointmentService.findAll();
}

  @Get(':id')
  async findOne(@Req() req, @Param('id') id: string) {
    const appointment = await this.appointmentService.findById(+id);

    if (
      req.user.role === 'patient' &&
      appointment.patient.id !== req.user.sub
    ) {
      throw new ForbiddenException('You can only view your own appointments');
    }

    if (
      req.user.role === 'doctor' &&
      appointment.doctor.id !== req.user.sub
    ) {
      throw new ForbiddenException('You can only view your own appointments');
    }
    return appointment;
  }

  @Patch(':id')
  async update(
    @Req() req,
    @Param('id') id: string,
    @Body() updateAppointmentDto: UpdateAppointmentDto,
  ) {
    // Optional: Allow only doctors/admins to update status
    if (req.user.role === 'patient') {
      throw new ForbiddenException('Patients cannot update appointments');
    }
    return this.appointmentService.update(+id, updateAppointmentDto);
  }

  @Delete(':id')
  async remove(@Req() req, @Param('id') id: string) {
    // Optional: Only admin can delete
    if (req.user.role !== 'admin') {
      throw new ForbiddenException('Only admin can delete appointments');
    }
    return this.appointmentService.remove(+id);
  }

  // ✅ Patients: Get their appointments
  // ✅ Doctors: Get their appointments
  @Get('my/list')
  async getMyAppointments(@Req() req) {
    if (req.user.role === 'patient') {
      return this.appointmentService.getPatientAppointments(req.user.sub);
    }
    if (req.user.role === 'doctor') {
      return this.appointmentService.findByDoctor(req.user.sub);
    }
    throw new ForbiddenException('Not allowed');
  }
}
