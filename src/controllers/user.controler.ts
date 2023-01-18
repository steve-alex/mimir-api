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
import { CreateUserDTO, UpdateUserDTO, UserDTO } from '../types/types';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get(':id')
  @HttpCode(200)
  async getUser(@Param() params): Promise<UserDTO> {
    try {
      return this.userService.getUser(params.id);
    } catch (error) {
      throw new Error(''); // TODO - define error properly
    }
  }

  @Post()
  @HttpCode(201)
  async createUser(@Body() user: CreateUserDTO): Promise<UserDTO> {
    try {
      return this.userService.createUser(user);
    } catch (error) {
      throw new Error(''); // TODO - define error properly
    }
  }

  @Put()
  @HttpCode(200) // Update this to 204 if no content event response
  async updateUser(@Body() user: UpdateUserDTO): Promise<UserDTO> {
    try {
      return this.userService.updateUser(user);
    } catch (error) {
      throw new Error(''); // TODO - define error properly
    }
  }

  @Delete(':id')
  @HttpCode(200) // Update this to 204 if no content event response
  async deleteUser(@Param() params): Promise<void> {
    try {
      await this.userService.deleteUser(Number(params.id));
    } catch (error) {
      throw new Error(''); // TODO - define error properly
    }
  }
}
