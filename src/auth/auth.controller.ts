import { Body, Controller, Get, Post, Request, UseGuards } from "@nestjs/common"
import { LocalAuthGuard } from "./local-auth.guard"
import { Public, ResponseMessage } from "src/decorator/customize"
import { AuthService } from "./auth.service"
import { RegisterUserDto } from "src/users/dto/create-user.dto"


@Controller("auth")
export class AuthController {
    constructor(
        private authService: AuthService
    ) { }

    @UseGuards(LocalAuthGuard)
    @Public()
    @Post('login')
    handleLogin(@Request() req) {
        return this.authService.login(req.user)
    }

    @Public()
    @Post('register')
    @ResponseMessage("Register a new user")
    handleRegister(@Body() registerDto: RegisterUserDto) {
        return this.authService.register(registerDto)
    }

    // @UseGuards(JwtAuthGuard)

    @Get('Profile')
    getProfile(@Request() req) {
        return req.user
    }

    // @UseGuards(JwtAuthGuard)
    @Get('Profile1')
    getProfile1(@Request() req) {
        return req.user
    }
}
