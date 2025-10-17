import Fastify, { FastifyInstance } from 'fastify';
import { Bot } from 'grammy';
import type { Update } from 'grammy/types';
import { config } from '../config/env.js';
import { logger } from '../logger.js';
import type { MyContext } from '../bot/types.js';

/**
 * Создаёт Fastify-сервер с /health и /tg/<WEBHOOK_SECRET>
 */
export function createServer(bot: Bot<MyContext>): FastifyInstance {
  if (!bot) {
    throw new Error('Bot instance is required');
  }

  const app = Fastify({
    logger: false,
    trustProxy: true, // Для работы за прокси (ngrok, nginx и т.д.)
  });

  // health check endpoint
  app.get('/health', async () => ({
    ok: true,
    timestamp: new Date().toISOString(),
    service: 'pds-consultant',
  }));

  // webhook endpoint для grammY
  const path = `/tg/${config.WEBHOOK_SECRET}`;

  // grammY предоставляет адаптер для работы с различными фреймворками
  app.post(path, async (request, reply) => {
    // Проверка секретного токена
    const secret = request.headers['x-telegram-bot-api-secret-token'];
    if (secret && secret !== config.WEBHOOK_SECRET) {
      logger.warn({ secret }, 'webhook:unauthorized');
      return reply.code(401).send({ ok: false, error: 'Unauthorized' });
    }

    // Валидация тела запроса
    const update = request.body;
    if (!update || typeof update !== 'object') {
      logger.warn({ body: update }, 'webhook:invalid:body');
      return reply.code(400).send({ ok: false, error: 'Invalid request body' });
    }

    const typedUpdate = update as Update;
    if (!typedUpdate.update_id) {
      logger.warn({ update }, 'webhook:missing:update_id');
      return reply.code(400).send({ ok: false, error: 'Missing update_id' });
    }

    logger.debug({ update_id: typedUpdate.update_id }, 'webhook:update:received');

    try {
      // Используем grammY webhook callback для обработки апдейта
      await bot.handleUpdate(typedUpdate);
      return reply.send({ ok: true });
    } catch (error) {
      logger.error(
        {
          err: error,
          update_id: typedUpdate.update_id,
          message: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined,
        },
        'webhook:handler:error'
      );
      return reply.code(500).send({ ok: false, error: 'Internal server error' });
    }
  });

  // Обработчик 404
  app.setNotFoundHandler((request, reply) => {
    logger.warn({ url: request.url, method: request.method }, 'route:not_found');
    reply.code(404).send({ ok: false, error: 'Not found' });
  });

  // Глобальный обработчик ошибок
  app.setErrorHandler((error, request, reply) => {
    logger.error(
      {
        err: error,
        url: request.url,
        method: request.method,
      },
      'server:error'
    );
    reply.code(500).send({ ok: false, error: 'Internal server error' });
  });

  return app;
}
