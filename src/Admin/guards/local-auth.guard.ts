import {
  Injectable,
  UnauthorizedException,
  ExecutionContext,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { RateLimiterMemory } from 'rate-limiter-flexible';
import { AuthService } from 'src/auth/auth.service';

@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {
  private rateLimiter = new RateLimiterMemory({
    points: 5, // 5 attempts
    duration: 60 * 15, // 15 minutes
  });

  constructor(private readonly authService: AuthService) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const ip = request.ip ?? 'unknown-ip';

    try {
      // Rate limiting check
      await this.rateLimiter.consume(ip);

      // Validate credentials
      const user = await this.authService.validateUser(
        request.body.email,
        request.body.password,
      );

      if (!user) {
        throw new UnauthorizedException('Invalid credentials');
      }

      // Check if account is locked
      if (user.failedLoginAttempts >= 5) {
        throw new UnauthorizedException('Account temporarily locked');
      }

      // Attach user to request
      request.user = user;
      return true;
    } catch (rateLimiterRes) {
      if (rateLimiterRes instanceof Error) {
        throw new UnauthorizedException(
          'Too many login attempts. Try again later',
        );
      }
      throw rateLimiterRes;
    }
  }

  handleRequest(err: any, user: any, info: any) {
    if (err || !user) {
      throw err || new UnauthorizedException('Authentication failed');
    }
    return user;
  }
}
