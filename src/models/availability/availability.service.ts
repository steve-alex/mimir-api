import { Repository } from 'typeorm';
import { Availability } from './availability.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Account } from '../accounts/account.entity';

@Injectable()
export class AvailabilityService {
  constructor(
    @InjectRepository(Availability)
    private availabilityRepository: Repository<Availability>,
    @InjectRepository(Account)
    private accountRepository: Repository<Account>,
  ) {}

  async get(accountId: number): Promise<any> {
    return this.availabilityRepository.find({
      where: {
        account: {
          id: accountId,
        },
        deleted: false,
      },
    });
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

  async getParsedAvailabilities(accountId: number): Promise<any> {
    const availabilities = await this.get(accountId);

    const sortedAvailabilities = availabilities.sort((a, b) => {
      // sort in ascending order of days
      if (a.day_of_week !== b.day_of_week) {
        return a.day_of_week - b.day_of_week;
      }
      // if the days are the same, sort in ascending order of time
      return a.start_time.localeCompare(b.start_time);
    });

    const parsedAvailabilities = [];

    const currentDate = new Date();

    for (let i = 0; i < 14; i++) {
      const currentDayOfWeek = currentDate.getDay();

      for (const availability of sortedAvailabilities) {
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

  private parseDateTime(time: string, dayOfWeek: number): any {
    const dateTime = new Date();
    dateTime.setHours(parseInt(time.slice(0, 2)));
    dateTime.setMinutes(parseInt(time.slice(3, 5)));
    dateTime.setSeconds(parseInt(time.slice(6, 8)));
    dateTime.setDate(dateTime.getDate() + dayOfWeek);
    return dateTime;
  }
}
