import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { IUsers } from 'src/users/users.interface';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class AuthService {

    constructor(
        private userService: UsersService,
        private jwtService: JwtService
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
}
