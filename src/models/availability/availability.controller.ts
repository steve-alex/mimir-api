import {
  Controller,
  Post,
  HttpCode,
  Body,
  UseFilters,
  HttpStatus,
} from '@nestjs/common';
import { AllExceptionsFilter } from '../../shared/exceptions';
import { Response } from '../../types/types';
import { AvailabilityService } from './availability.service';

@Controller('availability')
export class AvailabilityController {
  constructor(private readonly availabilityService: AvailabilityService) {}

  @UseFilters(AllExceptionsFilter)
  @Post()
  @HttpCode(201)
  async createAvailability(@Body() availability: any): Promise<Response<any>> {
    const account = await this.availabilityService.create(availability);
    return {
      statusCode: HttpStatus.OK,
      message: 'Availability successfully created',
      data: account,
    };
  }
}
