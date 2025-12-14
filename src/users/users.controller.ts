import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { IUsers } from './users.interface';
import { Public, ResponseMessage, User } from 'src/decorator/customize';


@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @Post()
  @ResponseMessage("Create a new User Success!")
  create(@Body() createUserDTO: CreateUserDto, @User() user: IUsers) {
    let UserNew = this.usersService.create(createUserDTO, user);

    return {
      _id: UserNew,
      createdAt: UserNew
    }
  }


  @Get()
  findAll(
    @Query("page") page: string,
    @Query("limit") limit: string,
    @Query() qs: string
  ) {
    return this.usersService.findAll(+page, +limit, qs);
  }

  @Public()
  @Get(':id')
  @ResponseMessage("Fetch User By Id")
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch()
  @ResponseMessage("Update a User success!")
  update(@Body() updateUserDto: UpdateUserDto, @User() user: IUsers) {
    let updatedUser = this.usersService.update(updateUserDto, user);
    return updatedUser
  }

  @Delete(':id')
  @ResponseMessage("Delete a User success!")
  remove(@Param('id') id: string, @User() user: IUsers) {
    return this.usersService.remove(id, user);
  }
}
