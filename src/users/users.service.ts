import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './schemas/user.schema';
import mongoose, { Model } from 'mongoose';
import { genSaltSync, hashSync, compareSync } from "bcryptjs";

@Injectable()
export class UsersService {

  constructor(@InjectModel(User.name) private userModel: Model<User>) { }

  getHashPassWord = (password: string) => {
    const salt = genSaltSync(10);
    const hash = hashSync(password, salt);
    return hash
  }

  async create(createUserDTO: CreateUserDto) {
    const hasPassWord = this.getHashPassWord(createUserDTO.password)

    let user = await this.userModel.create({
      email: createUserDTO.email,
      password: hasPassWord,
      name: createUserDTO.name
    })

    return user

  }


  findAll() {
    return `This action returns all users`;
  }

  async findOne(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return "not found user"
    }
    return await this.userModel.findById({
      _id: id
    })
  }

  async findOneUserByEmail(username: string) {
    return await this.userModel.findOne({
      email: username
    })
  }

  async isvalidPassword(password: string, hashPassword: string) {
    return await compareSync(password, hashPassword);
  }


  async update(updateUserDto: UpdateUserDto) {
    let userUpdate = await this.userModel.updateOne({ _id: updateUserDto._id }, { ...updateUserDto })
    return userUpdate

  }

  async remove(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return 'not found user'
    }
    return await this.userModel.deleteOne({
      _id: id
    })
  }
}
