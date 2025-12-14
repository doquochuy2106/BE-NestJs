import { Body, Controller, Get, Post, Req, Res, UseGuards } from "@nestjs/common"
import { LocalAuthGuard } from "./local-auth.guard"
import { Public, ResponseMessage, User } from "src/decorator/customize"
import { AuthService } from "./auth.service"
import { RegisterUserDto } from "src/users/dto/create-user.dto"
import { Response, Request } from "express"
import { IUsers } from "src/users/users.interface"


@Controller("auth")
export class AuthController {
    constructor(
        private authService: AuthService
    ) { }

    @UseGuards(LocalAuthGuard)
    @Public()
    @Post('login')
    @ResponseMessage("Login Success!")
    handleLogin(
        @Req() req,
        @Res({ passthrough: true }) response: Response) {
        return this.authService.login(req.user, response)
    }

    @Public()
    @Post('register')
    @ResponseMessage("Register a new user")
    handleRegister(@Body() registerDto: RegisterUserDto) {
        return this.authService.register(registerDto)
    }

    @Get("/account")
    @ResponseMessage("Get account success!")
    getAccount(@User() user: IUsers) {
        return { user }
    }

    @Public()
    @Get("/refresh")
    handleRefreshToken(@Req() request: Request, @Res({ passthrough: true }) response: Response) {
        let refreshToken = request.cookies["refresh_token"]
        return this.authService.processRefreshToken(refreshToken, response)
    }
}
