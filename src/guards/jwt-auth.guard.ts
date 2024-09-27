import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { handleReq } from './req-handler.auth';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  public constructor(private readonly reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const authStrategy = request.authStrategy;
    switch (authStrategy) {
      case 'jwt':
        return this.validateJwt(context);
      case 'active-directory':
        return this.validateActiveDirectory(request);
      case 'headerKey':
        return this.validateHeaderKey(request);
      case 'public':
        return true;
      default:
        return false;
    }
  }

  private validateJwt(context: ExecutionContext) {
    return super.canActivate(context);
  }

  private validateActiveDirectory(request): boolean {
    // Implement Active Directory validation logic
    // Placeholder logic, replace with actual validation
    return true;
  }

  private validateHeaderKey(request): boolean {
    // Implement header key validation logic
    // Placeholder logic, replace with actual validation
    return true;
  }

  // handleRequest(err, user, info, context, status) {
  //   return handleReq(err, user, info);
  // }

  handleRequest = handleReq;
}
