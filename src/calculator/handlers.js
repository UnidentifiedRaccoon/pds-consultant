/**
 * Обработчики событий пошагового калькулятора
 */

import {
  CALCULATOR_STEPS,
  CALCULATION_GOALS,
  createCalculatorSession,
  getCalculatorSession,
  updateCalculatorSession,
  deleteCalculatorSession,
} from './state.js';
import {
  validateGender,
  validateAge,
  validateIncome,
  validatePayoutYears,
  validateStartingCapital,
  validateTaxRate,
  validateYesNo,
  getErrorMessage,
} from './validators.js';
import {
  askNextQuestion,
  showGoalSelection,
  handleTooManyErrors,
  getNextStep,
} from './questions.js';
import { createBackToMainKeyboard, MESSAGES } from '../bot/messages.js';
import { logger } from '../logger.js';

const MAX_RETRIES = 3;

/**
 * Начинает процесс расчета
 * @param {number} chatId - ID чата
 * @param {Object} bot - Экземпляр бота
 */
export async function startCalculator(chatId, bot) {
  try {
    // Создаем новую сессию
    createCalculatorSession(chatId);

    // Показываем выбор цели
    await showGoalSelection(chatId, bot);
  } catch (error) {
    logger.error({ chatId, error }, 'calculator:start:error');
    await bot.sendMessage(chatId, 'Произошла ошибка при запуске калькулятора');
  }
}

/**
 * Обрабатывает выбор цели
 * @param {number} chatId - ID чата
 * @param {string} goal - Выбранная цель
 * @param {Object} bot - Экземпляр бота
 */
export async function handleGoalSelection(chatId, goal, bot) {
  const session = getCalculatorSession(chatId);
  if (!session) {
    await startCalculator(chatId, bot);
    return;
  }

  // Обновляем сессию с выбранной целью
  updateCalculatorSession(chatId, { goal });

  if (goal === CALCULATION_GOALS.ADDITIONAL_PAYMENT) {
    // Начинаем пошаговый опрос
    await askNextQuestion(chatId, bot, session);
  } else {
    // Показываем заглушку для других целей
    await bot.sendMessage(chatId, MESSAGES.FEATURE_IN_DEVELOPMENT);
    const keyboard = createBackToMainKeyboard();
    await bot.sendMessage(chatId, 'Выбери действие:', keyboard);
    deleteCalculatorSession(chatId);
  }
}

/**
 * Обрабатывает ответ пользователя на вопрос
 * @param {number} chatId - ID чата
 * @param {string} input - Ввод пользователя
 * @param {Object} bot - Экземпляр бота
 */
export async function handleUserInput(chatId, input, bot) {
  const session = getCalculatorSession(chatId);
  if (!session) {
    return false; // Не в процессе калькулятора
  }

  const { step, retries } = session;
  let validation = null;

  // Валидируем ввод в зависимости от текущего шага
  switch (step) {
    case CALCULATOR_STEPS.GENDER:
      validation = validateGender(input);
      break;
    case CALCULATOR_STEPS.AGE:
      validation = validateAge(input);
      break;
    case CALCULATOR_STEPS.INCOME:
      validation = validateIncome(input);
      break;
    case CALCULATOR_STEPS.PAYOUT_YEARS:
      validation = validatePayoutYears(input);
      break;
    case CALCULATOR_STEPS.STARTING_CAPITAL:
      validation = validateStartingCapital(input);
      break;
    case CALCULATOR_STEPS.TAX_RATE:
      validation = validateTaxRate(input);
      break;
    case CALCULATOR_STEPS.REINVEST_TAX:
      validation = validateYesNo(input);
      break;
    default:
      return false;
  }

  if (!validation.isValid) {
    // Неверный ввод
    const newRetries = retries + 1;

    if (newRetries >= MAX_RETRIES) {
      // Превышен лимит ошибок
      await handleTooManyErrors(chatId, bot);
      return true;
    }

    // Обновляем счетчик ошибок
    updateCalculatorSession(chatId, { retries: newRetries });

    // Показываем ошибку и повторяем вопрос
    await bot.sendMessage(chatId, getErrorMessage(validation.error));
    await askNextQuestion(chatId, bot, session);
    return true;
  }

  // Валидный ввод - сохраняем данные и переходим к следующему шагу
  const nextStep = getNextStep(step);
  const newData = { ...session.data, [step]: validation.value };

  updateCalculatorSession(chatId, {
    step: nextStep,
    data: newData,
    retries: 0, // Сбрасываем счетчик ошибок
  });

  await askNextQuestion(chatId, bot, { ...session, step: nextStep });
  return true;
}

