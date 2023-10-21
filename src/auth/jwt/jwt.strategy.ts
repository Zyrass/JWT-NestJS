/* eslint-disable prettier/prettier */
import { ConfigService } from '@nestjs/config';
import { AuthService } from './../auth.service';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtPayload } from 'jsonwebtoken';
import { Request } from 'express';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get('JWT_SECRET'),
      passReqToCallback: true,
      usernameField: 'email',
      passwordField: 'password',
    });
  }

  async validate(data: any, password: string): Promise<any> {
    const baseUrl = 'http://localhost:3000';
    const request: Request = data;
    const currentUrl = `${baseUrl}${request.url}`;

    let user;
    if (currentUrl === `${baseUrl}/api/v1/login`) {
      const email: string = data;
      user = await this.authService.validateUserLogin(email, password);
    } else {
      const payload: JwtPayload = data;
      user = await this.authService.validateUserPayload(payload);
    }

    console.log({ user });

    if (!user) {
      throw new UnauthorizedException();
    }

    return user;
  }
}
