import { Inject, Injectable } from '@nestjs/common';
import { AvailabilityService } from '../availability/availability.service';
import { CalendarService } from '../../providers/calendar/calendar.service';
import { ContentService } from '../content/content.service';
import { Content, Status } from '../content/content.entity';
import { TimeSlot } from '../../types/types';
import { NotionService } from '../../providers/notion/notion.service';

@Injectable()
export class JobService {
  constructor(
    @Inject(AvailabilityService)
    private availabilityService: AvailabilityService,
    @Inject(ContentService)
    private contentService: ContentService,
    @Inject(CalendarService)
    private calendarService: CalendarService,
    @Inject(NotionService)
    private notionService: NotionService,
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

    if (!content.length) return;
    // TODO - handle this more completely (depends on caller of function)

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
              this.notionService.updatePage(c.notion_id, {
                status: Status.Saved,
              }),
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
    if (!events.length) return availabilities;

    const overlappingEventArray = this.getOverlappingEvents(
      availabilities,
      events,
    );
    const updatedAvailabilities = [...availabilities];

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

    return this.mergeOverlappingEvents(overlappingEventsArray.flat());
  }

  private mergeOverlappingEvents(events: TimeSlot[]): TimeSlot[] {
    if (!events || events.length <= 1) return events;

    events.sort((a, b) => Number(a.start) - Number(b.start));

    const mergedIntervals = [];
    let currentInterval = events[0];

    for (let i = 1; i < events.length; i++) {
      const nextInterval = events[i];

      if (nextInterval.start <= currentInterval.end) {
        // the next interval overlaps with the current interval, so merge them
        currentInterval.end = new Date(
          Math.max(currentInterval.end.getTime(), nextInterval.end.getTime()),
        );
      } else {
        // the next interval does not overlap with the current interval, so add the current interval to the merged intervals array
        mergedIntervals.push(currentInterval);
        currentInterval = nextInterval;
      }
    }

    // add the last interval to the merged intervals array
    mergedIntervals.push(currentInterval);

    return mergedIntervals;
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
