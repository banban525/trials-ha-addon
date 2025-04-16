ARG BUILD_FROM="alpine:3.21"
ARG BASE_IMAGE="base"

FROM ${BUILD_FROM} AS base

RUN addgroup -g 1000 node \
    && adduser -u 1000 -G node -s /bin/sh -D node
RUN apk add --no-cache nodejs npm


FROM ${BASE_IMAGE} AS build

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

RUN chmod +x /app/docker-entrypoint.sh

FROM base AS runtime

# RUN apk --no-cache -U upgrade
RUN mkdir -p /app/.ts-node && chown -R node:node /app
WORKDIR /app

COPY package*.json ./
USER node

RUN npm ci --omit=dev
COPY --chown=node:node --from=build /app/public ./public
COPY --chown=node:node --from=build /app/.ts-node ./.ts-node
COPY --chown=node:node --from=build /app/docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh

EXPOSE 8099

ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]
