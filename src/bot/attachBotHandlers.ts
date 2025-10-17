import { Bot } from 'grammy';
import { MESSAGES, createMainKeyboard, createCalculateKeyboard } from './messages.js';
import { sendPdfReport } from './conversations/capitalFlow.js';
import { logger } from '../logger.js';
import type { MyContext } from './types.js';

export function attachBotHandlers(bot: Bot<MyContext>): void {
  if (!bot) {
    throw new Error('Bot instance is required');
  }

  // Команда /start
  bot.command('start', async (ctx) => {
    try {
      await ctx.reply(MESSAGES.WELCOME, createMainKeyboard());
    } catch (error) {
      logger.error({ err: error, chatId: ctx.chat?.id }, 'start:error');
    }
  });

  // Главное меню
  bot.callbackQuery('calculate', async (ctx) => {
    await ctx.answerCallbackQuery();
    await ctx.reply(MESSAGES.CALCULATE_PROMPT, createCalculateKeyboard());
  });

  bot.callbackQuery('info', async (ctx) => {
    await ctx.answerCallbackQuery();
    await ctx.reply(MESSAGES.INFO_ABOUT_PDS, {
      parse_mode: 'HTML',
      link_preview_options: { is_disabled: true },
      ...createMainKeyboard(),
    });
  });

  // Сценарии расчета
  bot.callbackQuery('calculate_extra_payout', async (ctx) => {
    await ctx.answerCallbackQuery();
    await ctx.reply(MESSAGES.CALCULATE_RESPONSES.EXTRA_PAYOUT);
  });

  bot.callbackQuery('calculate_capital', async (ctx) => {
    await ctx.answerCallbackQuery();
    await ctx.reply(MESSAGES.CAPITAL_FLOW.INTRO, {
      reply_markup: {
        inline_keyboard: [
          [{ text: MESSAGES.BUTTONS.CAPITAL_CONTINUE, callback_data: 'capital_start' }],
        ],
      },
    });
  });

  bot.callbackQuery('capital_start', async (ctx) => {
    await ctx.answerCallbackQuery();
    await ctx.conversation.enter('capitalFlow');
  });

  bot.callbackQuery('calculate_without_goal', async (ctx) => {
    await ctx.answerCallbackQuery();
    await ctx.reply(MESSAGES.CALCULATE_RESPONSES.WITHOUT_GOAL);
  });

  // PDF отчет
  bot.callbackQuery('capital_pdf', async (ctx) => {
    await ctx.answerCallbackQuery();
    await sendPdfReport(ctx);
  });

  // Возврат в главное меню
  bot.callbackQuery('start', async (ctx) => {
    await ctx.answerCallbackQuery();
    await ctx.reply(MESSAGES.WELCOME, createMainKeyboard());
  });
}
