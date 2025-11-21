import { Controller, Get } from "@nestjs/common";

@Controller('user')
export class UserController {
    @Get("doquochuy")
    findAll(): string {
        return "doquochuy get"
    }

    @Get("doquochuy1")
    findById(): string {
        return "doquochuy delete"
    }
}