import { config } from './config/env.js';
import { createServer } from './server/fastify.js';
import { createWebhookBot } from './bot/webhookBot.js';
import { logger } from './logger.js';
import { FastifyInstance } from 'fastify';

/**
 * Валидация конфигурации при старте
 */
function validateConfig(): void {
  const errors: string[] = [];

  if (!config.TELEGRAM_BOT_TOKEN) {
    errors.push('TELEGRAM_BOT_TOKEN is required');
  }

  if (!config.WEBHOOK_SECRET || config.WEBHOOK_SECRET.length < 8) {
    errors.push('WEBHOOK_SECRET must be at least 8 characters');
  }

  if (errors.length > 0) {
    logger.fatal({ errors }, 'config:validation:failed');
    throw new Error(`Configuration validation failed: ${errors.join(', ')}`);
  }

  logger.info('config:validation:passed');
}

/**
 * Главная функция запуска приложения
 */
async function startApp(): Promise<void> {
  try {
    // Валидация конфигурации
    validateConfig();

    // Определение порта
    const platformPort = process.env.PORT && Number(process.env.PORT);
    const PORT = platformPort || config.DEV_PORT;

    if (isNaN(PORT) || PORT < 1 || PORT > 65535) {
      throw new Error(`Invalid port number: ${PORT}`);
    }

    // Создание бота и сервера
    const bot = createWebhookBot();

    // Инициализация бота (загрузка информации о боте)
    await bot.init();

    const server = createServer(bot);

    // Запуск сервера
    await server.listen({ port: PORT, host: '0.0.0.0' });
    logger.info({ port: PORT, env: process.env.NODE_ENV || 'production' }, 'http:listening');

    // Вывод информации о webhook
    if (config.PUBLIC_BASE_URL) {
      logger.info(
        { webhook: `${config.PUBLIC_BASE_URL}/tg/${config.WEBHOOK_SECRET}` },
        'webhook:path'
      );
    } else {
      logger.warn('Set PUBLIC_BASE_URL to complete Telegram setWebhook.');
    }

    // Настройка graceful shutdown
    setupShutdownHandlers(server);
  } catch (err) {
    const error = err as Error;
    logger.fatal({ err: error, message: error.message, stack: error.stack }, 'app:start:error');
    process.exit(1); // eslint-disable-line n/no-process-exit
  }
}

/**
 * Настройка обработчиков graceful shutdown
 */
function setupShutdownHandlers(server: FastifyInstance): void {
  const shutdown = async (signal: string) => {
    logger.warn({ signal }, 'shutdown:start');
    try {
      await server.close();
      logger.info('shutdown:done');
      process.exit(0); // eslint-disable-line n/no-process-exit
    } catch (e) {
      const error = e as Error;
      logger.fatal({ err: error, message: error.message }, 'shutdown:error');
      process.exit(1); // eslint-disable-line n/no-process-exit
    }
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('uncaughtException', (err) => {
    logger.fatal({ err, message: err.message, stack: err.stack }, 'uncaughtException');
    process.exit(1); // eslint-disable-line n/no-process-exit
  });
  process.on('unhandledRejection', (reason, promise) => {
    logger.fatal({ reason, promise }, 'unhandledRejection');
    process.exit(1); // eslint-disable-line n/no-process-exit
  });
}

// Запуск приложения
startApp();
