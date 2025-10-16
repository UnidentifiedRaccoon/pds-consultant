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
  validateMonthlyContribution,
  validateAnnualContribution,
  validateHorizonAge,
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
  let session = getCalculatorSession(chatId);
  if (!session) {
    // Создаем новую сессию с выбранной целью
    session = createCalculatorSession(chatId, goal);
  } else {
    // Обновляем существующую сессию с выбранной целью
    updateCalculatorSession(chatId, { goal });
    session = getCalculatorSession(chatId);
  }

  if (goal === CALCULATION_GOALS.ADDITIONAL_PAYMENT) {
    // Начинаем пошаговый опрос для сценария 1
    await askNextQuestion(chatId, bot, session);
  } else if (goal === CALCULATION_GOALS.CAPITAL_TO_PAYOUT || goal === CALCULATION_GOALS.NO_GOAL) {
    // Начинаем пошаговый опрос для сценариев 2 и 3
    await askNextQuestion(chatId, bot, session);
  } else {
    // Показываем заглушку для неизвестных целей
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
    // Новые шаги для сценариев 2 и 3
    case CALCULATOR_STEPS.MONTHLY_CONTRIBUTION:
      validation = validateMonthlyContribution(input);
      break;
    case CALCULATOR_STEPS.ANNUAL_CONTRIBUTION:
      validation = validateAnnualContribution(input);
      break;
    case CALCULATOR_STEPS.HORIZON_AGE:
      validation = validateHorizonAge(input);
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
  const nextStep = getNextStep(step, session.goal);
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
    const nextStep = getNextStep(CALCULATOR_STEPS.PAYOUT_START, session.goal);

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
  const nextStep = getNextStep(step, session.goal);

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
  } else if (goal === CALCULATION_GOALS.CAPITAL_TO_PAYOUT) {
    return await calculateCapitalAtStart(data);
  } else if (goal === CALCULATION_GOALS.NO_GOAL) {
    return await calculateFromContrib(data);
  } else {
    // Для неизвестных целей показываем заглушку
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
 * Рассчитывает капитал к началу выплат (сценарий 2)
 * @param {Object} data - Собранные данные
 * @returns {string} Результат расчета
 */
async function calculateCapitalAtStart(data) {
  const { computeCapitalAtStart, formatCurrency } = await import('./calculations.js');

  // Подготавливаем параметры
  const params = {
    sex: data.gender,
    age: data.age,
    horizonYears: data.payoutYears || data.horizonAge - data.age,
    incomeMonthly: data.income,
    taxRate: data.taxRate / 100,
    reinvestTax: data.reinvestTax,
    startCapital: data.startingCapital || 0,
    opsTransfer: data.opsTransfer || 0,
    usedOtherLimitByYear: { 1: data.usedOtherLimit || 0 },
    annualReturn: data.expectedReturn || 0.05,
  };

  // Добавляем взносы в зависимости от типа
  if (data.contributionType === 'monthly') {
    params.monthlyContrib = data.monthlyContribution || 0;
  } else {
    params.annualContrib = data.annualContribution || 0;
  }

  try {
    const result = computeCapitalAtStart(params);
    return formatCapitalAtStartResult(result, data, formatCurrency);
  } catch (error) {
    logger.error({ error, data }, 'calculator:capital_at_start:error');
    throw new Error('Не удалось выполнить расчет для заданных параметров');
  }
}

/**
 * Рассчитывает от взноса (сценарий 3)
 * @param {Object} data - Собранные данные
 * @returns {string} Результат расчета
 */
async function calculateFromContrib(data) {
  const { computeFromContrib, formatCurrency } = await import('./calculations.js');

  // Подготавливаем параметры
  const params = {
    sex: data.gender,
    age: data.age,
    horizonYears: data.payoutYears || data.horizonAge - data.age,
    incomeMonthly: data.income,
    taxRate: data.taxRate / 100,
    reinvestTax: data.reinvestTax,
    startCapital: data.startingCapital || 0,
    opsTransfer: data.opsTransfer || 0,
    usedOtherLimitByYear: { 1: data.usedOtherLimit || 0 },
    annualReturn: data.expectedReturn || 0.05,
  };

  // Добавляем взносы в зависимости от типа
  if (data.contributionType === 'monthly') {
    params.monthlyContrib = data.monthlyContribution || 0;
  } else {
    params.annualContrib = data.annualContribution || 0;
  }

  try {
    const result = computeFromContrib(params);
    return formatFromContribResult(result, data, formatCurrency);
  } catch (error) {
    logger.error({ error, data }, 'calculator:from_contrib:error');
    throw new Error('Не удалось выполнить расчет для заданных параметров');
  }
}

/**
 * Форматирует результат расчета капитала к началу выплат
 * @param {Object} result - Результат расчета
 * @param {Object} data - Исходные данные
 * @param {Function} formatCurrency - Функция форматирования валюты
 * @returns {string} Отформатированный результат
 */
function formatCapitalAtStartResult(result, data, formatCurrency) {
  return `🏦 Результат расчета капитала к началу выплат

📊 Исходные данные:
👤 Пол: ${data.gender === 'm' ? 'Мужской' : 'Женский'}
🎂 Возраст: ${data.age} лет
💵 Доход: ${formatCurrency(data.income)}/мес
${
  data.contributionType === 'monthly'
    ? `💳 Ежемесячный взнос: ${formatCurrency(data.monthlyContribution)}/мес`
    : `📅 Ежегодный взнос: ${formatCurrency(data.annualContribution)}/год`
}
📅 Горизонт: ${data.horizonType === 'rule' ? 'По общему правилу' : `До ${data.horizonAge} лет`}
💰 Стартовый капитал: ${formatCurrency(data.startingCapital || 0)}
🏦 Перевод ОПС: ${formatCurrency(data.opsTransfer || 0)}

💰 Результат:
1️⃣ Личные взносы: ${formatCurrency(result.breakdown.personalTotal)}
2️⃣ Софинансирование государства: ${formatCurrency(result.breakdown.govTotal)}
3️⃣ Перевод пенсионных сбережений (ОПС): ${formatCurrency(result.breakdown.opsTotal)}
4️⃣ Инвестиционный доход: ${formatCurrency(result.breakdown.investIncome)}
5️⃣ Налоговый вычет: ${formatCurrency(result.breakdown.taxTotal)}

💎 Итоговый капитал: ${formatCurrency(result.capitalFinal)}

📈 Возможные выплаты:
• Пожизненно: ${formatCurrency(result.payoutsPreview.life)}
• В течение 10 лет: ${formatCurrency(result.payoutsPreview.tenYears)}`;
}

/**
 * Форматирует результат расчета от взноса
 * @param {Object} result - Результат расчета
 * @param {Object} data - Исходные данные
 * @param {Function} formatCurrency - Функция форматирования валюты
 * @returns {string} Отформатированный результат
 */
function formatFromContribResult(result, data, formatCurrency) {
  return `💸 Результат расчета от взноса

📊 Исходные данные:
👤 Пол: ${data.gender === 'm' ? 'Мужской' : 'Женский'}
🎂 Возраст: ${data.age} лет
💵 Доход: ${formatCurrency(data.income)}/мес
${
  data.contributionType === 'monthly'
    ? `💳 Ежемесячный взнос: ${formatCurrency(data.monthlyContribution)}/мес`
    : `📅 Ежегодный взнос: ${formatCurrency(data.annualContribution)}/год`
}
📅 Горизонт: ${data.horizonType === 'rule' ? 'По общему правилу' : `До ${data.horizonAge} лет`}
💰 Стартовый капитал: ${formatCurrency(data.startingCapital || 0)}
🏦 Перевод ОПС: ${formatCurrency(data.opsTransfer || 0)}

💰 Результат:
1️⃣ Личные взносы: ${formatCurrency(result.breakdown.personalTotal)}
2️⃣ Софинансирование государства: ${formatCurrency(result.breakdown.govTotal)}
3️⃣ Перевод пенсионных сбережений (ОПС): ${formatCurrency(result.breakdown.opsTotal)}
4️⃣ Инвестиционный доход: ${formatCurrency(result.breakdown.investIncome)}
5️⃣ Налоговый вычет: ${formatCurrency(result.breakdown.taxTotal)}

💎 Итоговый капитал: ${formatCurrency(result.capitalFinal)}

📈 Возможные выплаты:
• Пожизненно: ${formatCurrency(result.payoutsPreview.life)}
• В течение 10 лет: ${formatCurrency(result.payoutsPreview.tenYears)}`;
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
 * Обрабатывает выбор типа взноса
 * @param {number} chatId - ID чата
 * @param {string} contributionType - Тип взноса ('monthly' или 'annual')
 * @param {Object} bot - Экземпляр бота
 */
export async function handleContributionTypeSelection(chatId, contributionType, bot) {
  const session = getCalculatorSession(chatId);
  if (!session) {
    await startCalculator(chatId, bot);
    return;
  }

  const newData = { ...session.data, contributionType };
  const nextStep =
    contributionType === 'monthly'
      ? CALCULATOR_STEPS.MONTHLY_CONTRIBUTION
      : CALCULATOR_STEPS.ANNUAL_CONTRIBUTION;

  updateCalculatorSession(chatId, {
    step: nextStep,
    data: newData,
    retries: 0,
  });

  await askNextQuestion(chatId, bot, { ...session, step: nextStep });
}

/**
 * Обрабатывает выбор горизонта накопления
 * @param {number} chatId - ID чата
 * @param {string} horizonType - Тип горизонта ('rule' или 'age')
 * @param {Object} bot - Экземпляр бота
 */
export async function handleHorizonTypeSelection(chatId, horizonType, bot) {
  const session = getCalculatorSession(chatId);
  if (!session) {
    await startCalculator(chatId, bot);
    return;
  }

  const newData = { ...session.data, horizonType };

  if (horizonType === 'rule') {
    // По общему правилу - рассчитываем количество лет и переходим к следующему шагу
    const { getPayoutYearsByRule } = await import('./calculations.js');
    const yearsByRule = getPayoutYearsByRule(session.data.gender, session.data.age);

    const dataWithYears = { ...newData, payoutYears: yearsByRule };
    const nextStep = getNextStep(CALCULATOR_STEPS.HORIZON_TYPE, session.goal);

    updateCalculatorSession(chatId, {
      step: nextStep,
      data: dataWithYears,
      retries: 0,
    });

    await askNextQuestion(chatId, bot, { ...session, step: nextStep });
  } else {
    // До определенного возраста - переходим к вводу возраста
    const nextStep = CALCULATOR_STEPS.HORIZON_AGE;

    updateCalculatorSession(chatId, {
      step: nextStep,
      data: newData,
      retries: 0,
    });

    await askNextQuestion(chatId, bot, { ...session, step: nextStep });
  }
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
