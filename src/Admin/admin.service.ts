import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Admin } from './entities/admin.entity';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AdminsService {
  checkEmailExists(email: string) {
    throw new Error('Method not implemented.');
  }
  findByEmail(email: string) {
      throw new Error('Method not implemented.');
  }
  constructor(
    @InjectRepository(Admin)
    private adminRepository: Repository<Admin>,
  ) {}

  async updateAdmin(
    id: number,
    updateAdminDto: UpdateAdminDto,
  ): Promise<Admin> {
    const admin = await this.adminRepository.findOne({ where: { id } });
    if (!admin) {
      throw new NotFoundException(`Admin with ID ${id} not found`);
    }

    // Hash password if it's being updated
    if (updateAdminDto.password) {
      updateAdminDto.password = await bcrypt.hash(updateAdminDto.password, 10);
    }

    await this.adminRepository.update(id, updateAdminDto);
    const updatedAdmin = await this.adminRepository.findOne({ where: { id } });
    if (!updatedAdmin) {
      throw new NotFoundException(`Admin with ID ${id} not found after update`);
    }
    return updatedAdmin;
  }

  async createAdmin(createAdminDto: CreateAdminDto): Promise<Admin> {
    const existingAdmin = await this.adminRepository.findOne({
      where: { email: createAdminDto.email },
    });

    if (existingAdmin) {
      throw new ConflictException('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(createAdminDto.password, 10);

    const admin = this.adminRepository.create({
      ...createAdminDto,
      password: hashedPassword,
    });

    return this.adminRepository.save(admin);
  }



  async updatePhone(id: number, updateAdminDto: UpdateAdminDto) {
    await this.adminRepository.update(id, { phone: updateAdminDto.phone });
    return this.adminRepository.findOneBy({ id });
  }

  findNullFullNames() {
    return this.adminRepository.find({
      where: { name: IsNull() },
    });
  }

  remove(id: number) {
    return this.adminRepository.delete(id);
  }
}
