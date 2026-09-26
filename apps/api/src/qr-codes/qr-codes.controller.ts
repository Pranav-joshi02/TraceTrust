import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { QrCodesService } from './qr-codes.service';

@Controller('qr-codes')
export class QrCodesController {
  constructor(private readonly qrCodes: QrCodesService) {}

  @Post()
  generate(@Body() body: Record<string, unknown>) {
    return this.qrCodes.generate(body);
  }

  @Get()
  list() {
    return this.qrCodes.list();
  }

  @Get(':code')
  resolve(@Param('code') code: string) {
    return this.qrCodes.resolve(code);
  }

  @Get('batch/:batchId')
  listForBatch(@Param('batchId') batchId: string) {
    return this.qrCodes.listForBatch(batchId);
  }
}
