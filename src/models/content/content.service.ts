import { Inject, Injectable } from '@nestjs/common';
import { NotionService } from '../../providers/notion/notion.service';
import { InsightService } from '../../providers/insights/insight.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Content, Status } from './content.entity';
import { Repository } from 'typeorm';
import { NotionPageDetails } from '../../providers/notion/notion.type';
import { IContent, Medium } from './content.type';
import { AvailabilityService } from '../availability/availability.service';
import { CalendarService } from '../../providers/calendar/calendar.service';
import { TimeSlot } from '../../types/types';

@Injectable()
export class ContentService {
  constructor(
    @Inject(NotionService) private notionService: NotionService,
    @Inject(InsightService) private insightService: InsightService,
    @Inject(AvailabilityService) private availabilityService: AvailabilityService,
    @Inject(CalendarService) private calendarService: CalendarService,
    @InjectRepository(Content) private contentRepository: Repository<Content>,
  ) {}

  async createContent(req: any): Promise<void> {
    console.log('createContent!');
    const contentDetails = await this.getContentDetails(req.body);

    const pageDetails = await this.notionService.createPage({
      url: req.body.url,
      ...contentDetails,
    });

    // TODO - add accountId to pageDetails;

    const content = await this.storeContent(pageDetails);

    // TODO - check format of content to be passed to scheduleContent

    await this.scheduleContent(content, 1);
  }

  async storeContent(contentDetails: NotionPageDetails): Promise<any> {
    try {
      const parsedContentDetails = {
        category_ids: contentDetails.categoryIds,
        title: contentDetails.title,
        creator: contentDetails.creator,
        url: contentDetails.url,
        medium: contentDetails.medium,
        categories: contentDetails.categories,
        summary: contentDetails.summary,
        time: contentDetails.time,
        notion_id: contentDetails.notionId,
      };
      return this.contentRepository.insert(parsedContentDetails);
    } catch (err) {
      throw new Error(err.message);
    }
  }

  /**
   * schedules the content at the next available time
   * The job creates Google Calendar events, updates the card in Notion to "scheduled" and also updated the content record in the DB
   */
  async scheduleContent(content: Content, accountId: number): Promise<void> {
    const availabilities =
      await this.availabilityService.getUpcomingAvailableTimeSlots(accountId);

    const events = await this.calendarService.getScheduledEventTimeSlots(
      availabilities,
    );

    const parsedAvailabilities =
      await this.availabilityService.removeEventsFromAvailabilitiesAndHydrateWithTime(
        availabilities,
        events,
      );

    await this.runScheduleContent(content, parsedAvailabilities);
  }

  /**
   * Attempts to run scheduling for a given set of events within a given set of availabilities
   * Creates an event in the calendar, updated the status for the DB record and the Notion
   */
  private async runScheduleContent(
    content: Content,
    availabilities: TimeSlot[],
  ): Promise<void> {
    const { notion_id, id, time, title } = content;

    for (const a of availabilities) {
      if (a.time > time) {
        try {
          await Promise.all([
            this.calendarService.createEvent({
              title: title,
              start: a.start,
              end: new Date(a.start.getTime() + time * 60000),
            }),
            this.updateContent({
              id: id,
              status: Status.Saved,
            }),
            this.notionService.updatePage(notion_id, {
              status: Status.Saved,
            }),
          ]);

          // Shortens the availability once an event has been scheduled on it
          this.removeTimeFromAvailability(a, time);
          break;
        } catch (err) {
          console.error(
            `Unable to schedule event - ${content} in availability - ${a} | error: ${err.message}`,
          );
          continue;
        }
      }
    }
  }

  private removeTimeFromAvailability(schedule, time) {
    const updatedTime = new Date(schedule.start.getTime() + time * 60000);
    schedule.start = updatedTime;
    schedule.time = schedule.time - time;
  }

  async getContent(details: IContent): Promise<Content[]> {
    const where: any = {};

    if (details?.accountId) {
      where.account = {};
      where.account.id = details.accountId;
    }
    if (details?.status) where.status = details.status;

    return this.contentRepository.find({ where });
  }

  async updateContent(body: any): Promise<void> {
    await this.contentRepository.save({
      id: body.id,
      status: body.status,
    });
  }

  private async getContentDetails(body: {
    url: string;
    html: string;
  }): Promise<any> {
    const { url, html } = body;
    const medium = this.getMedium(url);

    if (medium === Medium.WebPage) {
      const { title, author, categories, summary, readingTime } =
        await this.insightService.getWebPageDetails(html);

      return {
        title,
        creator: author,
        medium: Medium.WebPage,
        categories,
        summary,
        time: readingTime,
      };
    }

    if (medium === Medium.YouTube) {
      const { title, creator, categories, summary, videoLength } =
        await this.insightService.getYouTubeVideoDetails(url);

      return {
        title,
        creator,
        medium: Medium.YouTube,
        categories,
        summary,
        time: videoLength,
      };
    }
  }

  private getMedium(url: string): Medium {
    if (url.toLowerCase().includes('www.youtube.com')) {
      return Medium.YouTube;
    }
    return Medium.WebPage;
  }
}
