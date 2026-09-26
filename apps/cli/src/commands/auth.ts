import { Command } from 'commander';
import { ApiClient } from '../services/api-client';

export function registerAuth(program: Command, api: ApiClient) {
  program.command('login').option('-e, --email <email>', 'Account email').description('Login to TrustTrace').action(async (options) => {
    const result = await api.post('/auth/login', { email: options.email });
    console.log('Logged in');
    console.log(`Token: ${result.accessToken}`);
  });

  program.command('logout').description('Logout from TrustTrace').action(async () => {
    await api.post('/auth/logout');
    console.log('Logged out');
  });

  program.command('whoami').description('Show current TrustTrace identity').action(async () => {
    const result = await api.get('/auth/me');
    console.log(`${result.email} (${result.organizationCode})`);
    console.log(`Roles: ${result.roles.join(', ')}`);
  });
}
