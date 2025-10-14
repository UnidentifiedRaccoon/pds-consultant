# Capital Compass AI

> 🤖 Telegram-бот для консультаций по пенсионным накоплениям (ПДС) со статическими ответами

Диалоговый ассистент на Node.js 20, который помогает пользователям рассчитать оптимальные взносы в Программу долгосрочных сбережений (ПДС) для достижения желаемых пенсионных целей.

## 🚀 Возможности

- **💬 Интеллектуальные консультации** — специализированный бот по пенсионным накоплениям
- **📊 Математические расчёты** — точные вычисления с учётом господдержки и налоговых вычетов
- **🎯 Персональные рекомендации** — индивидуальные советы на основе дохода и целей
- **🔄 Контекстные диалоги** — запоминание истории общения для более качественных ответов
- **⚡ Быстрые ответы** — оптимизированная архитектура для минимального времени отклика
- **📈 Мониторинг** — встроенные метрики и логирование для отслеживания работы

## 🏗️ Архитектура

```
┌─────────────────┐    ┌──────────────────┐
│   Telegram      │    │   Fastify        │
│   Bot API       │◄──►│   Web Server     │
└─────────────────┘    └──────────────────┘
                              │
                              ▼
                       ┌──────────────────┐
                       │   Chat Context   │
                       │   Storage        │
                       └──────────────────┘
```

### Основные компоненты

- **`src/bot/`** — обработчики Telegram-бота (webhook/polling)
- **`src/server/`** — Fastify HTTP-сервер с эндпоинтами
- **`src/storage/`** — in-memory хранилище контекста чатов
- **`src/config/`** — конфигурация и валидация переменных окружения

## 🛠️ Технологический стек

- **Node.js 20.10.0** — основная платформа
- **Fastify** — быстрый HTTP-сервер
- **node-telegram-bot-api** — Telegram Bot API
- **Статические ответы** — предопределённые ответы на основе ключевых слов
- **Pino** — структурированное логирование
- **Docker** — контейнеризация
- **GitHub Actions** — CI/CD

## 📦 Установка и запуск

### Требования

- Node.js 20.10.0+
- npm 10.2.3+
- Telegram Bot Token

### Локальная разработка

1. **Клонирование репозитория**

   ```bash
   git clone <repository-url>
   cd capital-compass
   ```

2. **Установка зависимостей**

   ```bash
   npm ci
   ```

3. **Настройка переменных окружения**

   ```bash
   cp .env.example .env
   ```

   Заполните `.env` файл:

   ```env
   # Telegram Bot
   TELEGRAM_BOT_TOKEN=your_bot_token

   # Server Configuration
   BOT_MODE=webhook
   DEV_PORT=8080
   WEBHOOK_SECRET=your_webhook_secret
   PUBLIC_BASE_URL=https://your-domain.com

   # Optional
   API_TIMEOUT_MS=7000
   ```

4. **Запуск в режиме разработки**
   ```bash
   npm run start:dev
   ```

### Доступные скрипты

```bash
# Разработка
npm run start:dev          # Запуск в dev-режиме
npm run start              # Запуск в production-режиме

# Качество кода
npm run lint               # ESLint проверка
npm run lint:fix           # Автоисправление ESLint
npm run format             # Prettier форматирование
npm run format:check       # Проверка форматирования

# Тестирование
npm run smoke:http         # HTTP smoke test
npm run smoke:webhook      # Webhook smoke test
npm run smoke:pdf          # PDF generation test
```

## 🌐 API Документация

### Эндпоинты

- **`GET /health`** — проверка состояния сервиса
- **`GET /metrics`** — метрики производительности
- **`POST /tg/{webhook_secret}`** — webhook для Telegram

### Примеры запросов

```bash
# Проверка здоровья
curl http://localhost:8080/health

# Получение метрик
curl http://localhost:8080/metrics
```

## 🚀 Деплой

### Docker

Проект настроен для контейнеризации и может быть развернут в любом Docker-совместимом окружении:

1. **Настройка переменных окружения**

   - `TELEGRAM_BOT_TOKEN` — токен Telegram бота
   - `WEBHOOK_SECRET` — секрет для webhook
   - `PUBLIC_BASE_URL` — публичный URL для webhook

2. **Автоматический деплой**
   - Push в ветку `main` автоматически запускает деплой
   - Сборка Docker-образа и публикация в Container Registry
   - Обновление ревизии контейнера

```bash
# Сборка образа
docker build -t capital-compass .

# Запуск контейнера
docker run -p 8080:8080 \
  -e TELEGRAM_BOT_TOKEN=your_token \
  -e WEBHOOK_SECRET=your_secret \
  -e PUBLIC_BASE_URL=https://your-domain.com \
  capital-compass
```

## 📊 Мониторинг и логирование

### Логирование

- **Pino** — структурированные JSON-логи
- **Уровни логирования** — debug, info, warn, error, fatal
- **Контекстная информация** — chatId, timing, ошибки

### Метрики

- `updates_total` — общее количество обновлений
- `updates_ok` — успешные обновления
- `updates_err` — ошибки обновлений
- `uptime_s` — время работы в секундах

### Мониторинг контекста

- `context.totalChats` — количество активных чатов
- `context.totalMessages` — общее количество сообщений в контексте
- `context.oldestContext` — время создания самого старого контекста

## 🔧 Разработка

### Структура проекта

```
src/
├── bot/                    # Telegram Bot логика
│   ├── attachBotHandlers.js    # Обработчики сообщений
│   ├── longPollingBot.js       # Long polling режим
│   ├── webhookBot.js           # Webhook режим
│   ├── prompt.js               # Системный промпт
│   └── antiFlood.js            # Защита от спама
├── config/
│   └── env.js                  # Конфигурация окружения
├── server/
│   └── fastify.js              # HTTP сервер
├── storage/
│   └── chatContext.js          # Хранилище контекста
├── utils/
│   └── http/                   # HTTP утилиты
├── index.js                    # Точка входа
├── logger.js                   # Настройка логирования
└── metrics.js                  # Метрики
```

### Добавление новых функций

1. **Новые команды бота** — добавьте обработчики в `src/bot/attachBotHandlers.js`
2. **Новые эндпоинты** — расширьте `src/server/fastify.js`
3. **Новые метрики** — добавьте в `src/metrics.js`

### Тестирование

```bash
# Запуск всех тестов
npm run smoke:http && npm run smoke:llm && npm run smoke:webhook

# Проверка линтера
npm run lint

# Проверка форматирования
npm run format:check
```

## 🔒 Безопасность

- **Переменные окружения** — все секреты хранятся в переменных окружения
- **Валидация конфигурации** — строгая проверка при запуске
- **Webhook секреты** — защита webhook эндпоинтов
- **Rate limiting** — защита от спама через antiFlood механизм

## 📝 Лицензия

MIT License

---

**Теги:** #telegram #nodejs #pension #financial-advice #docker #github-actions #fastify #pino
