import { InjectModel } from '@nestjs/mongoose';
import { Injectable, NotAcceptableException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/user/user.service';
import { pbkdf2Sync } from 'node:crypto';
import { User, UserDocument } from 'src/user/user.model';
import { EUserRole } from 'src/user/user.interface';
import { Model } from 'mongoose';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel('user') private readonly userModel: Model<UserDocument>,
    private readonly userService: UserService,
    private jwtService: JwtService,
  ) {}

  async generateToken(email) {
    const userFound = await this.userService.fetchDataForPayload(email);
    console.log(userFound);

    if (userFound) {
      // création du payload
      const payload = { sub: userFound._id, role: userFound.role };

      return this.jwtService.sign(payload, {
        secret: process.env.JWT_SECRET,
      });
    }

    return null;
  }

  async createUser(
    email: string,
    password: string,
    salt: string,
    firstname: string,
    lastname: string,
    role: EUserRole,
  ): Promise<User> {
    return this.userModel.create({
      email,
      password,
      salt,
      firstname,
      lastname,
      role,
    });
  }

  async validateUserLogin(email: string, password: string): Promise<any> {
    const user = await this.userService.fetchUserByEmail(email);

    if (!user) {
      throw new NotAcceptableException("L'utilisateur n'existe pas!");
    }

    if (await this.verifyPassword(password, user.salt, user.password)) {
      return user;
    } else {
      return null;
    }

    // const currentHash = pbkdf2Sync(
    //   password,
    //   user.salt,
    //   1000,
    //   64,
    //   'sha512',
    // ).toString('hex');
    // console.log(currentHash);

    // const checkValidPassword: boolean = user.password === currentHash;

    // console.log({
    //   validateUserLogin: { user },
    // });

    // Si l'utilisateur existe et que le password existe alors on retourne le user sinon null
    // return user && checkValidPassword ? user : null;
  }

  async verifyPassword(
    currentPassword,
    salt,
    hashedPassword,
  ): Promise<boolean> {
    console.log({
      currentPassword,
      salt,
      hashedPassword,
    });

    const checkHash = pbkdf2Sync(
      currentPassword,
      salt,
      1000,
      64,
      'sha512',
    ).toString('hex');

    console.log({ test: checkHash === hashedPassword });

    return checkHash === hashedPassword;
  }

  async validateUserPayload(payload) {
    if (!payload) {
      return null;
    } else {
      return true;
    }
  }
}
