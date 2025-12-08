import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { IUsers } from 'src/users/users.interface';
import { UsersService } from 'src/users/users.service';
import { genSaltSync, hashSync, compareSync } from "bcryptjs";
import { CreateUserDto, RegisterUserDto } from 'src/users/dto/create-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User } from 'src/decorator/customize';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { UserDocument } from 'src/users/schemas/user.schema';

@Injectable()
export class AuthService {

    constructor(
        private userService: UsersService,
        private jwtService: JwtService,
    ) { }


    async validateUser(username: string, pass: string): Promise<any> {
        let user = await this.userService.findOneUserByEmail(username)
        if (user) {
            let isValidPassword = await this.userService.isvalidPassword(pass, user.password)
            if (isValidPassword === true) {
                return user
            }
        }
        return null
    }

    async login(user: IUsers) {

        const { _id, name, email, role } = user

        const payload = {
            sub: 'token login',
            iss: 'from server',
            _id: _id,
            name: name,
            email: email,
            role: role
        };
        return {
            access_token: this.jwtService.sign(payload),
            _id,
            name,
            email,
            role
        };
    }

    getHashPassWord = (password: string) => {
        const salt = genSaltSync(10);
        const hash = hashSync(password, salt);
        return hash
    }

    async register(registerDto: RegisterUserDto) {
        let RegisterUser = await this.userService.register(registerDto)

        return ({
            _id: RegisterUser?._id,
            createdAt: RegisterUser?.createdAt
        })
    }
}
