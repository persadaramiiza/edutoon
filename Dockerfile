FROM node:22-bookworm-slim AS deps
WORKDIR /app
RUN corepack enable
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

FROM node:22-bookworm-slim AS builder
WORKDIR /app
ENV NODE_ENV=production
COPY --from=deps /app/node_modules ./node_modules
COPY package.json tsconfig.json tsconfig.build.json nest-cli.json ./
COPY src ./src
RUN node node_modules/@nestjs/cli/bin/nest.js build

FROM node:22-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production \
    PORT=3000
RUN apt-get update && \
    apt-get install --yes --no-install-recommends curl && \
    rm -rf /var/lib/apt/lists/* && \
    groupadd --system --gid 1001 edutoon && \
    useradd --system --uid 1001 --gid edutoon --create-home edutoon
COPY --from=deps --chown=edutoon:edutoon /app/node_modules ./node_modules
COPY --from=builder --chown=edutoon:edutoon /app/dist ./dist
COPY --chown=edutoon:edutoon package.json ./package.json
USER 1001:1001
EXPOSE 3000
CMD ["node", "dist/main.js"]
