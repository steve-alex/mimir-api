import { Controller, HttpStatus, Post, Req, Request } from '@nestjs/common';
import { ContentService } from './content.service';
import { Response } from '../../types/types';

@Controller('content')
export class ContentController {
  constructor(private readonly contentService: ContentService) {}

  @Post()
  async createContent(@Req() req: Request): Promise<Response> {
    await this.contentService.createContent(req);
    return { statusCode: HttpStatus.OK, message: 'Page successfully created' };
  }
}
