import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  Req,
  ForbiddenException,
  UseGuards,
} from '@nestjs/common';
import { AppointmentService } from './appointments.service';
import { CreateAppointmentDto } from './create-appointment.dto';
import { UpdateAppointmentDto } from './update-appointment.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('appointments')
@UseGuards(JwtAuthGuard)
export class AppointmentController {
  constructor(private readonly appointmentService: AppointmentService) {}

  // Patients only: create appointment
  @Post()
  async create(@Req() req, @Body() createAppointmentDto: CreateAppointmentDto) {
    if (req.user.role !== 'patient') {
      throw new ForbiddenException('Only patients can create appointments');
    }
    const patientId = Number(req.user.id); // use sub from JWT
    return this.appointmentService.create(createAppointmentDto, patientId);
  }

  // Admin only: get all appointments
  @Get()
  async findAll(@Req() req) {
    // if (req.user.role !== 'admin') {
    //   throw new ForbiddenException('Only admin can view all appointments');
    // }
    // optionally pass admin id if you want to limit to a specific admin: this.appointmentService.findAll(req.user.sub)
    return this.appointmentService.findAll();
  }

  // Get one appointment (role-based access)
  @Get(':id')
  async findOne(@Req() req, @Param('id') id: string) {
    const appointment = await this.appointmentService.findById(+id);

    // Patient: can view only their own
    if (req.user.role === 'patient' && appointment.patient.id !== Number(req.user.sub)) {
      throw new ForbiddenException('You can only view your own appointments');
    }

    // Doctor: can view only their own
    if (req.user.role === 'doctor' && appointment.doctor.id !== Number(req.user.sub)) {
      throw new ForbiddenException('You can only view your own appointments');
    }

    return appointment;
  }

  // Update appointment:
  // - Patient: can update their own
  // - Doctor: can update their own
  // - Admin: can update any
  @Patch(':id')
  async update(
    @Req() req,
    @Param('id') id: string,
    @Body() updateAppointmentDto: UpdateAppointmentDto,
  ) {
    const appointment = await this.appointmentService.findById(+id);

  
    // Admin: allowed for any appointment
    return this.appointmentService.update(+id, updateAppointmentDto);
  }

  // Delete appointment:
  // - Patient: can delete their own
  // - Admin: can delete any
  // - Doctor: not allowed to delete
  @Delete(':id')
  async remove(@Req() req, @Param('id') id: string) {
    const appointment = await this.appointmentService.findById(+id);

 

   
      return this.appointmentService.remove(+id);
    

    // Otherwise forbid
    throw new ForbiddenException('Not allowed to delete this appointment');
  }

  // Get "my" appointments (patient or doctor)
  @Get('my/list')
  async getMyAppointments(@Req() req) {
    if (req.user.role === 'patient') {
      return this.appointmentService.getPatientAppointments(Number(req.user.sub));
    }
    if (req.user.role === 'doctor') {
      return this.appointmentService.findByDoctor(Number(req.user.sub));
    }
    throw new ForbiddenException('Not allowed');
  }
}
