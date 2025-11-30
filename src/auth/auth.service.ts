import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
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

    async login(user: any) {
        const payload = {
            username: user.email,
            sub: user._id
        };
        return {
            access_token: this.jwtService.sign(payload),
        };
    }
}
