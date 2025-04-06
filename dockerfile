ARG BUILD_FROM
FROM ${BUILD_FROM} AS base

RUN apk add --no-cache nodejs npm


FROM base as build

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build


FROM base AS runtime

# RUN apk --no-cache -U upgrade
RUN mkdir -p /app/.ts-node && chown -R node:node /app
WORKDIR /app

COPY package*.json ./
USER node

RUN npm ci --omit=dev
COPY --chown=node:node --from=build /app/public ./public
COPY --chown=node:node --from=build /app/.ts-node ./.ts-node

EXPOSE 3000

ENTRYPOINT ["npm", "run", "start:built"]

