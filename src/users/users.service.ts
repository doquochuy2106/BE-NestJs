import { BadRequestException, Injectable, Query } from '@nestjs/common';
import { CreateUserDto, RegisterUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User as UserM, UserDocument } from './schemas/user.schema';
import mongoose, { Model } from 'mongoose';
import { genSaltSync, hashSync, compareSync } from "bcryptjs";
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { IUsers } from './users.interface';
import { User } from 'src/decorator/customize';
import aqp from 'api-query-params';


@Injectable()
export class UsersService {

  constructor(@InjectModel(UserM.name) private userModel: SoftDeleteModel<UserDocument>) { }

  getHashPassWord = (password: string) => {
    const salt = genSaltSync(10);
    const hash = hashSync(password, salt);
    return hash
  }

  async create(createUserDTO: CreateUserDto, user: IUsers) {

    let isExistEmail = this.userModel.findOne({ email: createUserDTO.email })
    if (!isExistEmail) {
      throw new BadRequestException("`Email: ${registerDto.email} đã tồn tại trên hệ thống! `")
    }

    const hasPassWord = this.getHashPassWord(createUserDTO.password)

    let newUser = await this.userModel.create({
      name: createUserDTO.name,
      email: createUserDTO.email,
      password: hasPassWord,
      age: createUserDTO.age,
      gender: createUserDTO.gender,
      address: createUserDTO.address,
      company: createUserDTO.company,
      createdBy: {
        _id: user._id,
        email: user.name
      }

    })
    return newUser
  }

  async register(registerDto: RegisterUserDto) {

    const isExistEmail = this.userModel.findOne({ email: registerDto.email })
    if (!isExistEmail) {
      throw new BadRequestException(`Email: ${registerDto.email} đã tồn tại trên hệ thống! `)
    }

    const hasPassWord = this.getHashPassWord(registerDto.password)

    let newRegisterUser = await this.userModel.create({
      name: registerDto.name,
      email: registerDto.email,
      password: hasPassWord,
      age: registerDto.age,
      gender: registerDto.gender,
      address: registerDto.address,
      role: "USER"
    })

    return newRegisterUser
  }

  async findAll(page: number, limit: number, qs: string) {
    const { filter, sort, population } = aqp(qs)
    delete filter.page;
    delete filter.limit

    let offset = (+page - 1) * (+limit)
    let defaultLimit = +limit ? +limit : 10

    const totalItems = (await this.userModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / defaultLimit)

    const result = await this.userModel.find(filter)
      .skip(offset)
      .limit(defaultLimit)
      .sort(sort as any)
      .select("-password")
      .populate(population)
      .exec()

    return {
      meta: {
        current: page,
        pageSize: limit,
        pages: totalPages,
        total: totalItems
      },
      result
    }

  }

  async findOne(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return "not found user"
    }
    let fetchUserById = await this.userModel.findOne({
      _id: id
    }).select("-password")

    return fetchUserById
  }

  async findOneUserByEmail(username: string) {
    return await this.userModel.findOne({
      email: username
    })
  }

  async isvalidPassword(password: string, hashPassword: string) {
    return await compareSync(password, hashPassword);
  }


  async update(updateUserDto: UpdateUserDto, user: IUsers) {
    let updateUser = await this.userModel.updateOne(
      { _id: updateUserDto._id },
      {
        name: updateUserDto.name,
        email: updateUserDto.email,
        age: updateUserDto.age,
        gender: updateUserDto.gender,
        address: updateUserDto.address,
        role: updateUserDto.role,
        company: updateUserDto.company,
        updatedBy: {
          _id: user._id,
          email: user.email
        }
      }
    )
    return updateUser

  }

  async remove(id: string, user: IUsers) {
    await this.userModel.updateOne({ _id: id },
      {
        deletedBy: {
          _id: user._id,
          email: user.email
        }
      }
    )

    return await this.userModel.softDelete({
      _id: id
    })
  }

  updateUserToken = async (refreshToken: string, _id: string) => {
    return await this.userModel.updateOne({
      _id: _id
    },
      { refreshToken: refreshToken })
  }

  findUserByrefreshToken = async (refreshToken: string) => {
    return await this.userModel.findOne({
      refreshToken: refreshToken
    })
  }
}
