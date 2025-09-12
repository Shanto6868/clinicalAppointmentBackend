import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';
import { CreateAdminDto } from '../dto/create-admin.dto';
import { UpdateAdminDto } from '../dto/update-admin.dto';

@Injectable()
export class AdminValidationPipe implements PipeTransform {
  transform(value: any) {
    const dtoClass = this.getDtoClass(value);
    if (!dtoClass) {
      throw new BadRequestException('Unsupported DTO type');
    }
    return value;
  }

  private getDtoClass(value: any) {
    // Check for CreateAdminDto properties
    if (
      value &&
      typeof value === 'object' &&
      'name' in value &&
      'email' in value
    ) {
      return CreateAdminDto;
    }
    // Check for UpdateAdminDto properties
    if (value && typeof value === 'object' && 'phone' in value) {
      return UpdateAdminDto;
    }
    return null;
  }
}