/**
 * Обрабатывает выбор времени начала выплат
 * @param {number} chatId - ID чата
 * @param {string} payoutMode - Режим выплат
 * @param {Object} bot - Экземпляр бота
 */
export async function handlePayoutStartSelection(chatId, payoutMode, bot) {
  const session = getCalculatorSession(chatId);
  if (!session) {
    await startCalculator(chatId, bot);
    return;
  }

  const newData = { ...session.data, payoutStartMode: payoutMode };

  if (payoutMode === 'rule') {
    // По общему правилу - переходим к следующему шагу
    const nextStep = getNextStep(CALCULATOR_STEPS.PAYOUT_START);
    updateCalculatorSession(chatId, {
      step: nextStep,
      data: newData,
      retries: 0,
    });
    await askNextQuestion(chatId, bot, { ...session, step: nextStep });
  } else {
    // Через N лет - запрашиваем количество лет
    updateCalculatorSession(chatId, {
      step: CALCULATOR_STEPS.PAYOUT_YEARS,
      data: newData,
      retries: 0,
    });
    await askNextQuestion(chatId, bot, { ...session, step: CALCULATOR_STEPS.PAYOUT_YEARS });
  }
}

/**
 * Обрабатывает выбор Да/Нет
 * @param {number} chatId - ID чата
 * @param {boolean} value - Значение
 * @param {Object} bot - Экземпляр бота
 */
export async function handleYesNoSelection(chatId, value, bot) {
  const session = getCalculatorSession(chatId);
  if (!session) {
    await startCalculator(chatId, bot);
    return;
  }

  const { step } = session;
  const newData = { ...session.data, [step]: value };
  const nextStep = getNextStep(step);

  updateCalculatorSession(chatId, {
    step: nextStep,
    data: newData,
    retries: 0,
  });

  await askNextQuestion(chatId, bot, { ...session, step: nextStep });
}

/**
 * Обрабатывает запрос на начало сначала
 * @param {number} chatId - ID чата
 * @param {Object} bot - Экземпляр бота
 */
export async function handleStartAgain(chatId, bot) {
  deleteCalculatorSession(chatId);
  await bot.sendMessage(chatId, MESSAGES.SESSION_RESET);
  await startCalculator(chatId, bot);
}

/**
 * Обрабатывает отмену
 * @param {number} chatId - ID чата
 * @param {Object} bot - Экземпляр бота
 */
export async function handleCancel(chatId, bot) {
  deleteCalculatorSession(chatId);
  const keyboard = createBackToMainKeyboard();
  await bot.sendMessage(chatId, 'Расчёт отменён. Выбери действие:', keyboard);
}

/**
 * Завершает расчет и показывает результат
 * @param {number} chatId - ID чата
 * @param {Object} bot - Экземпляр бота
 */
export async function completeCalculation(chatId, bot) {
  const session = getCalculatorSession(chatId);
  if (!session) {
    await startCalculator(chatId, bot);
    return;
  }

  // Показываем сообщение о завершении сбора данных
  await bot.sendMessage(chatId, MESSAGES.DATA_COLLECTION_COMPLETE);

  // Заглушка расчета - просто показываем собранные данные
  const result = generateCalculationResult(session.data);
  await bot.sendMessage(chatId, result);

  // Удаляем сессию и показываем главное меню
  deleteCalculatorSession(chatId);
  const keyboard = createBackToMainKeyboard();
  await bot.sendMessage(chatId, 'Выбери действие:', keyboard);
}

/**
 * Генерирует результат расчета (заглушка)
 * @param {Object} data - Собранные данные
 * @returns {string} Результат расчета
 */
function generateCalculationResult(data) {
  return `📊 Результаты расчёта:

👤 Пол: ${data.gender === 'm' ? 'Мужской' : 'Женский'}
🎂 Возраст: ${data.age} лет
💵 Доход: ${data.income.toLocaleString()} руб/мес
📅 Начало выплат: ${data.payoutStartMode === 'rule' ? 'По общему правилу' : `Через ${data.payoutYears} лет`}
💰 Стартовый капитал: ${data.startingCapital.toLocaleString()} руб
📊 Ставка НДФЛ: ${data.taxRate}%
🔄 Реинвестирование вычета: ${data.reinvestTax ? 'Да' : 'Нет'}

🛠️ Расчёт будет реализован в следующих версиях.`;
}

/**
 * Проверяет, находится ли пользователь в процессе калькулятора
 * @param {number} chatId - ID чата
 * @returns {boolean} true если в процессе калькулятора
 */
export function isInCalculator(chatId) {
  const session = getCalculatorSession(chatId);
  return session !== null;
}
