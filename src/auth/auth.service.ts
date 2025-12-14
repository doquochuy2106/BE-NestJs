import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { response } from 'express';
import { RegisterUserDto } from 'src/users/dto/create-user.dto';
import { IUsers } from 'src/users/users.interface';
import { UsersService } from 'src/users/users.service';
import { Response } from "express"
import ms from 'ms';


@Injectable()
export class AuthService {

    constructor(
        private userService: UsersService,
        private jwtService: JwtService,
        private configService: ConfigService,
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

    async login(user: IUsers, response: Response) {

        const { _id, name, email, role } = user

        const payload = {
            sub: 'token login',
            iss: 'from server',
            _id: _id,
            name: name,
            email: email,
            role: role
        };

        let refresh_token = this.createRefreshToken(payload)

        //update user with refreshtoken
        await this.userService.updateUserToken(refresh_token, _id)

        response.cookie('refresh_token', refresh_token, {
            httpOnly: true,
            maxAge: ms(this.configService.get<string>("JWT_REFRESH_TOKEN_SECRET_EXPIRES"))
        })


        return {
            access_token: this.jwtService.sign(payload),
            // refresh_token,
            user: {
                _id,
                name,
                email,
                role
            }
        };
    }

    async register(registerDto: RegisterUserDto) {
        let RegisterUser = await this.userService.register(registerDto)

        return ({
            _id: RegisterUser?._id,
            createdAt: RegisterUser?.createdAt
        })
    }

    createRefreshToken = (payload: any) => {
        let refreshToken = this.jwtService.sign(payload, {
            secret: this.configService.get<string>("JWT_REFRESH_TOKEN_SECRET"),
            expiresIn: ms(this.configService.get<string>("JWT_REFRESH_TOKEN_SECRET_EXPIRES"))
        })

        return refreshToken
    }

    processRefreshToken = async (refreshToken: string, response: Response) => {
        try {
            await this.jwtService.verify(refreshToken, {
                secret: this.configService.get<string>("JWT_REFRESH_TOKEN_SECRET")
            })

            //todo
            let user = await this.userService.findUserByrefreshToken(refreshToken)
            console.log("check user: ", user)
            if (user) {
                const { _id, name, email, role } = user

                const payload = {
                    sub: 'token refresh',
                    iss: 'from server',
                    _id: _id,
                    name: name,
                    email: email,
                    role: role
                };

                let refresh_token = this.createRefreshToken(payload)

                //update user with refreshtoken
                await this.userService.updateUserToken(refresh_token, _id.toString())


                //set refresh_token as cookies
                response.clearCookie("refresh_token")

                response.cookie('refresh_token', refresh_token, {
                    httpOnly: true,
                    maxAge: ms(this.configService.get<string>("JWT_REFRESH_TOKEN_SECRET_EXPIRES"))
                })


                return {
                    access_token: this.jwtService.sign(payload),
                    refresh_token,
                    user: {
                        _id,
                        name,
                        email,
                        role
                    }
                };
            }
            else {
                throw new BadRequestException("Refresh Token đã hết hạn")
            }

        } catch (error) {
            throw new BadRequestException("Refresh Token đã hết hạn")
        }

    }
}
