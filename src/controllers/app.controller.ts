import { Controller, Get, UseFilters } from '@nestjs/common';
import { AppService } from '../services/app.service';
import { AllExceptionsFilter } from '../shared/exceptions';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @UseFilters(AllExceptionsFilter)
  @Get()
  getHello(): string {
    try {
      return this.appService.getHello();
    } catch (error) {
      throw error;
    }
  }
}
