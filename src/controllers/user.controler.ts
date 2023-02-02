import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  HttpCode,
  Param,
  Body,
  UseFilters,
} from '@nestjs/common';
import { UserService } from '../services/user.service';
import { CreateUserDTO, UpdateUserDTO, UserDTO } from '../types/types';
import { AllExceptionsFilter } from '../shared/exceptions';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseFilters(AllExceptionsFilter)
  @Get(':id')
  @HttpCode(200)
  async getUser(@Param() params): Promise<UserDTO> {
    try {
      return this.userService.getUser(params.id);
    } catch (error) {
      throw error;
    }
  }

  @UseFilters(AllExceptionsFilter)
  @Post()
  @HttpCode(201)
  async createUser(@Body() user: CreateUserDTO): Promise<UserDTO> {
    try {
      return this.userService.createUser(user);
    } catch (error) {
      throw error;
    }
  }

  @UseFilters(AllExceptionsFilter)
  @Put()
  @HttpCode(200) // Update this to 204 if no content event response
  async updateUser(@Body() user: UpdateUserDTO): Promise<UserDTO> {
    try {
      return this.userService.updateUser(user);
    } catch (error) {
      throw error;
    }
  }

  @UseFilters(AllExceptionsFilter)
  @Delete(':id')
  @HttpCode(200) // Update this to 204 if no content event response
  async deleteUser(@Param() params): Promise<void> {
    try {
      await this.userService.deleteUser(Number(params.id));
    } catch (error) {
      throw error;
    }
  }
}
