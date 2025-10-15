/**
 * Логика вопросов пошагового калькулятора
 */

import { CALCULATOR_STEPS } from './state.js';
import {
  createGoalSelectionKeyboard,
  createPayoutStartKeyboard,
  createYesNoKeyboard,
  createTooManyErrorsKeyboard,
  MESSAGES,
} from '../bot/messages.js';

/**
 * Задает следующий вопрос в зависимости от текущего шага
 * @param {number} chatId - ID чата
 * @param {Object} bot - Экземпляр бота
 * @param {Object} session - Сессия калькулятора
 */
export async function askNextQuestion(chatId, bot, session) {
  const { step } = session;
  let question = '';
  let keyboard = null;

  switch (step) {
    case CALCULATOR_STEPS.GENDER:
      question = MESSAGES.CALCULATOR_QUESTIONS.GENDER;
      break;
    case CALCULATOR_STEPS.AGE:
      question = MESSAGES.CALCULATOR_QUESTIONS.AGE;
      break;
    case CALCULATOR_STEPS.INCOME:
      question = MESSAGES.CALCULATOR_QUESTIONS.INCOME;
      break;
    case CALCULATOR_STEPS.PAYOUT_START:
      question = MESSAGES.CALCULATOR_QUESTIONS.PAYOUT_START;
      keyboard = createPayoutStartKeyboard();
      break;
    case CALCULATOR_STEPS.PAYOUT_YEARS:
      question = MESSAGES.CALCULATOR_QUESTIONS.PAYOUT_YEARS;
      break;
    case CALCULATOR_STEPS.STARTING_CAPITAL:
      question = MESSAGES.CALCULATOR_QUESTIONS.STARTING_CAPITAL;
      break;
    case CALCULATOR_STEPS.TAX_RATE:
      question = MESSAGES.CALCULATOR_QUESTIONS.TAX_RATE;
      break;
    case CALCULATOR_STEPS.REINVEST_TAX:
      question = MESSAGES.CALCULATOR_QUESTIONS.REINVEST_TAX;
      keyboard = createYesNoKeyboard();
      break;
    default:
      return false; // Завершение опроса
  }

  if (keyboard) {
    await bot.sendMessage(chatId, question, keyboard);
  } else {
    await bot.sendMessage(chatId, question);
  }

  return true;
}

/**
 * Показывает выбор цели расчета
 * @param {number} chatId - ID чата
 * @param {Object} bot - Экземпляр бота
 */
export async function showGoalSelection(chatId, bot) {
  const keyboard = createGoalSelectionKeyboard();
  await bot.sendMessage(chatId, MESSAGES.CALCULATOR_GOAL_SELECTION, keyboard);
}

/**
 * Обрабатывает превышение лимита ошибок
 * @param {number} chatId - ID чата
 * @param {Object} bot - Экземпляр бота
 */
export async function handleTooManyErrors(chatId, bot) {
  const keyboard = createTooManyErrorsKeyboard();
  await bot.sendMessage(chatId, MESSAGES.TOO_MANY_ERRORS, keyboard);
}

/**
 * Получает следующий шаг в последовательности
 * @param {string} currentStep - Текущий шаг
 * @returns {string} Следующий шаг
 */
export function getNextStep(currentStep) {
  const stepOrder = [
    CALCULATOR_STEPS.GENDER,
    CALCULATOR_STEPS.AGE,
    CALCULATOR_STEPS.INCOME,
    CALCULATOR_STEPS.PAYOUT_START,
    CALCULATOR_STEPS.PAYOUT_YEARS,
    CALCULATOR_STEPS.STARTING_CAPITAL,
    CALCULATOR_STEPS.TAX_RATE,
    CALCULATOR_STEPS.REINVEST_TAX,
    CALCULATOR_STEPS.COMPLETED,
  ];

  const currentIndex = stepOrder.indexOf(currentStep);
  return stepOrder[currentIndex + 1] || CALCULATOR_STEPS.COMPLETED;
}
