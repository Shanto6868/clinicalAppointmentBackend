import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { Appointment } from './appointment.entity';
import { CreateAppointmentDto } from './create-appointment.dto';
import { UpdateStatusDto } from './update-status.dto';
import { UpdateReasonDto } from './update-reason.dto';

@Injectable()
export class AppointmentsService {
  constructor(
    @InjectRepository(Appointment)
    private readonly repo: Repository<Appointment>,
  ) {}

  private ensureFuture(dateTimeISO: string) {
    const dt = new Date(dateTimeISO);
    if (Number.isNaN(dt.getTime())) {
      throw new HttpException('Invalid dateTime', HttpStatus.BAD_REQUEST);
    }
    const now = new Date();
    if (dt.getTime() <= now.getTime()) {
      throw new HttpException(
        'Appointment dateTime must be in the future',
        HttpStatus.BAD_REQUEST,
      );
    }
    return dt;
  }

  async create(patientId: number, dto: CreateAppointmentDto) {
    const dt = this.ensureFuture(dto.dateTime);
    const entity = this.repo.create({
      patientId,
      dateTime: dt,
      reason: dto.reason,
      status: dto.status ?? 'pending',
    });
    return this.repo.save(entity);
  }

  async findAll() {
    return this.repo.find();
  }

  async findOne(id: number) {
    const appt = await this.repo.findOne({ where: { id } });
    if (!appt) {
      throw new HttpException('Appointment not found', HttpStatus.NOT_FOUND);
    }
    return appt;
  }

  async findByPatient(patientId: number) {
    return this.repo.find({ where: { patientId } });
  }

  async findByStatus(status: 'pending' | 'confirmed' | 'cancelled') {
    return this.repo.find({ where: { status } });
  }

  async findOlderThan(date: Date) {
    return this.repo.find({ where: { dateTime: MoreThan(date) } });
  }

  async updateStatus(patientId: number, id: number, dto: UpdateStatusDto) {
    const appt = await this.repo.findOne({ where: { id, patientId } });
    if (!appt) {
      throw new HttpException('Not found or not permitted', HttpStatus.NOT_FOUND);
    }
    appt.status = dto.status;
    return this.repo.save(appt);
  }

  async updateReason(patientId: number, id: number, dto: UpdateReasonDto) {
    const appt = await this.repo.findOne({ where: { id, patientId } });
    if (!appt) {
      throw new HttpException('Not found or not permitted', HttpStatus.NOT_FOUND);
    }
    appt.reason = dto.reason;
    return this.repo.save(appt);
  }

  async remove(patientId: number, id: number) {
    const appt = await this.repo.findOne({ where: { id, patientId } });
    if (!appt) {
      throw new HttpException('Not found or not permitted', HttpStatus.NOT_FOUND);
    }
    await this.repo.delete(id);
    return { message: 'Appointment deleted' };
  }
}
