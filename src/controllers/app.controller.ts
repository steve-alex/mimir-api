import { Controller, Get, UseFilters } from '@nestjs/common';
import { AppService } from '../services/app.service';
import { AllExceptionsFilter } from '../shared/exceptions';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
