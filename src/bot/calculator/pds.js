/**
 * Расчётные функции для ПДС-калькулятора
 * Чистые функции без зависимости от Telegram API
 */

import { MONTHLY_RATE } from '../state/types.js';

/**
 * Рассчитывает итоговый капитал с учётом всех факторов
 * @param {Object} data - Данные пользователя
 * @returns {number} Итоговый капитал
 */
export function calculateFinalCapital(data) {
  const {
    monthlyContribution = 0,
    annualContribution = 0,
    startingCapital = 0,
    opsTransfer = 0,
    horizonYears = 0,
  } = data;

  if (horizonYears <= 0) return 0;

  const months = horizonYears * 12;
  const monthlyRate = MONTHLY_RATE;

  // Конвертируем ежегодный взнос в ежемесячный эквивалент
  const effectiveMonthlyContribution = monthlyContribution + annualContribution / 12;

  // Капитал из стартового капитала
  const capitalFromStarting = startingCapital * Math.pow(1 + monthlyRate, months);

  // Капитал из переводов ОПС
  const capitalFromOps = opsTransfer * Math.pow(1 + monthlyRate, months);

  // Капитал из равномерных ежемесячных взносов
  let capitalFromContributions = 0;
  if (effectiveMonthlyContribution > 0) {
    capitalFromContributions =
      effectiveMonthlyContribution * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate);
  }

  return capitalFromStarting + capitalFromOps + capitalFromContributions;
}

/**
 * Рассчитывает общую сумму личных взносов за весь период
 * @param {Object} data - Данные пользователя
 * @returns {number} Общая сумма личных взносов
 */
export function calculatePersonalContributions(data) {
  const { monthlyContribution = 0, annualContribution = 0, horizonYears = 0 } = data;

  if (horizonYears <= 0) return 0;

  const months = horizonYears * 12;
  const monthlyTotal = monthlyContribution * months;
  const annualTotal = annualContribution * horizonYears;

  return monthlyTotal + annualTotal;
}

/**
 * Рассчитывает размер ежемесячных личных взносов
 * @param {Object} data - Данные пользователя
 * @returns {number} Размер ежемесячных взносов
 */
export function calculateMonthlyPersonalContribution(data) {
  const { monthlyContribution = 0, annualContribution = 0 } = data;

  return monthlyContribution + annualContribution / 12;
}

/**
 * Рассчитывает инвестиционный доход
 * @param {Object} data - Данные пользователя
 * @returns {number} Инвестиционный доход
 */
export function calculateInvestmentIncome(data) {
  const finalCapital = calculateFinalCapital(data);
  const personalContributions = calculatePersonalContributions(data);
  const { startingCapital = 0, opsTransfer = 0 } = data;

  return finalCapital - (personalContributions + startingCapital + opsTransfer);
}

/**
 * Рассчитывает варианты выплат
 * @param {number} finalCapital - Итоговый капитал
 * @returns {Object} Варианты выплат
 */
export function calculatePayouts(finalCapital) {
  // TODO: Заменить на актуарные коэффициенты
  const LIFETIME_COEFFICIENT = 240; // 20 лет * 12 месяцев (черновая модель)
  const TEN_YEARS_COEFFICIENT = 120; // 10 лет * 12 месяцев

  return {
    lifetime: finalCapital / LIFETIME_COEFFICIENT,
    tenYears: finalCapital / TEN_YEARS_COEFFICIENT,
    lumpSum: finalCapital,
  };
}

/**
 * Рассчитывает необходимый ежемесячный взнос для достижения целевого капитала
 * @param {number} targetCapital - Целевой капитал
 * @param {Object} data - Данные пользователя
 * @returns {number} Необходимый ежемесячный взнос
 */
export function calculateRequiredMonthlyContribution(targetCapital, data) {
  const { startingCapital = 0, opsTransfer = 0, horizonYears = 0 } = data;

  if (horizonYears <= 0) return 0;

  const months = horizonYears * 12;
  const monthlyRate = MONTHLY_RATE;

  // Капитал из стартового капитала и ОПС
  const capitalFromStarting = startingCapital * Math.pow(1 + monthlyRate, months);
  const capitalFromOps = opsTransfer * Math.pow(1 + monthlyRate, months);
  const availableCapital = capitalFromStarting + capitalFromOps;

  // Если доступный капитал уже больше целевого
  if (availableCapital >= targetCapital) {
    return 0;
  }

  // Необходимый капитал от взносов
  const requiredFromContributions = targetCapital - availableCapital;

  // Рассчитываем необходимый ежемесячный взнос
  const annuityFactor = (Math.pow(1 + monthlyRate, months) - 1) / monthlyRate;
  const requiredMonthlyContribution = requiredFromContributions / annuityFactor;

  return Math.max(0, requiredMonthlyContribution);
}

/**
 * Выполняет полный расчёт ПДС
 * @param {Object} data - Данные пользователя
 * @returns {Object} Результат расчёта
 */
export function calculatePDS(data) {
  const finalCapital = calculateFinalCapital(data);
  const personalContributions = calculatePersonalContributions(data);
  const monthlyPersonalContribution = calculateMonthlyPersonalContribution(data);
  const investmentIncome = calculateInvestmentIncome(data);
  const payouts = calculatePayouts(finalCapital);

  return {
    personalContributions,
    monthlyPersonalContribution,
    governmentSupport: 0, // В разработке
    opsTransfer: data.opsTransfer || 0,
    investmentIncome,
    taxDeduction: 0, // В разработке
    finalCapital,
    payouts,
  };
}

/**
 * Форматирует число как денежную сумму
 * @param {number} amount - Сумма
 * @returns {string} Отформатированная строка
 */
export function formatCurrency(amount) {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Форматирует результат расчёта для отображения
 * @param {Object} result - Результат расчёта
 * @returns {string} Отформатированная строка
 */
export function formatCalculationResult(result) {
  const {
    personalContributions,
    monthlyPersonalContribution,
    governmentSupport,
    opsTransfer,
    investmentIncome,
    taxDeduction,
    finalCapital,
    payouts,
  } = result;

  return `📊 Результат расчёта ПДС

💰 Личные взносы: ${formatCurrency(personalContributions)}
📅 Ежемесячные взносы: ${formatCurrency(monthlyPersonalContribution)}
🏛️ Господдержка: ${formatCurrency(governmentSupport)} (в разработке)
🏦 Перевод ОПС: ${formatCurrency(opsTransfer)}
📈 Инвестиционный доход: ${formatCurrency(investmentIncome)}
🧾 Налоговый вычет: ${formatCurrency(taxDeduction)} (в разработке)

💎 Итоговый капитал: ${formatCurrency(finalCapital)}

💸 Ежемесячные выплаты:
• Пожизненно (черновая): ${formatCurrency(payouts.lifetime)}
• На 10 лет: ${formatCurrency(payouts.tenYears)}
• Единовременно: ${formatCurrency(payouts.lumpSum)}`;
}
