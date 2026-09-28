import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';

/**
 * @Roles('admin', 'auditor') — restrict endpoint to users with at least one of these roles.
 */
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
