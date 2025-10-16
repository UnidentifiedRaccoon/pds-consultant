/**
 * Логика вопросов пошагового калькулятора
 */

import { CALCULATOR_STEPS } from './state.js';
import {
  createGoalSelectionKeyboard,
  createPayoutStartKeyboard,
  createYesNoKeyboard,
  createTooManyErrorsKeyboard,
  createContributionTypeKeyboard,
  createHorizonTypeKeyboard,
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
    case CALCULATOR_STEPS.TARGET_PAYMENT:
      question = MESSAGES.CALCULATOR_QUESTIONS.TARGET_PAYMENT;
      break;
    case CALCULATOR_STEPS.PAYOUT_START:
      question = MESSAGES.CALCULATOR_QUESTIONS.PAYOUT_START;
      keyboard = createPayoutStartKeyboard();
      break;
    case CALCULATOR_STEPS.PAYOUT_YEARS:
      question = MESSAGES.CALCULATOR_QUESTIONS.PAYOUT_YEARS;
      break;
    case CALCULATOR_STEPS.EXPECTED_RETURN:
      question = MESSAGES.CALCULATOR_QUESTIONS.EXPECTED_RETURN;
      break;
    case CALCULATOR_STEPS.STARTING_CAPITAL:
      question = MESSAGES.CALCULATOR_QUESTIONS.STARTING_CAPITAL;
      break;
    case CALCULATOR_STEPS.OPS_TRANSFER:
      question = MESSAGES.CALCULATOR_QUESTIONS.OPS_TRANSFER;
      break;
    case CALCULATOR_STEPS.TAX_RATE:
      question = MESSAGES.CALCULATOR_QUESTIONS.TAX_RATE;
      break;
    case CALCULATOR_STEPS.USED_OTHER_LIMIT:
      question = MESSAGES.CALCULATOR_QUESTIONS.USED_OTHER_LIMIT;
      break;
    case CALCULATOR_STEPS.REINVEST_TAX:
      question = MESSAGES.CALCULATOR_QUESTIONS.REINVEST_TAX;
      keyboard = createYesNoKeyboard();
      break;
    // Новые шаги для сценариев 2 и 3
    case CALCULATOR_STEPS.CONTRIBUTION_TYPE:
      question = MESSAGES.CALCULATOR_QUESTIONS.CONTRIBUTION_TYPE;
      keyboard = createContributionTypeKeyboard();
      break;
    case CALCULATOR_STEPS.MONTHLY_CONTRIBUTION:
      question = MESSAGES.CALCULATOR_QUESTIONS.MONTHLY_CONTRIBUTION;
      break;
    case CALCULATOR_STEPS.ANNUAL_CONTRIBUTION:
      question = MESSAGES.CALCULATOR_QUESTIONS.ANNUAL_CONTRIBUTION;
      break;
    case CALCULATOR_STEPS.HORIZON_TYPE:
      question = MESSAGES.CALCULATOR_QUESTIONS.HORIZON_TYPE;
      keyboard = createHorizonTypeKeyboard();
      break;
    case CALCULATOR_STEPS.HORIZON_AGE:
      question = MESSAGES.CALCULATOR_QUESTIONS.HORIZON_AGE;
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
export function getNextStep(currentStep, goal = null) {
  // Определяем порядок шагов в зависимости от цели
  let stepOrder;

  if (goal === 'additional_payment') {
    // Сценарий 1: Дополнительная выплата
    stepOrder = [
      CALCULATOR_STEPS.GENDER,
      CALCULATOR_STEPS.AGE,
      CALCULATOR_STEPS.INCOME,
      CALCULATOR_STEPS.TARGET_PAYMENT,
      CALCULATOR_STEPS.PAYOUT_START,
      CALCULATOR_STEPS.PAYOUT_YEARS,
      CALCULATOR_STEPS.EXPECTED_RETURN,
      CALCULATOR_STEPS.STARTING_CAPITAL,
      CALCULATOR_STEPS.OPS_TRANSFER,
      CALCULATOR_STEPS.TAX_RATE,
      CALCULATOR_STEPS.USED_OTHER_LIMIT,
      CALCULATOR_STEPS.REINVEST_TAX,
      CALCULATOR_STEPS.COMPLETED,
    ];
  } else if (goal === 'capital_to_payout' || goal === 'no_goal') {
    // Сценарии 2 и 3: Капитал к началу выплат / Без цели
    stepOrder = [
      CALCULATOR_STEPS.GENDER,
      CALCULATOR_STEPS.AGE,
      CALCULATOR_STEPS.INCOME,
      CALCULATOR_STEPS.CONTRIBUTION_TYPE,
      CALCULATOR_STEPS.MONTHLY_CONTRIBUTION, // или ANNUAL_CONTRIBUTION
      CALCULATOR_STEPS.HORIZON_TYPE,
      CALCULATOR_STEPS.HORIZON_AGE, // или PAYOUT_YEARS
      CALCULATOR_STEPS.EXPECTED_RETURN,
      CALCULATOR_STEPS.STARTING_CAPITAL,
      CALCULATOR_STEPS.OPS_TRANSFER,
      CALCULATOR_STEPS.TAX_RATE,
      CALCULATOR_STEPS.USED_OTHER_LIMIT,
      CALCULATOR_STEPS.REINVEST_TAX,
      CALCULATOR_STEPS.COMPLETED,
    ];
  } else {
    // По умолчанию - сценарий 1
    stepOrder = [
      CALCULATOR_STEPS.GENDER,
      CALCULATOR_STEPS.AGE,
      CALCULATOR_STEPS.INCOME,
      CALCULATOR_STEPS.TARGET_PAYMENT,
      CALCULATOR_STEPS.PAYOUT_START,
      CALCULATOR_STEPS.PAYOUT_YEARS,
      CALCULATOR_STEPS.EXPECTED_RETURN,
      CALCULATOR_STEPS.STARTING_CAPITAL,
      CALCULATOR_STEPS.OPS_TRANSFER,
      CALCULATOR_STEPS.TAX_RATE,
      CALCULATOR_STEPS.USED_OTHER_LIMIT,
      CALCULATOR_STEPS.REINVEST_TAX,
      CALCULATOR_STEPS.COMPLETED,
    ];
  }

  const currentIndex = stepOrder.indexOf(currentStep);
  return stepOrder[currentIndex + 1] || CALCULATOR_STEPS.COMPLETED;
}
