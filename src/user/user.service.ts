import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { UserDocument } from './user.model';
import { Model } from 'mongoose';

@Injectable()
export class UserService {
  constructor(
    @InjectModel('user') private readonly userModel: Model<UserDocument>,
  ) {}

  async fetchUser(query: object) {
    return this.userModel.findOne(query);
  }

  async fetchAllUsers() {
    return this.userModel.find();
  }

  async fetchUserByID(userID: string) {
    return this.userModel.findOne({ _id: userID });
  }

  async fetchUserByEmail(email: string) {
    return this.userModel.findOne({ email: email });
  }

  async fetchDataForPayload(email: string) {
    return this.userModel.findOne({ email: email }).select('_id');
  }

  async fetchUserBydIdForDeleted(id: string) {
    return this.userModel.findByIdAndRemove(id);
  }
}
