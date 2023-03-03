import {
  Controller,
  Get,
  Post,
  HttpCode,
  Param,
  Body,
  UseFilters,
  HttpStatus,
  Put,
  Delete,
} from '@nestjs/common';
import { AccountService } from './account.service';
import { AllExceptionsFilter } from '../../shared/exceptions';
import { Response } from '../../types/types';
import { AccountDTO, CreatAccountDTO, UpdateAccountDTO } from './account.type';

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

  @UseFilters(AllExceptionsFilter)
  @Put()
  @HttpCode(200)
  async updateAccount(
    @Body() user: UpdateAccountDTO,
  ): Promise<Response<AccountDTO>> {
    const account = await this.accountService.updateAccount(user);
    return {
      statusCode: HttpStatus.OK,
      message: 'Account successfully updated',
      data: account,
    };
  }

  @UseFilters(AllExceptionsFilter)
  @Delete()
  @HttpCode(200)
  async deleteAccount(@Body() user: AccountDTO): Promise<Response<AccountDTO>> {
    const account = await this.accountService.deleteAccount(user);
    return {
      statusCode: HttpStatus.OK,
      message: 'Account successfully updated',
      data: account,
    };
  }
}
