import { Inject, Injectable } from '@nestjs/common';
import { AvailabilityService } from '../availability/availability.service';
import { CalendarService } from '../../providers/calendar/calendar.service';
import { ContentService } from '../content/content.service';
import { Content, Status } from '../content/content.entity';
import { TimeSlot } from '../../types/types';

@Injectable()
export class JobService {
  constructor(
    @Inject(ContentService)
    private contentService: ContentService,
    @Inject(AvailabilityService)
    private availabilityService: AvailabilityService,
    @Inject(CalendarService)
    private calendarService: CalendarService,
  ) {}

  /**
   * Creates a job that schedules all the content in the inbox for a specific accountId and at the next available time
   * The job creates Google Calendar events, updates the card in Notion to "scheduled" and also updated the content record in the DB
   */
  async scheduleContent(accountId: number): Promise<void> {
    const content = await this.contentService.getContent({
      accountId,
      status: Status.Inbox,
    });

    if (!content.length) return; // TODO - this needs to be handled more completely

    const availabilities =
      await this.availabilityService.getUpcomingAvailableTimeSlots(accountId);

    if (!availabilities.length)
      throw new Error('User has no availabilities set');

    const events = await this.calendarService.getScheduledEventTimeSlots(
      availabilities,
    );

    const updatedAvailabilities = this.addTimeToAvailabilities(
      this.removeEventsFromAvailabilities(availabilities, events),
    );

    await this.runScheduleContent(content, updatedAvailabilities);
  }

  private async runScheduleContent(
    content: Content[],
    availabilities: TimeSlot[],
  ): Promise<void> {
    for (const c of content) {
      const time = c.time;

      for (const a of availabilities) {
        if (a.time > time) {
          try {
            await Promise.all([
              this.calendarService.createEvent({
                title: c.title,
                start: a.start,
                end: new Date(a.start.getTime() + time * 60000),
              }),
              this.contentService.updateContent({
                id: c.id,
                status: Status.Saved,
              }),
              // this.notionService.updatePage({})
            ]);

            this.updateSchedule(a, time);
            break;
          } catch (err) {
            console.log('err =>', err);
            console.error(
              `Unable to schedule event - ${c} in availability - ${a}`,
            );
            continue;
          }
        }
      }
    }
  }

  /**
   * Takes an array of availabilities and then modifies it by removing the overlapping events;
   */
  private removeEventsFromAvailabilities(
    availabilities: TimeSlot[],
    events: TimeSlot[],
  ): TimeSlot[] {
    const newAvailabilities = [];

    if (!events.length) return availabilities;

    for (const availability of availabilities) {
      let availabilityModified = false;

      for (const event of events) {
        // Check if the timeslot overlaps with the availability
        const eventStart = new Date(event.start);
        const eventEnd = new Date(event.end);
        const availabilityStart = new Date(availability.start);
        const availabilityEnd = new Date(availability.end);

        if (eventStart < availabilityEnd && eventEnd > availabilityStart) {
          // Check if event overlaps the availability in any way
          if (eventStart <= availabilityStart && eventEnd >= availabilityEnd) {
            // The timeslot completely contains the availability, so remove the availability
            availabilityModified = true;
          } else if (eventStart <= availabilityStart) {
            // The timeslot overlaps with the beginning of the availability, so adjust the start time
            newAvailabilities.push({
              start: eventStart,
              end: availabilityEnd,
            });
            availabilityModified = true;
          } else if (eventEnd >= availabilityEnd) {
            // The timeslot overlaps with the end of the availability, so adjust the end time
            newAvailabilities.push({
              start: availabilityStart,
              end: eventEnd,
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
            newAvailabilities.push(newAvailability1, newAvailability2);
            availabilityModified = true;
          }
        }
      }

      // Add the availability to the new array if it hasn't been modified
      if (!availabilityModified) {
        newAvailabilities.push(availability);
      }
    }

    return newAvailabilities;
  }

  updateSchedule(schedule, time) {
    const updatedTime = new Date(schedule.start.getTime() + time * 60000);
    schedule.start = updatedTime;
    schedule.time = schedule.time - time;
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
}
