# Multi-stage build для оптимизации размера образа

# Stage 1: Сборка TypeScript
FROM node:20-slim AS builder
WORKDIR /app

# Копируем package files
COPY package*.json ./
COPY tsconfig.json ./

# Установка всех зависимостей (включая dev для сборки)
RUN npm ci

# Копируем исходный код
COPY src/ ./src/
COPY calculation-models/ ./calculation-models/
COPY webhook/ ./webhook/
COPY scripts/ ./scripts/

# Сборка TypeScript
RUN npm run build

# Stage 2: Production dependencies
FROM node:20-slim AS deps
WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev --ignore-scripts

# Stage 3: Production image
FROM node:20-slim
ENV NODE_ENV=production
WORKDIR /app

# Устанавливаем системные зависимости для Playwright Chromium
RUN apt-get update && apt-get install -y \
    # Основные утилиты
    ca-certificates \
    wget \
    gnupg \
    # Зависимости для Chromium
    libnss3 \
    libnspr4 \
    libatk1.0-0 \
    libatk-bridge2.0-0 \
    libcups2 \
    libdrm2 \
    libdbus-1-3 \
    libxkbcommon0 \
    libatspi2.0-0 \
    libxcomposite1 \
    libxdamage1 \
    libxfixes3 \
    libxrandr2 \
    libgbm1 \
    libpango-1.0-0 \
    libcairo2 \
    libasound2 \
    libxshmfence1 \
    # Очистка
    && rm -rf /var/lib/apt/lists/* \
    && apt-get clean

# Копируем production зависимости
COPY --from=deps /app/node_modules ./node_modules

# Копируем скомпилированный код
COPY --from=builder /app/dist ./dist

# Копируем package.json для метаданных
COPY package.json ./

# Устанавливаем Playwright браузеры (только chromium)
RUN npx playwright install chromium --with-deps

# Создаем non-root пользователя для безопасности
RUN groupadd -r nodejs && useradd -r -g nodejs nodejs \
    && chown -R nodejs:nodejs /app \
    && mkdir -p /tmp/pds-consultant-reports \
    && chown nodejs:nodejs /tmp/pds-consultant-reports

USER nodejs

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
    CMD node -e "fetch('http://127.0.0.1:8080/health').then(r=>{if(!r.ok)process.exit(1)}).catch(()=>process.exit(1))"

# Expose port
EXPOSE 8080

# Start application
CMD ["node", "dist/src/index.js"]
