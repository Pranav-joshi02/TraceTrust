import { Module } from '@nestjs/common';
import { EventsController } from './events.controller';
import { EventsService } from './events.service';
import { TrustModule } from '../trust/trust.module';

@Module({ imports: [TrustModule], controllers: [EventsController], providers: [EventsService] })
export class EventsModule {}
