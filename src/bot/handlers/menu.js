/**
 * Обработчики меню для ПДС-калькулятора
 */

import { sessionStore } from '../session/memoryStore.js';
import { getNextState } from '../state/machine.js';
import {
  createBackToMainKeyboard,
  createResultInlineKeyboard,
  createGenderKeyboard,
} from '../keyboards.js';
import { calculatePDS, formatCalculationResult } from '../calculator/pds.js';
import {
  MESSAGES,
  createMainKeyboard,
  createGoalSelectionKeyboard,
  createInfoKeyboard,
} from '../messages.js';

/**
 * Обработчик команды /start
 */
export function handleStartCommand(bot, chatId) {
  sessionStore.createSession(chatId);

  bot.sendMessage(chatId, MESSAGES.WELCOME, createMainKeyboard());
}

/**
 * Обработчик команды /menu
 */
export function handleMenuCommand(bot, chatId) {
  sessionStore.createSession(chatId);

  bot.sendMessage(chatId, MESSAGES.WELCOME, createMainKeyboard());
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

  // Обрабатываем различные callback данные
  switch (data) {
    case MESSAGES.CALLBACK_DATA.CALCULATE:
      bot.sendMessage(chatId, MESSAGES.CALCULATOR_GOAL_SELECTION, createGoalSelectionKeyboard());
      break;

    case MESSAGES.CALLBACK_DATA.INFO:
      bot.sendMessage(chatId, MESSAGES.INFO_ABOUT_PDS, createInfoKeyboard());
      break;

    case MESSAGES.CALLBACK_DATA.CONSULTATION:
      bot.sendMessage(chatId, MESSAGES.INFO_ABOUT_PDS, createInfoKeyboard());
      break;

    case MESSAGES.CALLBACK_DATA.MAIN_MENU:
      bot.sendMessage(chatId, MESSAGES.WELCOME, createMainKeyboard());
      break;

    // Обработка кнопок сценариев расчёта
    case MESSAGES.CALLBACK_DATA.GOAL_ADDITIONAL_PAYMENT:
      // Переводим в состояние выбора пола для сценария "Дополнительная выплата"
      session.state = 'gender_selection';
      session.data = { scenario: 'additional_payment' };
      sessionStore.updateSession(session);
      bot.sendMessage(chatId, '👤 Выберите пол для обращения:', createGenderKeyboard());
      break;

    case MESSAGES.CALLBACK_DATA.GOAL_CAPITAL_TO_PAYOUT:
      // Переводим в состояние выбора пола для сценария "Капитал к началу выплат"
      session.state = 'gender_selection';
      session.data = { scenario: 'capital_to_payout' };
      sessionStore.updateSession(session);
      bot.sendMessage(chatId, '👤 Выберите пол для обращения:', createGenderKeyboard());
      break;

    case MESSAGES.CALLBACK_DATA.GOAL_NO_GOAL:
      // Переводим в состояние выбора пола для сценария "Без цели"
      session.state = 'gender_selection';
      session.data = { scenario: 'no_goal' };
      sessionStore.updateSession(session);
      bot.sendMessage(chatId, '👤 Выберите пол для обращения:', createGenderKeyboard());
      break;

    default:
      // Для остальных callback обрабатываем как текстовое сообщение
      handleTextMessage(bot, chatId, data);
      break;
  }
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
