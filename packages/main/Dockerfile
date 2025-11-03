FROM node:20 AS base
WORKDIR /app
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

FROM base AS dependencies
RUN mkdir -p packages/main
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./
COPY packages/main/package.json packages/main/pnpm-lock.yaml packages/main/
RUN pnpm install --frozen-lockfile --filter @okane/main...

FROM dependencies AS build
COPY tsconfig.base.json tsconfig.json ./
COPY packages/main packages/main
RUN pnpm deploy --filter @okane/main /app/deploy
WORKDIR /app/deploy
RUN pnpm build


FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=4321
RUN apk add --no-cache curl
COPY --from=build /app/deploy ./
EXPOSE 4321
CMD ["node", "dist/src/main"]
