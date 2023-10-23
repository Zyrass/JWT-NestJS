import {
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Res,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @UseGuards(AuthGuard('jwt'))
  async getUsers() {
    return this.userService.fetchAllUsers();
  }

  @Get(':id')
  @UseGuards(AuthGuard('jwt'))
  async getUserByID(@Param('id') userID: string) {
    return this.userService.fetchUserByID(userID);
  }

  @Delete(':id')
  async deleteUserByID(@Param('id') userID: string, @Res() response) {
    const userFound = await this.userService.fetchUserByID(userID);
    if (!userFound) {
      // ECHEC SUPPRESSION
      return response.status(HttpStatus.NOT_FOUND).json({
        title: 'Echec.',
        message:
          "La suppression de l'utilisateur a échoué, cet utilisateur n'existe pas",
      });
    } else {
      const userHasBeenDeleted =
        await this.userService.fetchUserBydIdForDeleted(userID);
      return response.status(HttpStatus.OK).json({
        title: 'Succès.',
        message: "La suppression de l'utilisateur a réussi.",
        userDeleted: userHasBeenDeleted,
      });
    }
  }
}
