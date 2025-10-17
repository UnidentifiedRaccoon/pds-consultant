import { Bot } from 'grammy';
import { config } from '../src/config/env.js';
import { logger } from '../src/logger.js';

/**
 * Создает экземпляр бота для управления webhook
 */
function createBotInstance(): Bot {
  return new Bot(config.TELEGRAM_BOT_TOKEN);
}

/**
 * Устанавливает webhook в Telegram Bot API
 */
export async function setWebhook(webhookUrl: string): Promise<boolean> {
  try {
    const bot = createBotInstance();
    await bot.api.setWebhook(webhookUrl, {
      secret_token: config.WEBHOOK_SECRET,
    });
    logger.info({ webhookUrl }, 'Webhook successfully set');
    return true;
  } catch (error) {
    logger.error(
      { error: error instanceof Error ? error.message : String(error) },
      'Error setting webhook'
    );
    return false;
  }
}

/**
 * Получает информацию о текущем webhook
 */
export async function getWebhookInfo() {
  try {
    const bot = createBotInstance();
    const info = await bot.api.getWebhookInfo();
    return info;
  } catch (error) {
    logger.error(
      { error: error instanceof Error ? error.message : String(error) },
      'Error getting webhook info'
    );
    return null;
  }
}

/**
 * Удаляет webhook
 */
export async function deleteWebhook(): Promise<boolean> {
  try {
    const bot = createBotInstance();
    await bot.api.deleteWebhook();
    logger.info('Webhook successfully deleted');
    return true;
  } catch (error) {
    logger.error(
      { error: error instanceof Error ? error.message : String(error) },
      'Error deleting webhook'
    );
    return false;
  }
}

export const webhookManager = {
  setWebhook,
  getWebhookInfo,
  deleteWebhook,
};

export default webhookManager;
