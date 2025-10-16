# PDS Consultant Bot

Простой Telegram бот-консультант по ПДС с двумя основными функциями: рассчитать и узнать о ПДС.

## Разработка

### Быстрый старт

1. **Установите зависимости:**

   ```bash
   npm install
   ```

2. **Установите ngrok:**

   ```bash
   # macOS
   brew install ngrok

   # Или скачайте с https://ngrok.com/
   ```

3. **Настройте переменные окружения:**

   ```bash
   cp .env.example .env
   # Отредактируйте .env файл
   ```

4. **Запустите в режиме разработки:**
   ```bash
   npm run dev
   ```

### Режимы запуска

- **`npm run dev`** - Полная разработка с ngrok и автоперезагрузкой
- **`npm run dev:server`** - Только сервер с автоперезагрузкой (без ngrok)
- **`npm run start:ngrok`** - Продакшн режим с ngrok (без автоперезагрузки)
- **`npm start`** - Обычный запуск сервера

### Автоматическая перезагрузка

При использовании `npm run dev`:

- ✅ **Код перезагружается автоматически** при изменении файлов в `src/`
- ✅ **ngrok URL остается тем же** - не нужно перерегистрировать webhook
- ✅ **Сервер перезапускается** за ~1 секунду
- ✅ **Логи показывают** статус перезагрузки

### Webhook URL

После запуска `npm run dev` вы увидите:

```
Ngrok tunnel established: https://abc123.ngrok-free.app
Set this URL as webhook in Telegram Bot API: https://abc123.ngrok-free.app/tg/your_secret
```

Этот URL остается постоянным во время разработки!

## Продакшн

Для продакшн деплоя используется Docker и Yandex Cloud Serverless Container.

### Переменные окружения

- `TELEGRAM_BOT_TOKEN` - Токен бота от @BotFather
- `WEBHOOK_SECRET` - Секретный ключ для webhook
- `PUBLIC_BASE_URL` - Публичный URL (для продакшн)
- `DEV_PORT` - Порт для разработки (по умолчанию 8080)
