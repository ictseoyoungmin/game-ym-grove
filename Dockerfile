FROM node:20-alpine AS base
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate

FROM base AS deps
COPY package.json pnpm-lock.yaml* ./
RUN pnpm install --frozen-lockfile=false

FROM deps AS dev
COPY . .
EXPOSE 5173
CMD ["pnpm", "dev"]

FROM deps AS build
COPY . .
RUN pnpm build

FROM nginx:1.27-alpine AS preview
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80

FROM ghcr.io/cirruslabs/android-sdk:35 AS android-build
ARG NODE_VERSION=20.20.2
RUN curl -fsSL "https://nodejs.org/dist/v${NODE_VERSION}/node-v${NODE_VERSION}-linux-x64.tar.xz" \
  | tar -xJ -C /usr/local --strip-components=1 \
  && corepack enable \
  && corepack prepare pnpm@9.15.0 --activate
WORKDIR /workspace
