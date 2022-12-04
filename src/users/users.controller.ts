import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import { CreateUserDto } from './dtos/create-user.dto';
import { UpdateUserDto } from './dtos/update-user.dto';
import { UsersService } from './users.service';
import { SerializeInterceptor } from 'src/interceptors/serialize.interceptor';
import { UserDto } from './dtos/user.dto';

@UseInterceptors(new SerializeInterceptor(UserDto))
@Controller('auth')
export class UsersController {
  constructor(private userService: UsersService) {}

  @Post('/signup')
  createUser(@Body() body: CreateUserDto) {
    this.userService.create(body.email, body.password);
  }

  @Get('/:id')
  async findUser(@Param('id') id: string) {
    const user = await this.userService.findOne(parseInt(id));
    if (user) {
      return user;
    }
    throw new NotFoundException(`User [id: ${id}] not found.`);
  }

  @Get()
  findAllUsers(@Query('email') email: string) {
    return this.userService.find(email);
  }

  @Patch('/:id')
  async updateUser(@Param('id') id: string, @Body() body: UpdateUserDto) {
    const user = await this.userService.update(parseInt(id), body);
    if (user) {
      return user;
    }
    throw new NotFoundException(`User [id: ${id}] not found.`);
  }

  @Delete('/:id')
  async removeUser(@Param('id') id: string) {
    const user = await this.userService.remove(parseInt(id));
    if (user) {
      return user;
    }
    throw new NotFoundException(`User [id: ${id}] not found.`);
  }
}
