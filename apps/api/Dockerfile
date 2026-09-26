FROM node:20-alpine AS base
RUN apk add --no-cache libc6-compat openssl
RUN corepack enable && corepack prepare pnpm@9.12.3 --activate
WORKDIR /app

FROM base AS dependencies
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml turbo.json tsconfig.base.json ./
COPY packages/ ./packages/
COPY apps/api/ ./apps/api/
RUN pnpm install --frozen-lockfile

FROM dependencies AS builder
RUN pnpm --filter @trusttrace/database prisma:generate
RUN pnpm --filter @trusttrace/crypto build
RUN pnpm --filter @trusttrace/types build
RUN pnpm --filter @trusttrace/database build
RUN pnpm --filter @trusttrace/api build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV API_PORT=4000

COPY --from=builder /app /app

EXPOSE 4000
CMD ["pnpm", "--filter", "@trusttrace/api", "start"]
