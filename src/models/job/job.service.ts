import { Inject, Injectable } from '@nestjs/common';
import { AvailabilityService } from '../availability/availability.service';
import { CalendarService } from '../../providers/calendar/calendar.service';
import { ContentService } from '../content/content.service';
import { Status } from '../content/content.entity';

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
   * Creates a job that schedules all the content in the inbox for a specific accountId and schedules them at the next available date
   * The job creates Google Calendar events, updates the card in Notion to "scheduled" and also updated the content record in the DB
   */
  async scheduleContentInInbox(accountId: number): Promise<void> {
    const content = await this.contentService.getContent({
      accountId,
      status: Status.Inbox,
    });
    console.log(
      '🚀 ~ file: job.service.ts:27 ~ JobService ~ scheduleContentInInbox ~ content:',
      content,
    );

    // const availabilities =
    //   await this.availabilityService.getParsedAvailabilities(accountId);

    // const events = await this.calendarService.getScheduledEvents(
    //   availabilities,
    // );

    // const schedule = this.removeTimeSlots(availabilities, events);
    // const mappedSchedule = this.addTimeToSlots(schedule);
    // for (const c of content) {
    //   const time = c.time;

    //   for (const s of mappedSchedule) {
    //     if (s.time > time) {
    //       try {
    //         await Promise.all([
    //           this.calendarService.createEvent({
    //             title: c.title,
    //             start: s.start,
    //             end: new Date(s.start.getTime() + time * 60000),
    //           }),
    //           // this.contentService.updateContent({
    //           //   id: c.id,
    //           //   status: Status.Saved,
    //           // }),
    //           // this.notionService.updatePage({})
    //         ]);

    //         this.updateSchedule(s, time);
    //         break;
    //       } catch (err) {
    //         console.log('err =>', err);
    //         console.error(
    //           `Unable to schedule event - ${c} in availability - ${s}`,
    //         );
    //         continue;
    //       }
    //     }
    //   }
    // }
  }

  removeTimeSlots(availabilities, timeSlots) {
    // Create a new array to store the updated availabilities
    const newAvailabilities = [];

    // Loop through each availability
    for (const availability of availabilities) {
      // Create a flag to track whether the availability has been modified
      let availabilityModified = false;
      // Loop through each timeslot
      for (const timeSlot of timeSlots) {
        // Check if the timeslot overlaps with the availability
        const timeSlotStart = new Date(timeSlot.start.dateTime);
        const timeSlotEnd = new Date(timeSlot.end.dateTime);
        const availabilityStart = new Date(availability.start);
        const availabilityEnd = new Date(availability.end);
        if (
          timeSlotStart < availabilityEnd &&
          timeSlotEnd > availabilityStart
        ) {
          // Remove the timeslot from the availability
          if (
            timeSlotStart <= availabilityStart &&
            timeSlotEnd >= availabilityEnd
          ) {
            // The timeslot completely contains the availability, so remove the availability
            availabilityModified = true;
          } else if (timeSlotStart <= availabilityStart) {
            // The timeslot overlaps with the beginning of the availability, so adjust the start time
            newAvailabilities.push({
              start: timeSlotEnd,
              end: availabilityEnd,
            });
            availabilityModified = true;
          } else if (timeSlotEnd >= availabilityEnd) {
            // The timeslot overlaps with the end of the availability, so adjust the end time
            newAvailabilities.push({
              start: availabilityStart,
              end: timeSlotStart,
            });
            availabilityModified = true;
          } else {
            // The timeslot is in the middle of the availability, so split it into two availabilities
            const newAvailability1 = {
              start: availabilityStart,
              end: timeSlotStart,
            };
            const newAvailability2 = {
              start: timeSlotEnd,
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

  addTimeToSlots(schedule: any[]) {
    return schedule.map((s) => {
      return {
        ...s,
        time: getMinuteDifference(s.end, s.start),
      };
    });

    function getMinuteDifference(end: Date, start: Date): number {
      const timeDiff = Math.abs(end.getTime() - start.getTime());
      return Math.floor(timeDiff / 60000);
    }
  }
}
