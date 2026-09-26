import { Module } from '@nestjs/common';
import { EndorsementsController } from './endorsements.controller';
import { EndorsementsService } from './endorsements.service';

@Module({ controllers: [EndorsementsController], providers: [EndorsementsService] })
export class EndorsementsModule {}
