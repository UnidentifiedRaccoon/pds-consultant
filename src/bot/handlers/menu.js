/**
 * Обработчики меню для ПДС-калькулятора
 */

import { sessionStore } from '../session/memoryStore.js';
import { getNextState } from '../state/machine.js';
import {
  createMainMenuKeyboard,
  createBackToMainKeyboard,
  createResultInlineKeyboard,
} from '../keyboards.js';
import { calculatePDS, formatCalculationResult } from '../calculator/pds.js';

/**
 * Обработчик команды /start
 */
export function handleStartCommand(bot, chatId) {
  sessionStore.createSession(chatId);

  const message = `👋 Привет! Я PDS Consultant.

🎯 Что я умею:
• 💰 Рассчитать необходимый взнос для желаемой выплаты
• 🏦 Спрогнозировать капитал к определённому возрасту
• 💸 Показать результат от регулярных взносов

🚀 Выберите сценарий расчёта:`;

  bot.sendMessage(chatId, message, createMainMenuKeyboard());
}

/**
 * Обработчик команды /menu
 */
export function handleMenuCommand(bot, chatId) {
  sessionStore.createSession(chatId);

  const message = `🏠 Главное меню

🎯 Выберите сценарий расчёта ПДС:`;

  bot.sendMessage(chatId, message, createMainMenuKeyboard());
}

/**
 * Обработчик текстовых сообщений
 */
export function handleTextMessage(bot, chatId, message) {
  let session = sessionStore.getSession(chatId);

  // Если сессии нет, создаём новую
  if (!session) {
    session = sessionStore.createSession(chatId);
  }

  // Обрабатываем переход состояния
  const transition = getNextState(session, message);

  // Обновляем состояние сессии
  session.state = transition.nextState;
  sessionStore.updateSession(session);

  // Если есть ошибка, увеличиваем счётчик ошибок
  if (transition.error) {
    sessionStore.incrementErrorCount(chatId);
  } else {
    sessionStore.resetErrorCount(chatId);
  }

  // Отправляем ответ
  const options = {
    parse_mode: 'HTML',
  };

  if (transition.keyboard) {
    Object.assign(options, transition.keyboard);
  }

  bot.sendMessage(chatId, transition.message, options);

  // Если переходим в состояние расчёта, выполняем расчёт
  if (transition.nextState === 'calculation') {
    setTimeout(() => {
      performCalculation(bot, chatId, session);
    }, 1000);
  }
}

/**
 * Обработчик callback-запросов (нажатия inline-кнопок)
 */
export function handleCallbackQuery(bot, callbackQuery) {
  const chatId = callbackQuery.message.chat.id;
  const data = callbackQuery.data;

  // Подтверждаем callback
  bot.answerCallbackQuery(callbackQuery.id);

  let session = sessionStore.getSession(chatId);

  if (!session) {
    session = sessionStore.createSession(chatId);
  }

  // Обрабатываем callback как текстовое сообщение
  handleTextMessage(bot, chatId, data);
}

/**
 * Выполняет расчёт и отправляет результат
 */
function performCalculation(bot, chatId, session) {
  try {
    const result = calculatePDS(session.data);
    const formattedResult = formatCalculationResult(result);

    const message = `📊 Результат расчёта ПДС

${formattedResult}

💡 Это предварительный расчёт. Для точных данных обратитесь к финансовому консультанту.`;

    bot.sendMessage(chatId, message, createResultInlineKeyboard());

    // Сбрасываем сессию после расчёта
    sessionStore.deleteSession(chatId);
  } catch (error) {
    console.error('Ошибка при расчёте:', error);
    bot.sendMessage(
      chatId,
      '❌ Произошла ошибка при расчёте. Попробуйте ещё раз.',
      createBackToMainKeyboard()
    );
  }
}

/**
 * Обработчик неизвестных команд
 */
export function handleUnknownCommand(bot, chatId, _message) {
  const response = `❓ Не понимаю эту команду.

💡 Что можно сделать:
• Используйте кнопки ниже
• Отправьте /start для перезапуска
• Отправьте /menu для главного меню`;

  bot.sendMessage(chatId, response, createBackToMainKeyboard());
}
