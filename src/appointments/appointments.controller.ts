import {Controller,Post,Get,Delete,Patch,Param,Body,UseGuards,Req,ParseIntPipe,UsePipes,ValidationPipe,} from '@nestjs/common';
import { AppointmentsService } from './appointments.service';
import { CreateAppointmentDto } from './create-appointment.dto';
import { UpdateStatusDto } from './update-status.dto';
import { UpdateReasonDto } from './update-reason.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('appointments')
export class AppointmentsController {
  constructor(private readonly service: AppointmentsService) {}

  // Patient creates appointment (JWT)
  @UseGuards(JwtAuthGuard)
  @Post()
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  create(@Req() req, @Body() dto: CreateAppointmentDto) {
    return this.service.create(req.user.sub, dto);
  }

  // Admin/all view (if you add admin guard later)
  @Get()
  getAll() {
    return this.service.findAll();
  }

  @Get(':id')
  getOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  // Patient-only: update status (e.g., cancel own appointment)
  @UseGuards(JwtAuthGuard)
  @Patch(':id/status')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  updateStatus(
    @Req() req,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateStatusDto,
  ) {
    return this.service.updateStatus(req.user.sub, id, dto);
  }

  // Patient-only: update reason
  @UseGuards(JwtAuthGuard)
  @Patch(':id/reason')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  updateReason(
    @Req() req,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateReasonDto,
  ) {
    return this.service.updateReason(req.user.sub, id, dto);
  }

  // Patient's own list
  @UseGuards(JwtAuthGuard)
  @Get('patient/me')
  myAppointments(@Req() req) {
    return this.service.findByPatient(req.user.sub);
  }

  // Public filter by status (optional: add guard if needed)
  @Get('status/:status')
  getByStatus(@Param('status') status: 'pending' | 'confirmed' | 'cancelled') {
    return this.service.findByStatus(status);
  }

  // Patient-only: delete own
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Req() req, @Param('id', ParseIntPipe) id: number) {
    return this.service.remove(req.user.sub, id);
  }
}
