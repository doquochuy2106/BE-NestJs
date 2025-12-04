import { Controller, Get, Post, Request, UseGuards } from "@nestjs/common"
import { LocalAuthGuard } from "./local-auth.guard"
import { Public } from "src/decorator/customize"
import { AuthService } from "./auth.service"


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
