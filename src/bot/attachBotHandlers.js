import { MESSAGES, createMainKeyboard } from './messages.js';
import { logger } from '../logger.js';

/**
 * Обработка команд пользователя
 */
async function handleCommand(chatId, command, bot) {
  switch (command) {
    case 'start': {
      const keyboard = createMainKeyboard();
      await bot.sendMessage(chatId, MESSAGES.WELCOME, keyboard);
      break;
    }
    case 'calculate': {
      await bot.sendMessage(
        chatId,
        '🚧 Функция расчёта находится в разработке. Скоро будет доступна!'
      );
      break;
    }
    case 'info': {
      await bot.sendMessage(chatId, MESSAGES.INFO_ABOUT_PDS, {
        parse_mode: 'HTML',
        disable_web_page_preview: true,
        ...createMainKeyboard(),
      });
      break;
    }
    default:
      await bot.sendMessage(chatId, MESSAGES.UNKNOWN_COMMAND, createMainKeyboard());
  }
}

export function attachBotHandlers(bot) {
  // Обработчик команд /start
  bot.onText(/^\/(start|clear)\b/, async (msg) => {
    const chatId = msg.chat.id;
    const command = msg.text.split(' ')[0].substring(1); // убираем /
    await handleCommand(chatId, command, bot);
  });

  // Обработчик текстовых команд
  bot.onText(/^(рассчитать|что такое пдс\?*)$/i, async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text.toLowerCase().trim();

    if (text === 'рассчитать') {
      await handleCommand(chatId, 'calculate', bot);
    } else if (text === 'что такое пдс' || text === 'что такое пдс?') {
      await handleCommand(chatId, 'info', bot);
    }
  });

  // Обработчик обычных сообщений
  bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const text = (msg.text ?? '').trim();
    if (!text || text.startsWith('/')) return;

    // Простые ответы на основе ключевых слов
    if (text.toLowerCase().includes('рассчитать') || text.toLowerCase().includes('расчет')) {
      await handleCommand(chatId, 'calculate', bot);
    } else if (text.toLowerCase().includes('пдс')) {
      await handleCommand(chatId, 'info', bot);
    } else {
      await bot.sendMessage(chatId, 'Используйте кнопки ниже для навигации.', createMainKeyboard());
    }
  });

  // Обработчик нажатий на кнопки
  bot.on('callback_query', async (callbackQuery) => {
    const chatId = callbackQuery.message.chat.id;
    const data = callbackQuery.data;

    try {
      // Отвечаем на callback
      const responseText = MESSAGES.CALLBACK_RESPONSES[data.toUpperCase()] || 'OK';
      await bot.answerCallbackQuery(callbackQuery.id, { text: responseText });

      // Выполняем команду
      await handleCommand(chatId, data, bot);
    } catch (e) {
      logger.error({ chatId, err: e }, 'callback:error');
      await bot.answerCallbackQuery(callbackQuery.id, {
        text: MESSAGES.CALLBACK_RESPONSES.ERROR,
      });
    }
  });

  bot.on('polling_error', (err) => logger.error({ err }, 'polling:error'));
}
