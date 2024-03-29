import {
  Controller,
  Post,
  HttpCode,
  Body,
  UseFilters,
  HttpStatus,
  Get,
  Put,
  Delete,
  Param,
} from '@nestjs/common';
import { AllExceptionsFilter } from '../../shared/exceptions';
import { Response } from '../../types/types';
import { AvailabilityService } from './availability.service';
import { AvailabilityDTO, CreateAvailabilityDTO } from './availability.type';

@Controller('availability')
export class AvailabilityController {
  constructor(private readonly availabilityService: AvailabilityService) {}

  @UseFilters(AllExceptionsFilter)
  @Post()
  @HttpCode(201)
  async createAvailability(
    @Body() body: AvailabilityDTO,
  ): Promise<Response<CreateAvailabilityDTO>> {
    const { availability, idsToDelete } = await this.availabilityService.create(
      body,
    );
    return {
      statusCode: HttpStatus.OK,
      message: 'Availability successfully created',
      data: { availability, idsToDelete },
    };
  }

  @UseFilters(AllExceptionsFilter)
  @Get()
  @HttpCode(201)
  async getAvailabilities(): Promise<Response<AvailabilityDTO[]>> {
    // TODO move this to account?
    const accountId = 1; // TODO revert to dynamic value
    const availability = await this.availabilityService.list({
      accountId,
      deleted: false,
    });
    return {
      statusCode: HttpStatus.OK,
      message: 'Availabilities successfully retrieved',
      data: availability,
    };
  }

  @UseFilters(AllExceptionsFilter)
  @Put()
  @HttpCode(201)
  async updateAvailability(
    body: AvailabilityDTO,
  ): Promise<Response<AvailabilityDTO>> {
    const availability = await this.availabilityService.update(body);
    return {
      statusCode: HttpStatus.OK,
      message: 'Availabilities successfully updated',
      data: availability,
    };
  }

  @UseFilters(AllExceptionsFilter)
  @Delete(':id')
  @HttpCode(204)
  async deleteAvailability(
    @Param('id') availabilityId: number,
  ): Promise<Response<null>> {
    console.log('availabilityId =>', availabilityId);
    await this.availabilityService.delete(availabilityId);
    return {
      statusCode: HttpStatus.OK,
      message: 'Availabilities successfully deleted',
      data: null,
    };
  }
}
