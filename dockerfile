ARG BUILD_FROM
FROM ${BUILD_FROM} AS base

RUN apk add --no-cache nodejs npm


FROM base as build

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

RUN chmod +x /app/docker-entrypoint.sh

FROM base AS runtime

# RUN apk --no-cache -U upgrade
RUN mkdir -p /app/.ts-node
WORKDIR /app

COPY package*.json ./

RUN npm ci --omit=dev
COPY --from=build /app/public ./public
COPY --from=build /app/.ts-node ./.ts-node
COPY --from=build /app/docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh

EXPOSE 3000

ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]
