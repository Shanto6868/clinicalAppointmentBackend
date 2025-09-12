import { ParseFilePipe, MaxFileSizeValidator, FileTypeValidator } from '@nestjs/common';

export class UploadImageDto {
  image: Express.Multer.File;

  static validateFile() {
    return new ParseFilePipe({
      validators: [
        new MaxFileSizeValidator({ maxSize: 2 * 1024 * 1024 }), // 2MB
        new FileTypeValidator({ fileType: /(jpg|jpeg|png)$/ }),
      ],
    });
  }
}
