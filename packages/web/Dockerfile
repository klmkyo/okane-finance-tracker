FROM node:20-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && apk add --no-cache libc6-compat
WORKDIR /app

FROM base AS dependencies
RUN mkdir -p packages/web
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./
COPY packages/web/package.json packages/web/pnpm-lock.yaml packages/web/
RUN pnpm install --frozen-lockfile --filter @okane/web...

FROM dependencies AS build
COPY tsconfig.base.json tsconfig.json ./
COPY packages/web packages/web
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_TELEMETRY_DISABLED=1
RUN pnpm --filter @okane/web build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

RUN apk add --no-cache curl
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs

COPY --from=build /app/packages/web/.next/standalone ./
COPY --from=build /app/packages/web/.next/static ./.next/static
COPY --from=build /app/packages/web/public ./public

USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]