import { Inject, Injectable } from '@nestjs/common';
import { AvailabilityService } from '../availability/availability.service';
import { CalendarService } from '../../providers/calendar/calendar.service';
import { NotionService } from '../../providers/notion/notion.service';

@Injectable()
export class JobService {
  // async scheduleContent(content: any[]): Promise<void> {
  //   // 1. Get length of content
  //   const contentLength = this.getContentLength(content);

  //   // 2. Get all the availabilities - this is a weekly thing
  //   // The upcoming 2 weeks worth of availabilities
  //   const availabilities =
  //     await this.availabilityService.getUpcomingAvailabilities(
  //       1,
  //       contentLength,
  //     );

  //   // The upcoming 2 weeks worth of time slots to avoid any conflicts.
  //   const timeSlots =
  //     await this.calendarService.getFreeTimeSlotsInAvailabilities(
  //       availabilities,
  //     );

  //   const contentToSchedule = [...content].sort((a, b) => {
  //     if (a.length > b) return 1;
  //     else return -1;
  //   });

  //   for (const content of contentToSchedule) {
  //     const [status, { start, end }] =
  //       await this.calendarService.scheduleContent(timeSlots, content);

  //     if (status === 'success') {
  //       await this.notionService.updatePage(content.id, {
  //         status: Status.Saved,
  //       });

  //       this.updateTimeSlots(timeSlots, { start, end });
  //     }

  //     if (status !== 'success') {
  //       console.error(`Unable to schedule content - ${content}`);
  //     }
  //   }
  // }

  // /**
  //  * Take an array of content and sum the total length of the content
  //  */
  // private getContentLength(content: any[]): number {
  //   return content.length;
  // }
}
