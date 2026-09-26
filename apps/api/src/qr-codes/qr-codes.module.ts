import { Module } from '@nestjs/common';
import { QrCodesController } from './qr-codes.controller';
import { QrCodesService } from './qr-codes.service';

@Module({ controllers: [QrCodesController], providers: [QrCodesService] })
export class QrCodesModule {}
