/**
 * Обработчики меню для ПДС-калькулятора
 */

import { sessionStore } from '../session/memoryStore.js';
import { getNextState } from '../state/machine.js';
import { createBackToMainKeyboard } from '../keyboards.js';
import {
  handleGoalSelection,
  handleUserInput,
  handlePayoutStartSelection,
  handleYesNoSelection,
  completeCalculation,
  isInCalculator,
  CALCULATION_GOALS,
} from '../../calculator/index.js';
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
  // Сначала проверяем, находится ли пользователь в процессе нового калькулятора
  if (isInCalculator(chatId)) {
    handleUserInput(chatId, message, bot);
    return;
  }

  // Если не в калькуляторе, используем старую логику FSM
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
      bot.sendMessage(chatId, MESSAGES.INFO_ABOUT_PDS, {
        ...createInfoKeyboard(),
        parse_mode: 'HTML',
        disable_web_page_preview: true,
      });
      break;

    case MESSAGES.CALLBACK_DATA.CONSULTATION:
      bot.sendMessage(chatId, MESSAGES.INFO_ABOUT_PDS, {
        ...createInfoKeyboard(),
        parse_mode: 'HTML',
        disable_web_page_preview: true,
      });
      break;

    case MESSAGES.CALLBACK_DATA.MAIN_MENU:
      bot.sendMessage(chatId, MESSAGES.WELCOME, createMainKeyboard());
      break;

    // Обработка кнопок сценариев расчёта - используем новую логику калькулятора
    case MESSAGES.CALLBACK_DATA.GOAL_ADDITIONAL_PAYMENT:
      bot.answerCallbackQuery(callbackQuery.id, { text: 'Выбрана дополнительная выплата' });
      handleGoalSelection(chatId, CALCULATION_GOALS.ADDITIONAL_PAYMENT, bot);
      break;

    case MESSAGES.CALLBACK_DATA.GOAL_CAPITAL_TO_PAYOUT:
      bot.answerCallbackQuery(callbackQuery.id, { text: 'Выбран капитал к началу выплат' });
      handleGoalSelection(chatId, CALCULATION_GOALS.CAPITAL_TO_PAYOUT, bot);
      break;

    case MESSAGES.CALLBACK_DATA.GOAL_NO_GOAL:
      bot.answerCallbackQuery(callbackQuery.id, { text: 'Выбрано без цели' });
      handleGoalSelection(chatId, CALCULATION_GOALS.NO_GOAL, bot);
      break;

    // Обработка callback-запросов для новой логики калькулятора
    case MESSAGES.CALLBACK_DATA.PAYOUT_BY_RULE:
      bot.answerCallbackQuery(callbackQuery.id, { text: 'По общему правилу' });
      handlePayoutStartSelection(chatId, 'rule', bot);
      break;

    case MESSAGES.CALLBACK_DATA.PAYOUT_IN_YEARS:
      bot.answerCallbackQuery(callbackQuery.id, { text: 'Через N лет' });
      handlePayoutStartSelection(chatId, 'years', bot);
      break;

    case MESSAGES.CALLBACK_DATA.YES:
      bot.answerCallbackQuery(callbackQuery.id, { text: 'Да' });
      handleYesNoSelection(chatId, true, bot);
      break;

    case MESSAGES.CALLBACK_DATA.NO:
      bot.answerCallbackQuery(callbackQuery.id, { text: 'Нет' });
      handleYesNoSelection(chatId, false, bot);
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
function performCalculation(bot, chatId, _session) {
  try {
    // Используем новую логику калькулятора
    completeCalculation(chatId, bot);

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
