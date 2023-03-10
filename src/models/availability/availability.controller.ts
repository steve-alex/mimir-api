import {
  Controller,
  Post,
  HttpCode,
  Body,
  UseFilters,
  HttpStatus,
  Get,
} from '@nestjs/common';
import { AllExceptionsFilter } from '../../shared/exceptions';
import { Response } from '../../types/types';
import { AvailabilityService } from './availability.service';
import { AvailabilityDTO } from './availability.type';

@Controller('availability')
export class AvailabilityController {
  constructor(private readonly availabilityService: AvailabilityService) {}

  @UseFilters(AllExceptionsFilter)
  @Post()
  @HttpCode(201)
  async createAvailability(
    @Body() availability: AvailabilityDTO,
  ): Promise<Response<AvailabilityDTO>> {
    const account = await this.availabilityService.create(availability);
    return {
      statusCode: HttpStatus.OK,
      message: 'Availability successfully created',
      data: account,
    };
  }

  @UseFilters(AllExceptionsFilter)
  @Get()
  @HttpCode(201)
  async getAvailabilities(): Promise<Response<any>> {
    const accountId = 1;
    const account = await this.availabilityService.list({ accountId });
    return {
      statusCode: HttpStatus.OK,
      message: 'Availabilities successfully retrieved',
      data: account,
    };
  }
}
