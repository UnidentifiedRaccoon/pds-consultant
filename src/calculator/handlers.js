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
  validateTargetPayment,
  validatePayoutYears,
  validateExpectedReturn,
  validateStartingCapital,
  validateOpsTransfer,
  validateTaxRate,
  validateUsedOtherLimit,
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
    case CALCULATOR_STEPS.TARGET_PAYMENT:
      validation = validateTargetPayment(input);
      break;
    case CALCULATOR_STEPS.PAYOUT_YEARS:
      validation = validatePayoutYears(input);
      break;
    case CALCULATOR_STEPS.EXPECTED_RETURN:
      validation = validateExpectedReturn(input);
      break;
    case CALCULATOR_STEPS.STARTING_CAPITAL:
      validation = validateStartingCapital(input);
      break;
    case CALCULATOR_STEPS.OPS_TRANSFER:
      validation = validateOpsTransfer(input);
      break;
    case CALCULATOR_STEPS.TAX_RATE:
      validation = validateTaxRate(input);
      break;
    case CALCULATOR_STEPS.USED_OTHER_LIMIT:
      validation = validateUsedOtherLimit(input);
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
    // По общему правилу - рассчитываем количество лет и переходим к следующему шагу
    const { getPayoutYearsByRule } = await import('./calculations.js');
    const yearsByRule = getPayoutYearsByRule(session.data.gender, session.data.age);

    const dataWithYears = { ...newData, payoutYears: yearsByRule };
    const nextStep = getNextStep(CALCULATOR_STEPS.PAYOUT_START);

    updateCalculatorSession(chatId, {
      step: nextStep,
      data: dataWithYears,
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

  try {
    // Выполняем расчет в зависимости от цели
    const result = await performCalculation(session);
    await bot.sendMessage(chatId, result);
  } catch (error) {
    logger.error({ chatId, error }, 'calculator:calculation:error');
    await bot.sendMessage(chatId, 'Произошла ошибка при расчете. Попробуйте еще раз.');
  }

  // Удаляем сессию и показываем главное меню
  deleteCalculatorSession(chatId);
  const keyboard = createBackToMainKeyboard();
  await bot.sendMessage(chatId, 'Выбери действие:', keyboard);
}

/**
 * Выполняет расчет в зависимости от цели
 * @param {Object} session - Сессия калькулятора
 * @returns {string} Результат расчета
 */
async function performCalculation(session) {
  const { goal, data } = session;

  if (goal === CALCULATION_GOALS.ADDITIONAL_PAYMENT) {
    return await calculateAdditionalPayment(data);
  } else {
    // Для других целей показываем заглушку
    return generateCalculationResult(data);
  }
}

/**
 * Рассчитывает дополнительную выплату
 * @param {Object} data - Собранные данные
 * @returns {string} Результат расчета
 */
async function calculateAdditionalPayment(data) {
  const { solveMonthlyContribForTargetPayment, buildReport, formatCurrency } = await import(
    './calculations.js'
  );

  // Подготавливаем параметры для расчета
  const params = {
    sex: data.gender,
    age: data.age,
    horizonYears: data.payoutYears,
    incomeMonthly: data.income,
    taxRate: data.taxRate / 100, // Конвертируем в доли
    reinvestTax: data.reinvestTax,
    startCapital: data.startingCapital || 0,
    opsTransfer: data.opsTransfer || 0,
    usedOtherLimitByYear: { 1: data.usedOtherLimit || 0 }, // Упрощенно для первого года
    annualReturn: data.expectedReturn || 0.05, // 5% по умолчанию
  };

  // Определяем тип выплаты (по умолчанию пожизненная)
  const payoutType = 'life';
  const targetPayment = data.targetPayment;

  try {
    // Выполняем расчет
    const result = solveMonthlyContribForTargetPayment(params, targetPayment, payoutType);

    // Формируем отчет
    const report = buildReport(result, params);

    // Форматируем результат
    return formatAdditionalPaymentResult(report, result, data, formatCurrency);
  } catch (error) {
    logger.error({ error, data }, 'calculator:additional_payment:error');
    throw new Error('Не удалось выполнить расчет для заданных параметров');
  }
}

/**
 * Форматирует результат расчета дополнительной выплаты
 * @param {Object} report - Отчет расчета
 * @param {Object} result - Результат расчета
 * @param {Object} data - Исходные данные
 * @param {Function} formatCurrency - Функция форматирования валюты
 * @returns {string} Отформатированный результат
 */
function formatAdditionalPaymentResult(report, result, data, formatCurrency) {
  return `💰 Результат расчета дополнительной выплаты

📋 Исходные данные:
👤 Пол: ${data.gender === 'm' ? 'Мужской' : 'Женский'}
🎂 Возраст: ${data.age} лет
💵 Доход: ${formatCurrency(data.income)}/мес
💸 Желаемая выплата: ${formatCurrency(data.targetPayment)}/мес
📅 Начало выплат: ${data.payoutStartMode === 'rule' ? 'По общему правилу' : `Через ${data.payoutYears} лет`}
📈 Ожидаемая доходность: ${(data.expectedReturn * 100).toFixed(1)}%
💰 Стартовый капитал: ${formatCurrency(data.startingCapital || 0)}
🏦 Перевод ОПС: ${formatCurrency(data.opsTransfer || 0)}
📊 Ставка НДФЛ: ${data.taxRate}%
🔄 Реинвестирование вычета: ${data.reinvestTax ? 'Да' : 'Нет'}

📊 Результаты:
1️⃣ ${report[1].label}: ${formatCurrency(report[1].value)}
2️⃣ ${report[2].label}: ${formatCurrency(report[2].value)}
3️⃣ ${report[3].label}: ${formatCurrency(report[3].value)}
4️⃣ ${report[4].label}: ${formatCurrency(report[4].value)}
5️⃣ ${report[5].label}: ${formatCurrency(report[5].value)}
6️⃣ ${report[6].label}: ${formatCurrency(report[6].value)}

7️⃣ ${report[7].label}:
• Пожизненно: ${formatCurrency(report[7].value.пожизненно)}
• В течение 10 лет: ${formatCurrency(report[7].value['в течение 10 лет'])}
• Единовременная: ${formatCurrency(report[7].value.единовременная)}`;
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
