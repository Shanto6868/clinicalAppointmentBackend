import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();

    if (exception instanceof NotFoundException) {
      return response.status(status).json({
        statusCode: status,
        message: 'Resource not found',
        error: exception.message,
      });
    }

    if (exception instanceof ConflictException) {
      return response.status(status).json({
        statusCode: status,
        message: 'Conflict occurred',
        error: exception.message,
      });
    }

    response.status(status).json({
      statusCode: status,
      message: 'An error occurred',
      error: exception.message,
    });
  }
}
