import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || '$3cr3t',
    });
  }

  async validate(payload: any) {
    return {
      userId: payload.userId,
      companyId: payload.companyId,
      name: payload.userName,
      email: payload.email,
      userName: payload.userName,
      phoneNumber: payload.phoneNumber,
      status: payload.status,
      roleId: payload.roleId,
      roleCode: payload.roleCode,
    };
  }
}
