export class ApiClient {
  constructor(private readonly baseUrl = process.env.TRUSTTRACE_API_URL ?? 'http://localhost:4000/api') {}

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

  private async request(path: string, init: RequestInit) {
    const response = await fetch(`${this.baseUrl}${path}`, init);
    const text = await response.text();
    const payload = text ? JSON.parse(text) : {};
    if (!response.ok) {
      throw new Error(payload.message ?? `TrustTrace API returned ${response.status}`);
    }
    return payload;
  }
}
