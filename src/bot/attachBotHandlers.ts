import { Bot } from 'grammy';
import {
  MESSAGES,
  createMainKeyboard,
  createCalculateKeyboard,
  createInfoKeyboard,
  createConsultationKeyboard,
  createBackToMenuKeyboard,
} from './messages.js';
import { sendPdfReport } from './conversations/capitalFlow.js';
import { logger } from '../logger.js';
import type { MyContext } from './types.js';
import { fetchConsultationReply } from '../services/yandexGpt.js';

function resetConsultation(ctx: MyContext): void {
  if (ctx.session.consultation) {
    ctx.session.consultation = undefined;
  }
}

export function attachBotHandlers(bot: Bot<MyContext>): void {
  if (!bot) {
    throw new Error('Bot instance is required');
  }

  // Команда /start
  bot.command('start', async (ctx) => {
    try {
      resetConsultation(ctx);
      await ctx.reply(MESSAGES.WELCOME, createMainKeyboard());
    } catch (error) {
      logger.error({ err: error, chatId: ctx.chat?.id }, 'start:error');
    }
  });

  // Главное меню
  bot.callbackQuery('calculate', async (ctx) => {
    resetConsultation(ctx);
    await ctx.answerCallbackQuery();
    await ctx.reply(MESSAGES.CALCULATE_PROMPT, createCalculateKeyboard());
  });

  bot.callbackQuery('info', async (ctx) => {
    resetConsultation(ctx);
    await ctx.answerCallbackQuery();
    await ctx.reply(MESSAGES.INFO_ABOUT_PDS, {
      parse_mode: 'HTML',
      link_preview_options: { is_disabled: true },
      ...createInfoKeyboard(),
    });
  });

  bot.callbackQuery('consultation', async (ctx) => {
    await ctx.answerCallbackQuery();
    ctx.session.consultation = { history: [] };
    logger.info({ chatId: ctx.chat?.id }, 'consultation:mode:entered');
    await ctx.reply(MESSAGES.CONSULTATION.PROMPT, createBackToMenuKeyboard());
  });

  // Сценарии расчета
  bot.callbackQuery('calculate_extra_payout', async (ctx) => {
    resetConsultation(ctx);
    await ctx.answerCallbackQuery();
    await ctx.reply(MESSAGES.CALCULATE_RESPONSES.EXTRA_PAYOUT);
  });

  bot.callbackQuery('calculate_capital', async (ctx) => {
    resetConsultation(ctx);
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
    resetConsultation(ctx);
    await ctx.answerCallbackQuery();
    await ctx.conversation.enter('capitalFlow');
  });

  bot.callbackQuery('calculate_without_goal', async (ctx) => {
    resetConsultation(ctx);
    await ctx.answerCallbackQuery();
    await ctx.reply(MESSAGES.CALCULATE_RESPONSES.WITHOUT_GOAL);
  });

  // PDF отчет
  bot.callbackQuery('capital_pdf', async (ctx) => {
    resetConsultation(ctx);
    await ctx.answerCallbackQuery();
    await sendPdfReport(ctx);
  });

  // Возврат в главное меню
  bot.callbackQuery('start', async (ctx) => {
    resetConsultation(ctx);
    await ctx.answerCallbackQuery();
    await ctx.reply(MESSAGES.WELCOME, createMainKeyboard());
  });

  bot.on('message:text', async (ctx, next) => {
    logger.debug(
      {
        chatId: ctx.chat?.id,
        hasConsultation: Boolean(ctx.session.consultation),
        text: ctx.message.text,
      },
      'message:text:received'
    );
    if (!ctx.session.consultation) {
      await next();
      return;
    }

    const userText = ctx.message.text.trim();
    if (!userText) {
      return;
    }

    const history = ctx.session.consultation.history ?? [];
    const chatId = ctx.chat?.id;
    const placeholder = await ctx.reply(MESSAGES.CONSULTATION.THINKING);
    let placeholderRemoved = false;

    const removePlaceholder = async () => {
      if (placeholderRemoved || !chatId) {
        return;
      }
      try {
        await ctx.api.deleteMessage(chatId, placeholder.message_id);
      } catch (deleteError) {
        logger.warn(
          { err: deleteError, chatId, messageId: placeholder.message_id },
          'consultation:placeholder:delete_failed'
        );
      } finally {
        placeholderRemoved = true;
      }
    };

    try {
      const answer = await fetchConsultationReply(history, userText);

      ctx.session.consultation.history = answer.history;

      await removePlaceholder();

      logger.info(
        { chatId: ctx.chat?.id, promptLength: userText.length, replyLength: answer.text.length },
        'consultation:reply:sent'
      );
      await ctx.reply(answer.text, createConsultationKeyboard());
    } catch (error) {
      await removePlaceholder();
      logger.error({ err: error, chatId: ctx.chat?.id }, 'consultation:error');
      await ctx.reply(MESSAGES.CONSULTATION.API_ERROR, createConsultationKeyboard());
    }
  });
}
