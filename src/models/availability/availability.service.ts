import { Repository } from 'typeorm';
import { Availability } from './availability.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class AvailabilityService {
  constructor(
    @InjectRepository(Availability)
    private availabilityRepository: Repository<Availability>,
  ) {}

  /**
   * Gets all the availability records that will be required to schedule content for a user
   */
  async getUpcomingAvailabilities(
    accountId: number,
    time: number,
  ): Promise<any> {
    return '';
  }
}
