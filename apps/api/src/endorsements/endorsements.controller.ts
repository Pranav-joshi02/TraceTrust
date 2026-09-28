import { Body, Controller, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { EndorsementsService } from './endorsements.service';
import { AuthGuard } from '../common/guards/auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('events/:eventId/endorsements')
@UseGuards(AuthGuard, RolesGuard)
export class EndorsementsController {
  constructor(private readonly endorsements: EndorsementsService) {}

  /**
   * Submit a new endorsement for an event.
   * Body: { organizationCode, decision: 'APPROVED' | 'REJECTED' | 'ABSTAINED', comment? }
   */
  @Post()
  @Roles('admin', 'operator', 'auditor')
  create(@Param('eventId') eventId: string, @Body() body: Record<string, unknown>) {
    return this.endorsements.createEndorsement(eventId, body);
  }

  @Get()
  list(@Param('eventId') eventId: string) {
    return this.endorsements.listEndorsements(eventId);
  }

  /**
   * Update an existing endorsement decision (e.g., change from PENDING to APPROVED/REJECTED).
   */
  @Put(':endorsementId')
  update(
    @Param('eventId') eventId: string,
    @Param('endorsementId') endorsementId: string,
    @Body() body: Record<string, unknown>,
  ) {
    return this.endorsements.updateEndorsement(eventId, endorsementId, body);
  }
}
