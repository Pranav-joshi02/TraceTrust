export const defaultPorts = {
  web: 3000,
  api: 4000,
  postgres: 5432,
  minio: 9000
};

export const apiBaseUrl = process.env.TRUSTTRACE_API_URL ?? 'http://localhost:4000/api';
