import {
  Controller,
  Get,
  Post,
  HttpCode,
  Param,
  Body,
  UseFilters,
  HttpStatus,
} from '@nestjs/common';
import { AccountService } from './account.service';
import { AllExceptionsFilter } from '../../shared/exceptions';
import { Response } from '../../types/types';
import { AccountDTO, CreatAccountDTO } from './account.type';

@Controller('account')
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  @UseFilters(AllExceptionsFilter)
  @Get(':id')
  @HttpCode(200)
  async getAccount(@Param() params): Promise<Response<AccountDTO>> {
    const account = await this.accountService.getAccount(params.id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Account successfully found',
      data: account,
    };
  }

  @UseFilters(AllExceptionsFilter)
  @Post()
  @HttpCode(201)
  async createAccount(
    @Body() user: CreatAccountDTO,
  ): Promise<Response<AccountDTO>> {
    const account = await this.accountService.createAccount(user);
    return {
      statusCode: HttpStatus.OK,
      message: 'Account successfully created',
      data: account,
    };
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
