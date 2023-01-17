import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  HttpCode,
  Param,
  Body,
} from '@nestjs/common';
import { UserService } from '../services/user.service';
import { CreateUserDTO, UpdateUserDTO } from '../types/types';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get(':id')
  @HttpCode(200)
  getUser(@Param() params): string {
    try {
      return this.userService.getUser(params.id);
    } catch (error) {
      throw new Error(''); // TODO - define error properly
    }
  }

  @Post()
  @HttpCode(201)
  createUser(@Body() user: CreateUserDTO): string {
    try {
      return this.userService.createUser(user);
    } catch (error) {
      throw new Error(''); // TODO - define error properly
    }
  }

  @Put()
  @HttpCode(200) // Update this to 204 if no content event response
  updateUser(@Body() user: UpdateUserDTO): string {
    try {
      return this.userService.updateUser(user);
    } catch (error) {
      throw new Error(''); // TODO - define error properly
    }
  }

  @Delete(':id')
  @HttpCode(200) // Update this to 204 if no content event response
  deleteUser(@Param() params): string {
    try {
      return this.userService.deleteUser(params.id);
    } catch (error) {
      throw new Error(''); // TODO - define error properly
    }
  }
}
