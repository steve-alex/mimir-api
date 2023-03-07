import { Repository } from 'typeorm';
import { Availability } from './availability.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Account } from '../accounts/account.entity';
import { AvailabilityDTO, IAvailability } from './availability.type';

@Injectable()
export class AvailabilityService {
  constructor(
    @InjectRepository(Availability)
    private availabilityRepository: Repository<Availability>,
    @InjectRepository(Account)
    private accountRepository: Repository<Account>,
  ) {}

  async get(details: IAvailability): Promise<Availability[]> {
    console.log(
      '🚀 ~ file: availability.service.ts:18 ~ AvailabilityService ~ get ~ details:',
      details,
    );
    const where: any = {};

    if (details?.accountId) {
      where.account = {};
      where.account.id = details.accountId;
    }
    if (details?.deleted === false || details?.deleted === true)
      where.deleted = details.deleted;

    return this.availabilityRepository.find({ where });
  }

  async create(details: any) {
    const account = await this.accountRepository.findOne({
      where: {
        id: details.accountId,
      },
    });

    const parsedDetails = {
      day_of_week: details.dayOfWeek,
      start_time: details.startTime,
      end_time: details.endTime,
      deleted: false,
      account,
    };

    await this.availabilityRepository.insert(parsedDetails);
  }

  /**
   * Get the upcoming 2 weeks worth of availabilities
   */
  async getUpcomingAvailabilities(
    accountId: number,
  ): Promise<AvailabilityDTO[]> {
    const rawAvailabilities = await this.get({ accountId, deleted: false });

    const sortedRawAvailabilities =
      this.sortAvailabilitiesByDate(rawAvailabilities);

    return this.getParsedUpcomingAvailabilities(sortedRawAvailabilities);
  }

  /**
   * Sorts the availabilities by ascending order of time
   */
  private sortAvailabilitiesByDate(
    availabilities: Availability[],
  ): Availability[] {
    return availabilities.sort((a, b) => {
      // sort in ascending order of days
      if (a.day_of_week !== b.day_of_week) {
        return Number(a.day_of_week) - Number(b.day_of_week);
      }
      // if the days are the same, sort in ascending order of time
      return a.start_time.localeCompare(b.start_time);
    });
  }

  /**
   * Takes the availabilities and returns the upcoming 2 weeks worth of parsed availabilities
   */
  private getParsedUpcomingAvailabilities(
    availabilities: Availability[],
  ): AvailabilityDTO[] {
    const parsedAvailabilities = [];
    const currentDate = new Date();

    for (let i = 0; i < 14; i++) {
      const currentDayOfWeek = currentDate.getDay();

      for (const availability of availabilities) {
        const { day_of_week, start_time, end_time } = availability;

        if (day_of_week === currentDayOfWeek.toString()) {
          const startDateTime = this.parseDateTime(start_time, i);
          const endDateTime = this.parseDateTime(end_time, i);

          parsedAvailabilities.push({
            start: startDateTime,
            end: endDateTime,
          });
        }
      }

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return parsedAvailabilities;
  }

  /**
   * Takes a time, and and a day off set and creates a new DateTime with that time day
   */
  private parseDateTime(time: string, offset: number): Date {
    const dateTime = new Date();
    dateTime.setHours(parseInt(time.slice(0, 2)));
    dateTime.setMinutes(parseInt(time.slice(3, 5)));
    dateTime.setSeconds(parseInt(time.slice(6, 8)));
    dateTime.setDate(dateTime.getDate() + offset);
    return dateTime;
  }
}
