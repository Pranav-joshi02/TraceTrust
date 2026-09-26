import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { EndorsementsService } from './endorsements.service';

@Controller('events/:eventId/endorsements')
export class EndorsementsController {
  constructor(private readonly endorsements: EndorsementsService) {}

  @Post()
  create(@Param('eventId') eventId: string, @Body() body: Record<string, unknown>) {
    return this.endorsements.createEndorsement(eventId, body);
  }

  @Get()
  list(@Param('eventId') eventId: string) {
    return this.endorsements.listEndorsements(eventId);
  }
}
