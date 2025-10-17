import { Bot, session } from 'grammy';
import { conversations, createConversation } from '@grammyjs/conversations';
import { config } from '../config/env.js';
import { attachBotHandlers } from './attachBotHandlers.js';
import { capitalFlow } from './conversations/capitalFlow.js';
import type { MyContext } from './types.js';

export function createWebhookBot(): Bot<MyContext> {
  const bot = new Bot<MyContext>(config.TELEGRAM_BOT_TOKEN);

  // Session middleware (нужен для conversations)
  bot.use(session({ initial: () => ({}) }));

  // Conversations plugin
  bot.use(conversations());

  // Регистрация conversations
  bot.use(createConversation<MyContext, MyContext>(capitalFlow));

  // Обработчики команд и callback
  attachBotHandlers(bot);

  return bot;
}
