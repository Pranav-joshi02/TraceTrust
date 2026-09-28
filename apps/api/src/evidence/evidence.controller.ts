import { Body, Controller, Get, Param, Post, UploadedFile, UseInterceptors, UseGuards, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { EvidenceService } from './evidence.service';
import { AuthGuard } from '../common/guards/auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('evidence')
@UseGuards(AuthGuard, RolesGuard)
export class EvidenceController {
  constructor(private readonly evidence: EvidenceService) {}

  /**
   * Upload evidence file via multipart form-data.
   * Field name: "file"
   * Additional form fields: organizationId, organizationCode, mimeType
   */
  @Post()
  @Roles('admin', 'operator', 'auditor')
  @UseInterceptors(FileInterceptor('file', {
    limits: { fileSize: 50 * 1024 * 1024 }, // 50MB max
  }))
  async create(
    @UploadedFile() file: Express.Multer.File | undefined,
    @Body() body: Record<string, unknown>,
  ) {
    if (file) {
      // Real file upload — hash actual bytes
      return this.evidence.createFromFile(file, body);
    }

    // Fallback: JSON-only metadata submission (for backward compat / testing)
    // But clearly mark it as metadata-only
    return this.evidence.createMetadataOnly(body);
  }

  @Get()
  list() {
    return this.evidence.list();
  }

  @Get(':id')
  show(@Param('id') id: string) {
    return this.evidence.show(id);
  }

  @Post(':id/verify')
  verify(@Param('id') id: string, @Body() body: Record<string, unknown>) {
    return this.evidence.verify(id, body);
  }
}
