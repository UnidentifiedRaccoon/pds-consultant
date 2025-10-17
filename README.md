# PDS Consultant Bot

Telegram бот-консультант по Программе долгосрочных сбережений (ПДС). Помогает рассчитать взносы и получить информацию о программе.

## 🚀 Технологии

- **TypeScript** - строгая типизация для надежности кода
- **grammY** - современный и быстрый фреймворк для Telegram ботов
- **@grammyjs/conversations** - элегантное управление диалогами через FSM
- **Fastify** - высокопроизводительный веб-сервер для webhook
- **Playwright** - генерация PDF-отчетов
- **Pino** - структурированное логирование

## 📋 Требования

- Node.js 20.10.0
- npm 10.2.3

## 🛠️ Установка

```bash
# Установка зависимостей
npm install

# Создание .env файла
cp .env.example .env
```

Заполните `.env` файл:

```env
TELEGRAM_BOT_TOKEN=your_bot_token_here
WEBHOOK_SECRET=your_secret_at_least_8_chars
DEV_PORT=8080
PUBLIC_BASE_URL=
```

## 💻 Разработка

```bash
# Разработка с автоматическим туннелем (localtunnel) и hot reload
npm run dev

# Разработка с только сервером (нужно вручную настроить webhook)
npm run dev:server

# Сборка проекта
npm run build

# Проверка типов
npm run typecheck

# Линтинг
npm run lint
npm run lint:fix

# Форматирование
npm run format
```

## 🚀 Продакшн

```bash
# Сборка проекта
npm run build

# Установка webhook
npm run webhook:set https://your-domain.com/tg/YOUR_WEBHOOK_SECRET

# Запуск
npm start
```

Или через переменные окружения:

```bash
PORT=8080 PUBLIC_BASE_URL=https://your-domain.com npm start
```

## 📝 Управление Webhook

```bash
# Получить информацию о webhook
npm run webhook:info

# Установить webhook
npm run webhook:set <URL>

# Удалить webhook
npm run webhook:delete
```

## 🏗️ Структура проекта

```
pds-consultant/
├── src/
│   ├── bot/              # Логика бота
│   │   ├── attachBotHandlers.ts  # Обработчики команд и сообщений
│   │   ├── conversations/        # Диалоги на @grammyjs/conversations
│   │   │   └── capitalFlow.ts    # Многошаговый сценарий расчета капитала
│   │   ├── messages.ts           # Тексты сообщений и клавиатуры
│   │   ├── pdfReport.ts          # Генерация PDF отчетов
│   │   ├── types.ts              # Типы контекста и session
│   │   └── webhookBot.ts         # Создание экземпляра бота + middleware
│   ├── config/           # Конфигурация
│   │   └── env.ts        # Переменные окружения
│   ├── server/           # HTTP сервер
│   │   └── fastify.ts    # Fastify сервер с webhook endpoint
│   ├── index.ts          # Точка входа приложения
│   └── logger.ts         # Настройка логирования
├── calculation-models/   # Модели расчетов
│   └── capital-lump-sum/ # Расчет капитала к выплатам
├── scripts/              # Утилиты
│   ├── dev-with-localtunnel.ts  # Разработка с туннелем
│   └── webhook-manager.ts       # Управление webhook
├── webhook/              # Webhook утилиты
│   └── index.ts          # API для работы с Telegram webhook
├── Dockerfile            # Контейнеризация (multi-stage + Playwright)
├── .github/workflows/    # CI/CD pipeline (lint, build, docker, deploy)
└── dist/                 # Скомпилированный код (tsc)
```
