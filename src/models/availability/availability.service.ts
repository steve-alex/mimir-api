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
    console.log(
      '🚀 ~ file: availability.service.ts:16 ~ AvailabilityService ~ create ~ details:',
      details,
    );
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

    return this.sortAvailabilitiesByDate(
      availabilities.map((a) => this.encodeAvailability(a)),
    );
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

  async removeEventsFromAvailabilitiesAndHydrateWithTime(
    availabilities: TimeSlot[],
    events: TimeSlot[],
  ): Promise<TimeSlot[]> {
    const completeAvailabilities = this.removeEventsFromAvailabilities(
      availabilities,
      events,
    );
    const availabilitiesWithTime = this.addTimeToAvailabilities(
      completeAvailabilities,
    );
    return availabilitiesWithTime;
  }

  /**
   *Takes an array of availabilities and then modifies it by removing the overlapping events;
   */
  private removeEventsFromAvailabilities(
    availabilities: TimeSlot[],
    events: TimeSlot[],
  ): TimeSlot[] {
    if (!events.length) return availabilities;

    const updatedAvailabilities = [...availabilities];
    const overlappingEventArray = this.mergeOverlappingEvents(
      availabilities,
      events,
    );

    for (const event of overlappingEventArray) {
      const eventStart = new Date(event.start);
      const eventEnd = new Date(event.end);

      const overlappingAvailability = availabilities.filter((a) => {
        const { start, end } = a;
        const availabilityStart = new Date(start);
        const availabilityEnd = new Date(end);

        if (eventStart < availabilityEnd && eventEnd > availabilityStart) {
          return true;
        }
        return false;
      });

      for (const availability of overlappingAvailability) {
        const availabilityStart = new Date(availability.start);
        const availabilityEnd = new Date(availability.end);
        let availabilityModified = false;

        if (eventStart <= availabilityStart && eventEnd >= availabilityEnd) {
          // The timeslot completely contains the availability, so remove the availability
          availabilityModified = true;
        } else if (eventStart <= availabilityStart) {
          // The timeslot overlaps with the beginning of the availability, so adjust the start time
          updatedAvailabilities.push({
            start: eventEnd,
            end: availabilityEnd,
          });
          availabilityModified = true;
        } else if (eventEnd >= availabilityEnd) {
          // The timeslot overlaps with the end of the availability, so adjust the end time
          updatedAvailabilities.push({
            start: availabilityStart,
            end: eventStart,
          });
          availabilityModified = true;
        } else {
          // The timeslot is in the middle of the availability, so split it into two availabilities
          const newAvailability1 = {
            start: availabilityStart,
            end: eventStart,
          };
          const newAvailability2 = {
            start: eventEnd,
            end: availabilityEnd,
          };
          updatedAvailabilities.push(newAvailability1, newAvailability2);
          availabilityModified = true;
        }

        const availabilityIndex = updatedAvailabilities.findIndex((item) => {
          return (
            item.start === availability.start && item.end === availability.end
          );
        });

        if (availabilityModified && availabilityIndex >= 0) {
          updatedAvailabilities.splice(availabilityIndex, 1);
        }
      }
    }

    return updatedAvailabilities;
  }

  /**
   * Returns an array of timeslots with overlapping events merged together
   */
  private mergeOverlappingEvents(
    availabilities: TimeSlot[],
    events: TimeSlot[],
  ): TimeSlot[] {
    const overlappingEvents = this.getOverlappingEvents(availabilities, events);

    if (!overlappingEvents || overlappingEvents.length <= 1)
      return overlappingEvents;

    overlappingEvents.sort((a, b) => Number(a.start) - Number(b.start));

    const mergedEvents = [];
    let current = overlappingEvents[0];

    for (let i = 1; i < overlappingEvents.length; i++) {
      const next = overlappingEvents[i];

      if (next.start <= current.end) {
        // the next interval overlaps with the current interval, so merge them
        current.end = new Date(
          Math.max(current.end.getTime(), next.end.getTime()),
        );
      } else {
        // the next interval does not overlap with the current interval, so add the current interval to the merged intervals array
        mergedEvents.push(current);
        current = next;
      }
    }

    // add the last interval to the merged intervals array
    mergedEvents.push(current);

    return mergedEvents;
  }

  private getOverlappingEvents(
    availabilities: TimeSlot[],
    events: TimeSlot[],
  ): TimeSlot[] {
    const overlappingEventsArray = [];

    for (const availability of availabilities) {
      const availabilityStart = new Date(availability.start);
      const availabilityEnd = new Date(availability.end);
      const overlappingEvents = [];

      // 1: Check if any of the events overlap with the availability;
      for (const event of events) {
        // Check if the timeslot overlaps with the availability
        const eventStart = new Date(event.start);
        const eventEnd = new Date(event.end);

        if (eventStart < availabilityEnd && eventEnd > availabilityStart) {
          // Check if event overlaps the availability in any way
          overlappingEvents.push({
            start: eventStart,
            end: eventEnd,
          });
        }
      }

      overlappingEventsArray.push(overlappingEvents);
    }

    return overlappingEventsArray;
  }

  /**
   * Add the time in minutes to each availability
   */
  addTimeToAvailabilities(availabilities: TimeSlot[]): TimeSlot[] {
    return availabilities.map((a) => {
      return {
        ...a,
        time: getMinuteDifference(a.end, a.start),
      };
    });

    function getMinuteDifference(end: Date, start: Date): number {
      const timeDiff = Math.abs(end.getTime() - start.getTime());
      return Math.floor(timeDiff / 60000);
    }
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
      availability.day_of_week && {
        dayOfWeek: this.mapDayOfWeek(availability.day_of_week),
      },
      availability.start_time && { startTime: availability.start_time },
      availability.end_time && { endTime: availability.end_time },
    );
  }

  private mapDayOfWeek(dayOfWeek: string): string {
    if (dayOfWeek === '1') return 'Monday';
    if (dayOfWeek === '2') return 'Tuesday';
    if (dayOfWeek === '3') return 'Wednesday';
    if (dayOfWeek === '4') return 'Thursday';
    if (dayOfWeek === '5') return 'Friday';
    if (dayOfWeek === '6') return 'Saturday';
    if (dayOfWeek === '7') return 'Sunday';
  }
}
