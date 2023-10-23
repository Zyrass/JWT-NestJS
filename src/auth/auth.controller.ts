import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Body, Controller, HttpStatus, Post, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserService } from 'src/user/user.service';
import { pbkdf2Sync, randomBytes } from 'crypto';
import { Model } from 'mongoose';
import { UserDocument } from 'src/user/user.model';

@Controller()
export class AuthController {
  constructor(
    private readonly autheService: AuthService,
    private readonly userService: UserService,
    private readonly configService: ConfigService,
    @InjectModel('user') private readonly userModel: Model<UserDocument>,
  ) {}

  @Post('signup')
  async signup(@Res() response, @Body() body) {
    const { email, password } = body;

    if (email === undefined || password === undefined) {
      return response.status(HttpStatus.UNPROCESSABLE_ENTITY).json({
        title: "Echec de l'authentification",
        message:
          'Veuillez contrôler votre saisie, celle-ci ne respecte pas la syntaxe attendu.',
      });
    }

    if (email === '' || password === '') {
      return response.status(HttpStatus.BAD_REQUEST).json({
        title: "Echec de l'authentification",
        message: 'Tous les champs sont obligatoire.',
      });
    }

    if (email === '' && password != null) {
      return response.status(HttpStatus.BAD_REQUEST).json({
        title: "Echec de l'authentification",
        message: 'Vous devez saisir un email',
      });
    }

    if (password === '' && email != null) {
      return response.status(HttpStatus.BAD_REQUEST).json({
        title: "Echec de l'authentification",
        message: 'Vous devez saisir un mot de passe',
      });
    }

    // Contrôle de l'existance de l'utilisateur selon l'email saisit
    const userFound = await this.userService.fetchUserByEmail(email);
    const checkUserExist = userFound != null ? true : false;

    if (checkUserExist) {
      return response.status(HttpStatus.CONFLICT).json({
        title: 'Echec.',
        message: `L'utilisateur avec l'email ${email}, existe déjà dans la base de donnée.`,
      });
    }

    const createdSalt = randomBytes(16).toString('hex');
    const hashedUserPassword = pbkdf2Sync(
      password,
      createdSalt,
      1000,
      64,
      'sha512',
    ).toString('hex');

    const createdUser = new this.userModel({
      email: email,
      password: hashedUserPassword,
      salt: createdSalt,
    });
    // console.log(createdUser);

    if (createdUser) {
      createdUser.save();
      return response.status(HttpStatus.CREATED).json({
        title: 'Succès.',
        message: 'Le nouvel utilisateur a été créé avec succès.',
        data: createdUser,
      });
    }
  }

  @Post('login')
  async login(@Res() response, @Body() body) {
    const { email, password } = body;

    if (email === undefined || password === undefined) {
      return response.status(HttpStatus.UNPROCESSABLE_ENTITY).json({
        title: "Echec de l'authentification",
        message:
          'Veuillez contrôler votre saisie, celle-ci ne respecte pas la syntaxe attendu.',
      });
    }

    if (email === '' || password === '') {
      return response.status(HttpStatus.BAD_REQUEST).json({
        title: "Echec de l'authentification",
        message: 'Tous les champs sont obligatoire.',
      });
    }

    if (email === '' && password != null) {
      return response.status(HttpStatus.BAD_REQUEST).json({
        title: "Echec de l'authentification",
        message: 'Vous devez saisir un email',
      });
    }

    if (password === '' && email != null) {
      return response.status(HttpStatus.BAD_REQUEST).json({
        title: "Echec de l'authentification",
        message: 'Vous devez saisir un mot de passe',
      });
    }

    // Contrôle de l'existance de l'utilisateur selon l'email saisit
    const userFound = await this.userService.fetchUser({ email: email });
    const checkUserExist = userFound != null ? true : false;

    if (!checkUserExist) {
      return response.status(HttpStatus.NOT_FOUND).json({
        title: "Echec de l'authentification",
        message: `L'utilisateur avec l'email ${email}, n'existe pas.`,
      });
    }

    const saltOfUserFound = userFound.salt;
    const rewrintingHash = pbkdf2Sync(
      password,
      saltOfUserFound,
      1000,
      64,
      'sha512',
    ).toString('hex');

    // console.log({
    //   userFound,
    //   password,
    //   hashed: userFound.password,
    //   saltOfUserFound,
    //   rewrintingHash,
    // });

    const checkPasswordIsValide = rewrintingHash === userFound.password;
    console.log({ checkPasswordIsValide });

    if (!checkPasswordIsValide) {
      return response.status(HttpStatus.UNAUTHORIZED).json({
        title: "Echec de l'authentification",
        message:
          'Vous devez revoir votre authentification, un problème ou plusieurs problèmes ont été rencontré quelque part.',
      });
    }

    const token = await this.autheService.generateToken(email);

    return response.status(HttpStatus.OK).json({
      title: 'Authentification réussi.',
      message: 'La connexion a réussi avec succès.',
      token,
    });
  }
}
