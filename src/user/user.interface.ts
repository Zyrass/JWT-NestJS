/* eslint-disable prettier/prettier */
import { Document } from 'mongoose';

export enum EUserRole {
  USER = 'user',
  MODERATOR = 'moderator',
  ADMIN = 'admin',
}

export interface IUser extends Document {
  readonly lastname?: string;
  readonly firstname?: string;
  readonly fullname?: string;
  readonly description?: string;
  readonly role: EUserRole;
  readonly email: string;
  readonly password: string;
  readonly salt: string;
  readonly age?: number;
  readonly country?: string;
  readonly city?: string;
}
