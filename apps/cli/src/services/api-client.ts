import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

export interface CliConfig {
  apiUrl?: string;
  token?: string;
  user?: {
    id: string;
    email: string;
    organizationId: string;
    organizationCode?: string;
    organizationName?: string;
    roles: string[];
  };
}

export class ApiClient {
  private configDir: string;
  private configFile: string;
  private config: CliConfig;

  constructor(private readonly baseUrl = process.env.TRUSTTRACE_API_URL ?? 'http://localhost:4000/api') {
    this.configDir = path.join(os.homedir(), '.trusttrace');
    this.configFile = path.join(this.configDir, 'config.json');
    this.config = this.loadConfig();
  }

  private loadConfig(): CliConfig {
    try {
      if (fs.existsSync(this.configFile)) {
        const raw = fs.readFileSync(this.configFile, 'utf-8');
        return JSON.parse(raw);
      }
    } catch {
      // ignore
    }
    return {};
  }

  private saveConfig(): void {
    try {
      if (!fs.existsSync(this.configDir)) {
        fs.mkdirSync(this.configDir, { recursive: true });
      }
      fs.writeFileSync(this.configFile, JSON.stringify(this.config, null, 2), 'utf-8');
    } catch {
      // ignore
    }
  }

  getToken(): string | undefined {
    return process.env.TRUSTTRACE_TOKEN || this.config.token;
  }

  setSession(token: string, user?: CliConfig['user']): void {
    this.config.token = token;
    if (user) this.config.user = user;
    this.saveConfig();
  }

  clearSession(): void {
    this.config.token = undefined;
    this.config.user = undefined;
    this.saveConfig();
  }

  getUser(): CliConfig['user'] | undefined {
    return this.config.user;
  }

  async get(path: string) {
    return this.request(path, { method: 'GET' });
  }

  async post(path: string, body: unknown = {}) {
    return this.request(path, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body)
    });
  }

  async put(path: string, body: unknown = {}) {
    return this.request(path, {
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body)
    });
  }

  async delete(path: string) {
    return this.request(path, { method: 'DELETE' });
  }

  private async request(path: string, init: RequestInit) {
    const headers: Record<string, string> = {
      ...(init.headers as Record<string, string> || {})
    };

    const token = this.getToken();
    if (token && !headers['Authorization'] && !headers['authorization']) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${this.baseUrl}${path}`, {
      ...init,
      headers
    });

    const text = await response.text();
    let payload: any = {};
    try {
      payload = text ? JSON.parse(text) : {};
    } catch {
      payload = { message: text };
    }

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error(`Authentication required. Please run: trusttrace login --email <email> --password <password>`);
      }
      if (response.status === 403) {
        throw new Error(payload.message ?? `Permission denied (403): You do not have the required role or organization scope.`);
      }
      throw new Error(payload.message ?? `TrustTrace API returned status ${response.status}`);
    }
    return payload;
  }
}
