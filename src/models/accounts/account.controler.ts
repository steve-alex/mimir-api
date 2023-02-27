import {
  Controller,
  Get,
  Post,
  HttpCode,
  Param,
  Body,
  UseFilters,
} from '@nestjs/common';
import { AccountService } from './account.service';
import { CreateUserDTO, UserDTO } from '../../types/types';
import { AllExceptionsFilter } from '../../shared/exceptions';

@Controller('account')
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  @UseFilters(AllExceptionsFilter)
  @Get(':id')
  @HttpCode(200)
  async getAccount(@Param() params): Promise<UserDTO> {
    try {
      return this.accountService.getAccount(params.id);
    } catch (error) {
      throw error;
    }
  }

  @UseFilters(AllExceptionsFilter)
  @Post()
  @HttpCode(201)
  async createAccount(@Body() user: CreateUserDTO): Promise<UserDTO> {
    try {
      return this.accountService.createAccount(user);
    } catch (error) {
      throw error;
    }
  }

  // @UseFilters(AllExceptionsFilter)
  // @Put()
  // @HttpCode(200) // Update this to 204 if no content event response
  // async updateUser(@Body() user: UpdateUserDTO): Promise<UserDTO> {
  //   try {
  //     return this.accountService.updateUser(user);
  //   } catch (error) {
  //     throw error;
  //   }
  // }

  // @UseFilters(AllExceptionsFilter)
  // @Delete(':id')
  // @HttpCode(200) // Update this to 204 if no content event response
  // async deleteUser(@Param() params): Promise<void> {
  //   try {
  //     await this.accountService.deleteUser(Number(params.id));
  //   } catch (error) {
  //     throw error;
  //   }
  // }
}
