import { Command } from 'commander';
import { ApiClient } from '../services/api-client';

export function registerAuth(program: Command, api: ApiClient) {
  program
    .command('login')
    .description('Authenticate and store credentials for TrustTrace CLI')
    .requiredOption('-e, --email <email>', 'User email address')
    .option('-p, --password <password>', 'User password', 'Password123!')
    .action(async (options) => {
      try {
        const result = await api.post('/auth/login', {
          email: options.email,
          password: options.password
        });
        api.setSession(result.accessToken, result.user);
        console.log(`\n✓ Successfully authenticated as ${result.user?.email || options.email}`);
        console.log(`  Organization: ${result.user?.organizationName || result.user?.organizationCode || result.user?.organizationId}`);
        console.log(`  Roles:        ${(result.user?.roles || []).join(', ')}`);
        console.log(`  Token saved to ~/.trusttrace/config.json\n`);
      } catch (err: any) {
        console.error(`\n✗ Authentication failed: ${err.message}\n`);
        process.exitCode = 1;
      }
    });

  program
    .command('logout')
    .description('Clear saved credentials and logout from TrustTrace')
    .action(async () => {
      api.clearSession();
      console.log('\n✓ Successfully logged out. Saved session cleared.\n');
    });

  program
    .command('whoami')
    .description('Display currently active TrustTrace identity and organization scope')
    .action(async () => {
      try {
        const result = await api.get('/auth/me');
        console.log(`\nActive Identity:`);
        console.log(`──────────────────────────────────────────`);
        console.log(`Email:        ${result.email}`);
        console.log(`Name:         ${result.firstName} ${result.lastName}`);
        console.log(`Organization: ${result.organization?.name || result.organizationCode || result.organizationId}`);
        console.log(`Roles:        ${(result.roles || []).join(', ')}`);
        console.log(`MSP ID:       ${result.organization?.fabricMspId || 'ConsortiumMSP'}\n`);
      } catch (err: any) {
        console.error(`\n✗ Not logged in: ${err.message}\n`);
        process.exitCode = 1;
      }
    });
}
