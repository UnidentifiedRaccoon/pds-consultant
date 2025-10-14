/**
 * Пошаговый калькулятор ПДС
 * Управляет процессом сбора данных и валидации
 */

import {
  CALCULATOR_STEPS,
  CALCULATION_GOALS,
  createCalculatorSession,
  getCalculatorSession,
  updateCalculatorSession,
  deleteCalculatorSession,
} from '../storage/calculatorState.js';
import {
  MESSAGES,
  createGoalSelectionKeyboard,
  createPayoutStartKeyboard,
  createYesNoKeyboard,
  createTooManyErrorsKeyboard,
  createBackToMainKeyboard,
} from './messages.js';
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
 * Показывает выбор цели расчета
 * @param {number} chatId - ID чата
 * @param {Object} bot - Экземпляр бота
 */
async function showGoalSelection(chatId, bot) {
  const keyboard = createGoalSelectionKeyboard();
  await bot.sendMessage(chatId, MESSAGES.CALCULATOR_GOAL_SELECTION, keyboard);
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
    await askNextQuestion(chatId, bot);
  } else {
    // Показываем заглушку для других целей
    await bot.sendMessage(chatId, MESSAGES.FEATURE_IN_DEVELOPMENT);
    const keyboard = createBackToMainKeyboard();
    await bot.sendMessage(chatId, 'Выбери действие:', keyboard);
    deleteCalculatorSession(chatId);
  }
}

/**
 * Задает следующий вопрос в зависимости от текущего шага
 * @param {number} chatId - ID чата
 * @param {Object} bot - Экземпляр бота
 */
async function askNextQuestion(chatId, bot) {
  const session = getCalculatorSession(chatId);
  if (!session) {
    await startCalculator(chatId, bot);
    return;
  }

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
      await completeCalculation(chatId, bot);
      return;
  }

  if (keyboard) {
    await bot.sendMessage(chatId, question, keyboard);
  } else {
    await bot.sendMessage(chatId, question);
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
    await askNextQuestion(chatId, bot);
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

  await askNextQuestion(chatId, bot);
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
    await askNextQuestion(chatId, bot);
  } else {
    // Через N лет - запрашиваем количество лет
    updateCalculatorSession(chatId, {
      step: CALCULATOR_STEPS.PAYOUT_YEARS,
      data: newData,
      retries: 0,
    });
    await askNextQuestion(chatId, bot);
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

  await askNextQuestion(chatId, bot);
}

/**
 * Обрабатывает превышение лимита ошибок
 * @param {number} chatId - ID чата
 * @param {Object} bot - Экземпляр бота
 */
async function handleTooManyErrors(chatId, bot) {
  const keyboard = createTooManyErrorsKeyboard();
  await bot.sendMessage(chatId, MESSAGES.TOO_MANY_ERRORS, keyboard);
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
async function completeCalculation(chatId, bot) {
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
 * Получает следующий шаг в последовательности
 * @param {string} currentStep - Текущий шаг
 * @returns {string} Следующий шаг
 */
function getNextStep(currentStep) {
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

/**
 * Проверяет, находится ли пользователь в процессе калькулятора
 * @param {number} chatId - ID чата
 * @returns {boolean} true если в процессе калькулятора
 */
export function isInCalculator(chatId) {
  const session = getCalculatorSession(chatId);
  return session !== null;
}
