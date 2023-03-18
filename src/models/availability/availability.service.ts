import { Repository } from 'typeorm';
import { Availability } from './availability.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AvailabilityDTO } from './availability.type';
import { TimeSlot } from '../../types/types';

@Injectable()
export class AvailabilityService {
  constructor(
    @InjectRepository(Availability)
    private availabilityRepository: Repository<Availability>,
  ) {}

  async create(details: AvailabilityDTO): Promise<AvailabilityDTO> {
    const insert = {
      day_of_week: details.dayOfWeek,
      start_time: details.startTime,
      end_time: details.endTime,
      deleted: false,
      account: { id: details.accountId },
    };

    const response = await this.availabilityRepository
      .createQueryBuilder()
      .insert()
      .into(Availability)
      .values(insert)
      .execute();

    return this.encodeAvailability(response.raw[0]);
  }

  async list(details: AvailabilityDTO): Promise<AvailabilityDTO[]> {
    const where: any = {};

    if (details?.accountId) {
      where.account = {};
      where.account.id = details.accountId;
    }
    if (details?.deleted === false || details?.deleted === true)
      where.deleted = details.deleted;

    const availabilities = await this.availabilityRepository.find({ where });

    return availabilities.map((a) => this.encodeAvailability(a));
  }

  async update(details: AvailabilityDTO): Promise<AvailabilityDTO> {
    const updatedAvailability = new Availability();
    updatedAvailability.id = details.id;
    if (details?.deleted) updatedAvailability.deleted = details.deleted;
    if (details?.dayOfWeek) updatedAvailability.day_of_week = details.dayOfWeek;
    if (details?.startTime) updatedAvailability.start_time = details.startTime;
    if (details?.endTime) updatedAvailability.end_time = details.endTime;

    const queryResult = await this.availabilityRepository
      .createQueryBuilder()
      .update(Availability)
      .set(updatedAvailability)
      .where('id = :id', { id: details.id })
      .returning('*')
      .execute();

    return this.encodeAvailability(queryResult.raw[0]);
  }

  async delete(availabilityId: number): Promise<void> {
    await this.availabilityRepository
      .createQueryBuilder()
      .delete()
      .where('id = :availabilityId', { availabilityId })
      .execute();
  }

  /**
   * Takes the user's availabilities and returns all the available timeslots for the upcoming n days
   */
  async getUpcomingAvailableTimeSlots(accountId: number): Promise<TimeSlot[]> {
    const rawAvailabilities = await this.list({ accountId, deleted: false });

    // TODO - test that this actually works, I think the condition needs to be comprehensive
    if (!rawAvailabilities.length)
      throw new Error('User has no availabilities set');

    const sortedRawAvailabilities =
      this.sortAvailabilitiesByDate(rawAvailabilities);

    // TODO - get the days ahead from the user
    return this.getUpcomingTimeSlotsForNDays(sortedRawAvailabilities, 14);
  }

  /**
   * Sorts the availabilities by ascending order of time
   */
  private sortAvailabilitiesByDate(
    availabilities: AvailabilityDTO[],
  ): AvailabilityDTO[] {
    return availabilities.sort((a, b) => {
      // sort in ascending order of days
      if (a.dayOfWeek !== b.dayOfWeek) {
        return Number(a.dayOfWeek) - Number(b.dayOfWeek);
      }
      // if the days are the same, sort in ascending order of time
      return a.startTime.localeCompare(b.startTime);
    });
  }

  /**
   * Takes the availabilities and returns the upcoming n days worth of time slots
   */
  private getUpcomingTimeSlotsForNDays(
    availabilities: AvailabilityDTO[],
    days: number,
  ): TimeSlot[] {
    const parsedAvailabilities = [];
    const currentDate = new Date();

    for (let i = 0; i < days; i++) {
      const currentDayOfWeek = currentDate.getDay();

      for (const availability of availabilities) {
        const { dayOfWeek, startTime, endTime } = availability;

        if (dayOfWeek === currentDayOfWeek.toString()) {
          const startDateTime = this.parseDateTime(startTime, i);
          const endDateTime = this.parseDateTime(endTime, i);

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

  private encodeAvailability(availability: Availability): AvailabilityDTO {
    return Object.assign(
      {},
      availability.id && { id: availability.id },
      availability.deleted && { deleted: availability.deleted },
      availability.day_of_week && { dayOfWeek: availability.day_of_week },
      availability.start_time && { startTime: availability.start_time },
      availability.end_time && { endTime: availability.end_time },
    );
  }
}
