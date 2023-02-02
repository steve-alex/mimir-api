import { Controller, HttpStatus, Post, Req, Request } from '@nestjs/common';
import { ContentService } from '../services/content.service';
import { Response } from '../types/types';

@Controller('content')
export class ContentController {
  constructor(private readonly contentService: ContentService) {}

  @Post()
  async createPage(@Req() req: Request): Promise<Response> {
    await this.contentService.createPage(req);
    return { statusCode: HttpStatus.OK, message: 'Page successfully created' };
  }
}
