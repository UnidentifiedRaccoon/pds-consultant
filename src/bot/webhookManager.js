import { config } from '../config/env.js';
import { logger } from '../logger.js';

/**
 * Устанавливает webhook в Telegram Bot API
 * @param {string} webhookUrl - URL для webhook
 * @returns {Promise<boolean>} true если успешно установлен
 */
export async function setWebhook(webhookUrl) {
  try {
    const response = await fetch(
      `https://api.telegram.org/bot${config.TELEGRAM_BOT_TOKEN}/setWebhook`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: webhookUrl,
          secret_token: config.WEBHOOK_SECRET,
        }),
      }
    );

    const result = await response.json();

    if (result.ok) {
      logger.info({ webhookUrl }, 'Webhook successfully set');
      return true;
    } else {
      logger.error({ error: result.description }, 'Failed to set webhook');
      return false;
    }
  } catch (error) {
    logger.error({ error: error.message }, 'Error setting webhook');
    return false;
  }
}

/**
 * Получает информацию о текущем webhook
 * @returns {Promise<Object|null>} Информация о webhook или null при ошибке
 */
export async function getWebhookInfo() {
  try {
    const response = await fetch(
      `https://api.telegram.org/bot${config.TELEGRAM_BOT_TOKEN}/getWebhookInfo`
    );

    const result = await response.json();

    if (result.ok) {
      return result.result;
    } else {
      logger.error({ error: result.description }, 'Failed to get webhook info');
      return null;
    }
  } catch (error) {
    logger.error({ error: error.message }, 'Error getting webhook info');
    return null;
  }
}

/**
 * Удаляет webhook
 * @returns {Promise<boolean>} true если успешно удален
 */
export async function deleteWebhook() {
  try {
    const response = await fetch(
      `https://api.telegram.org/bot${config.TELEGRAM_BOT_TOKEN}/deleteWebhook`,
      {
        method: 'POST',
      }
    );

    const result = await response.json();

    if (result.ok) {
      logger.info('Webhook successfully deleted');
      return true;
    } else {
      logger.error({ error: result.description }, 'Failed to delete webhook');
      return false;
    }
  } catch (error) {
    logger.error({ error: error.message }, 'Error deleting webhook');
    return false;
  }
}
