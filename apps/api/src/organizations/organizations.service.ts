import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';

@Injectable()
export class OrganizationsService {
  constructor(private readonly prisma: PrismaService) {}

  create(body: Record<string, unknown>) {
    const name = String(body.name ?? body.organizationName ?? 'New Organization');
    const organizationCode = String(body.organizationCode ?? name.toUpperCase().replace(/[^A-Z0-9]+/g, '-'));
    return this.prisma.organization.create({
      data: {
        name,
        legalName: String(body.legalName ?? name),
        organizationCode,
        organizationType: String(body.organizationType ?? 'SUPPLIER') as never,
        registrationNumber: body.registrationNumber ? String(body.registrationNumber) : undefined,
        country: String(body.country ?? 'India'),
        address: body.address ? String(body.address) : undefined,
        email: body.email ? String(body.email) : undefined,
        phone: body.phone ? String(body.phone) : undefined,
        status: String(body.status ?? 'PENDING') as never
      }
    });
  }

  list() {
    return this.prisma.organization.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async show(id: string) {
    const organization = await this.prisma.organization.findFirst({
      where: { OR: [{ id }, { organizationCode: id }] },
      include: { products: true, users: true, certificates: true }
    });
    if (!organization) throw new NotFoundException('Organization not found');
    return organization;
  }
}
