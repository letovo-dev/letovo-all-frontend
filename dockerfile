# syntax=docker/dockerfile:1.7

FROM node:22-alpine@sha256:968df39aedcea65eeb078fb336ed7191baf48f972b4479711397108be0966920 AS deps
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts

FROM node:22-alpine@sha256:968df39aedcea65eeb078fb336ed7191baf48f972b4479711397108be0966920 AS builder
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1 \
    NODE_OPTIONS=--max-old-space-size=4096
ARG NEXT_PUBLIC_BASE_URL=
ARG NEXT_PUBLIC_BASE_URL_UPLOAD=
ARG NEXT_PUBLIC_BASE_URL_MEDIA=
ARG NEXT_PUBLIC_UPLOAD_URL=
ARG NEXT_PUBLIC_BASE_URL_CLEAR=
COPY --from=deps /app/node_modules ./node_modules
COPY . .
COPY ./front-env.env ./.env
RUN if [ -n "$NEXT_PUBLIC_BASE_URL" ]; then printf "\nNEXT_PUBLIC_BASE_URL='%s'\n" "$NEXT_PUBLIC_BASE_URL" >> ./.env; fi && \
    if [ -n "$NEXT_PUBLIC_BASE_URL_UPLOAD" ]; then printf "NEXT_PUBLIC_BASE_URL_UPLOAD='%s'\n" "$NEXT_PUBLIC_BASE_URL_UPLOAD" >> ./.env; fi && \
    if [ -n "$NEXT_PUBLIC_BASE_URL_MEDIA" ]; then printf "NEXT_PUBLIC_BASE_URL_MEDIA='%s'\n" "$NEXT_PUBLIC_BASE_URL_MEDIA" >> ./.env; fi && \
    if [ -n "$NEXT_PUBLIC_UPLOAD_URL" ]; then printf "NEXT_PUBLIC_UPLOAD_URL='%s'\n" "$NEXT_PUBLIC_UPLOAD_URL" >> ./.env; fi && \
    if [ -n "$NEXT_PUBLIC_BASE_URL_CLEAR" ]; then printf "NEXT_PUBLIC_BASE_URL_CLEAR='%s'\n" "$NEXT_PUBLIC_BASE_URL_CLEAR" >> ./.env; fi && \
    npm run build && rm -f .next/standalone/.env .next/standalone/.npmrc

FROM node:22-alpine@sha256:968df39aedcea65eeb078fb336ed7191baf48f972b4479711397108be0966920 AS runner
WORKDIR /app

ARG LETOVO_BUILD_SHA=unknown
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    LETOVO_BUILD_SHA=${LETOVO_BUILD_SHA} \
    PORT=3000 \
    HOSTNAME=0.0.0.0

COPY --from=builder --chown=node:node /app/public ./public
COPY --from=builder --chown=node:node /app/.next/standalone ./
COPY --from=builder --chown=node:node /app/.next/static ./.next/static

USER node

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "require('http').get('http://127.0.0.1:3000/', r => process.exit(r.statusCode < 500 ? 0 : 1)).on('error', () => process.exit(1))"

CMD ["node", "server.js"]
