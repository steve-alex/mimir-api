import { Repository } from 'typeorm';
import { Availability } from './availability.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Account } from '../accounts/account.entity';
import { IAvailability } from './availability.type';
import { TimeSlot } from '../../types/types';

@Injectable()
export class AvailabilityService {
  constructor(
    @InjectRepository(Availability)
    private availabilityRepository: Repository<Availability>,
    @InjectRepository(Account)
    private accountRepository: Repository<Account>,
  ) {}

  async get(details: IAvailability): Promise<Availability[]> {
    const where: any = {};

    // TODO - update this with more parameters
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
   * Takes the user's availabilities and returns all the available timeslots for the upcoming n days
   */
  async getUpcomingAvailableTimeSlots(accountId: number): Promise<TimeSlot[]> {
    const rawAvailabilities = await this.get({ accountId, deleted: false });
    // TODO - get the days ahead you want to schedule and pass it to getParsedUpcomingAvailabilities

    // TODO - test that this actually works, I think the condition needs to be comprehensive
    if (!rawAvailabilities.length) return [];

    const sortedRawAvailabilities =
      this.sortAvailabilitiesByDate(rawAvailabilities);

    return this.getUpcomingTimeSlots(sortedRawAvailabilities);
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
   * Takes the availabilities and returns the upcoming n days worth of time slots
   */
  private getUpcomingTimeSlots(availabilities: Availability[]): TimeSlot[] {
    const parsedAvailabilities = [];
    const currentDate = new Date();

    // TODO - use n days
    for (let i = 0; i < 14; i++) {
      const currentDayOfWeek = currentDate.getDay();

      for (const availability of availabilities) {
        // TODO - convert to camelCase? We'd need to encode availability when it's retrieved
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
   * Takes a time, and and a day offset and creates a new DateTime
   */
  private parseDateTime(time: string, offset: number): Date {
    // TODO - triple check this logic, backwards and forwards!
    const dateTime = new Date();
    dateTime.setHours(parseInt(time.slice(0, 2)));
    dateTime.setMinutes(parseInt(time.slice(3, 5)));
    dateTime.setSeconds(parseInt(time.slice(6, 8)));
    dateTime.setDate(dateTime.getDate() + offset);
    return dateTime;
  }
}
