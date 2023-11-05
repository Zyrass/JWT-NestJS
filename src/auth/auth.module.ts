import { MongooseModule } from '@nestjs/mongoose';
import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { UserService } from 'src/user/user.service';
import { JwtStrategy } from './jwt/jwt.strategy';
import { UserSchema } from 'src/user/user.model';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: {
        expiresIn: '1d',
        algorithm: 'HS256',
      },
    }),
    MongooseModule.forFeature([
      { name: 'user', schema: UserSchema, collection: 'users' },
    ]),
  ],
  controllers: [AuthController],
  providers: [AuthService, UserService, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
