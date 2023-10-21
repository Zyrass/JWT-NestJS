import { Body, Controller, HttpStatus, Post, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserService } from 'src/user/user.service';
import { pbkdf2Sync } from 'crypto';

@Controller()
export class AuthController {
  constructor(
    private readonly autheService: AuthService,
    private readonly userService: UserService,
  ) {}

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
    const userFound = await this.userService.fetchUserByEmail(email);
    const checkUserExist = userFound != null ? true : false;

    if (!checkUserExist) {
      return response.status(HttpStatus.NOT_FOUND).json({
        title: "Echec de l'authentification",
        message: `L'utilisateur avec l'email ${email}, n'existe pas.`,
      });
    }

    const currentHash = pbkdf2Sync(
      password,
      userFound.salt,
      1000,
      64,
      'sha512',
    ).toString('hex');
    const checkValidPassword = userFound.password === currentHash;

    if (!checkValidPassword) {
      return response.status(HttpStatus.UNAUTHORIZED).json({
        title: "Echec de l'authentification",
        message:
          'Vous devez revoir votre authentification, un problème ou plusieurs problèmes ont été rencontré quelque part.',
      });
    } else {
      return response.status(HttpStatus.OK).json({
        title: 'Authentification réussi.',
        message: 'La connexion a réussi avec succès.',
      });
    }
  }
}
