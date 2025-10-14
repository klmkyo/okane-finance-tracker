# syntax=docker/dockerfile:1.6

FROM node:20 AS base
WORKDIR /app

# Enable pnpm via Corepack (version picked from packageManager field)
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

FROM base AS deps
# Install only the backend workspace dependencies
COPY packages/main/package.json packages/main/pnpm-lock.yaml ./
COPY packages/main/package.json ./
COPY packages/main/pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

FROM deps AS build
# Bring in the backend sources required for the build
COPY tsconfig.base.json ./tsconfig.base.json
COPY tsconfig.json ./tsconfig.json
COPY packages/main .
RUN pnpm build

FROM node:20-alpine AS runner
WORKDIR /app
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
ENV NODE_ENV=production
RUN corepack enable

# Copy workspace with built backend
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app .

EXPOSE 3000
CMD ["pnpm", "--filter", "@okane/main", "start:prod"]
