# Этап сборки
FROM node:18-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./

# Устанавливаем все зависимости, включая husky
RUN npm ci

COPY . .

# Собираем
RUN npm run build

# Этап запуска
FROM node:18-alpine

WORKDIR /app

ENV NODE_ENV=production

COPY package.json package-lock.json ./

# Удаляем скрипты husky из package.json, чтобы не падал build
RUN sed -i '/"prepare"/d' package.json && \
    sed -i '/"postinstall"/d' package.json && \
    npm ci --omit=dev

# Копируем только нужные директории
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
# COPY --from=builder /app/next.config.js ./next.config.js
COPY --from=builder /app/package.json ./package.json

EXPOSE 3000

CMD ["npm", "run", "start"]
