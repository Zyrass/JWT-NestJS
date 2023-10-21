/* eslint-disable prettier/prettier */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { EUserRole } from './user.interface';

export type UserDocument = User & Document;

@Schema({
  collection: 'users',
  timestamps: true,
})
export class User {
  @Prop()
  lastname?: string;

  @Prop()
  firstname?: string;

  @Prop()
  fullname?: string;

  @Prop()
  description?: string;

  @Prop({
    enum: [EUserRole.USER, EUserRole.MODERATOR, EUserRole.ADMIN],
    default: EUserRole.USER,
  })
  role: EUserRole;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop()
  salt: string;

  @Prop()
  age?: number;

  @Prop({
    default: 'France'.toUpperCase(),
  })
  country?: string;

  @Prop({
    default: 'Lyon'.charAt(0).toUpperCase(),
  })
  city?: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
