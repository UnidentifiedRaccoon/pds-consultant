/**
 * Основные расчетные функции для ПДС калькулятора
 * Реализует все три сценария расчета согласно техническому заданию
 */

// Константы
const ANNUAL_RETURN = 0.1; // 10% годовых по умолчанию
const MONTHLY_RATE = Math.pow(1 + ANNUAL_RETURN, 1 / 12) - 1;
const GOV_MAX_PER_YEAR = 36000; // Максимальная господдержка в год
const GOV_YEARS_MAX = 10; // Максимум лет господдержки
const DEDUCT_BASE_LIMIT = 400000; // Лимит базы для налогового вычета

// Коэффициенты матчинга по доходу
const MATCH_RATES = {
  LOW: { threshold: 80000, rate: 1.0 }, // до 80k - 1:1
  MEDIUM: { threshold: 150000, rate: 0.5 }, // 80-150k - 1:2
  HIGH: { threshold: Infinity, rate: 0.25 }, // >150k - 1:4
};

// Коэффициенты ожидаемого периода выплат (в месяцах) для пожизненных выплат
// Данные примерные, в реальности должны браться из актуарных таблиц НПФ
const LIFETIME_COEFFICIENTS = {
  m: {
    // мужчины
    55: 300,
    60: 240,
    65: 180,
    70: 120,
    75: 84,
    80: 60,
  },
  f: {
    // женщины
    55: 360,
    60: 300,
    65: 240,
    70: 180,
    75: 120,
    80: 84,
  },
};

/**
 * Получает коэффициент матчинга по доходу
 * @param {number} incomeMonthly - Среднемесячный доход
 * @returns {number} Коэффициент матчинга
 */
function getMatchRate(incomeMonthly) {
  if (incomeMonthly <= MATCH_RATES.LOW.threshold) {
    return MATCH_RATES.LOW.rate;
  } else if (incomeMonthly <= MATCH_RATES.MEDIUM.threshold) {
    return MATCH_RATES.MEDIUM.rate;
  } else {
    return MATCH_RATES.HIGH.rate;
  }
}

/**
 * Рассчитывает господдержку за год
 * @param {number} yearPersonal - Личные взносы за год
 * @param {number} incomeMonthly - Среднемесячный доход
 * @returns {number} Размер господдержки
 */
export function calcGovSupportForYear(yearPersonal, incomeMonthly) {
  if (yearPersonal < 2000) {
    return 0; // Минимум для получения господдержки
  }

  const matchRate = getMatchRate(incomeMonthly);
  return Math.min(GOV_MAX_PER_YEAR, yearPersonal * matchRate);
}

/**
 * Рассчитывает налоговый вычет за год
 * @param {number} yearPersonal - Личные взносы за год
 * @param {number} taxRate - Ставка НДФЛ (в долях)
 * @param {number} usedOtherLimit - Уже использованный лимит по НПО/ИИС-3
 * @returns {number} Размер налогового вычета
 */
export function calcTaxDeductionForYear(yearPersonal, taxRate, usedOtherLimit = 0) {
  const baseAvailable = Math.max(0, DEDUCT_BASE_LIMIT - usedOtherLimit);
  const base = Math.min(yearPersonal, baseAvailable);
  return taxRate * base;
}

/**
 * Капитализация в течение месяца
 * @param {number} capital - Текущий капитал
 * @returns {number} Капитал после капитализации
 */
function accrueMonth(capital) {
  return capital * (1 + MONTHLY_RATE);
}

/**
 * Основная функция симуляции накопления
 * @param {Object} params - Параметры расчета
 * @returns {Object} Результат симуляции
 */
export function simulateAccumulation(params) {
  const {
    sex,
    age,
    horizonYears,
    monthlyContrib = 0,
    annualContrib = 0,
    incomeMonthly,
    taxRate,
    reinvestTax = true,
    usedOtherLimitByYear = {},
    startCapital = 0,
    opsTransfer = 0,
    annualReturn = ANNUAL_RETURN,
  } = params;

  // Валидация входных данных
  if (age < 18 || age > 100) {
    throw new Error('Возраст должен быть от 18 до 100 лет');
  }

  if (monthlyContrib < 0 || annualContrib < 0) {
    throw new Error('Взносы не могут быть отрицательными');
  }

  if (incomeMonthly < 0) {
    throw new Error('Доход не может быть отрицательным');
  }

  if (![0.13, 0.15, 0.18, 0.2, 0.22].includes(taxRate)) {
    throw new Error('Недопустимая ставка НДФЛ');
  }

  const years = horizonYears;
  // const monthlyRate = Math.pow(1 + annualReturn, 1 / 12) - 1; // Не используется в текущей реализации

  let K = startCapital + opsTransfer; // Стартовая база
  let personalTotal = 0;
  let govTotal = 0;
  let taxTotal = 0;
  let opsTotal = opsTransfer;

  // Очередь господдержки (лаг на год)
  let govDueNextYear = 0;

  // Ежегодный цикл
  for (let y = 1; y <= years; y++) {
    // 1) В начале года зачислить господдержку за прошлый год
    if (govDueNextYear > 0) {
      K += govDueNextYear;
      govTotal += govDueNextYear;
      govDueNextYear = 0;
    }

    // 2) Ежемесячные взносы в этом году
    let yearPersonal = 0;

    if (monthlyContrib > 0) {
      for (let m = 1; m <= 12; m++) {
        K += monthlyContrib;
        yearPersonal += monthlyContrib;
        K = accrueMonth(K);
      }
    } else if (annualContrib > 0) {
      // Годовой взнос равными долями помесячно
      yearPersonal = annualContrib;
      for (let m = 1; m <= 12; m++) {
        K += annualContrib / 12;
        K = accrueMonth(K);
      }
    }

    personalTotal += yearPersonal;

    // 3) По итогам года рассчитать господдержку (будет зачислена в следующем году)
    const G_y = calcGovSupportForYear(yearPersonal, incomeMonthly);
    if (y <= GOV_YEARS_MAX) {
      govDueNextYear = G_y;
    }

    // 4) Налоговый вычет за этот год
    const usedOther = usedOtherLimitByYear[y] || 0;
    const T_y = calcTaxDeductionForYear(yearPersonal, taxRate, usedOther);

    if (reinvestTax) {
      // Зачислим в следующем году вместе с господдержкой
      govDueNextYear += T_y;
    }

    taxTotal += T_y;
  }

  // 5) После цикла зачислить то, что должно прийти в следующий год
  K += govDueNextYear;
  govTotal += Math.min(govDueNextYear, GOV_MAX_PER_YEAR);

  // 6) Инвестдоход = итоговый капитал - (личные взносы + господдержка + реинвестованные вычеты + ОПС)
  const reinvestedTaxTotal = reinvestTax ? taxTotal : 0;
  const investIncome = K - (personalTotal + govTotal + reinvestedTaxTotal + opsTotal);

  return {
    capitalFinal: K,
    breakdown: {
      personalTotal,
      monthlyPersonal: monthlyContrib,
      govTotal,
      opsTotal,
      investIncome,
      taxTotal,
    },
  };
}

/**
 * Рассчитывает пожизненную ежемесячную выплату
 * @param {number} capitalFinal - Итоговый капитал
 * @param {string} sex - Пол ('m' или 'f')
 * @param {number} ageAtStart - Возраст начала выплат
 * @returns {number} Размер ежемесячной выплаты
 */
export function monthlyLifetimePayment(capitalFinal, sex, ageAtStart) {
  const coefficients = LIFETIME_COEFFICIENTS[sex];
  if (!coefficients) {
    return 0;
  }

  // Находим ближайший возраст в таблице
  const ages = Object.keys(coefficients)
    .map(Number)
    .sort((a, b) => a - b);
  let targetAge = ages[0];

  for (const age of ages) {
    if (age <= ageAtStart) {
      targetAge = age;
    } else {
      break;
    }
  }

  const K_life_months = coefficients[targetAge];
  if (!K_life_months || K_life_months <= 0) {
    return 0;
  }

  return capitalFinal / K_life_months;
}

/**
 * Рассчитывает срочную выплату на 10 лет
 * @param {number} capitalFinal - Итоговый капитал
 * @returns {number} Размер ежемесячной выплаты
 */
export function monthly10YearPayment(capitalFinal) {
  return capitalFinal / 120; // 120 месяцев = 10 лет
}

/**
 * Проверяет право на единовременную выплату
 * @param {number} monthlyLife - Пожизненная ежемесячная выплата
 * @param {number} federalPMPensioner - Федеральный ПМ пенсионера
 * @returns {boolean} true если есть право на единовременную выплату
 */
export function lumpSumAllowed(monthlyLife, federalPMPensioner = 12000) {
  // Примерное значение ПМ
  return monthlyLife < 0.1 * federalPMPensioner;
}

/**
 * Сценарий 1: Поиск требуемого ежемесячного взноса для целевой выплаты
 * @param {Object} params - Параметры расчета
 * @param {number} targetMonthlyPayment - Желаемая ежемесячная выплата
 * @param {string} payoutType - Тип выплаты ('life' или '10y')
 * @param {number} federalPM - Федеральный ПМ пенсионера
 * @returns {Object} Результат расчета
 */
export function solveMonthlyContribForTargetPayment(
  params,
  targetMonthlyPayment,
  payoutType,
  federalPM = 12000
) {
  const { sex, age, horizonYears, incomeMonthly, taxRate, reinvestTax, startCapital, opsTransfer } =
    params;

  // Определяем возраст начала выплат
  const ageAtStart = age + horizonYears;

  // Бинарный поиск по ежемесячному взносу
  let low = 0;
  let high = 2000000; // Максимальный разумный взнос
  let bestM = null;

  while (low <= high) {
    const m = Math.floor((low + high) / 2);

    const trialParams = {
      ...params,
      monthlyContrib: m,
      annualContrib: 0,
    };

    try {
      const sim = simulateAccumulation(trialParams);
      const K = sim.capitalFinal;

      let W = 0;
      if (payoutType === 'life') {
        W = monthlyLifetimePayment(K, sex, ageAtStart);
      } else if (payoutType === '10y') {
        W = monthly10YearPayment(K);
      }

      if (W >= targetMonthlyPayment) {
        bestM = m;
        high = m - 1;
      } else {
        low = m + 1;
      }
    } catch (error) {
      // При ошибке увеличиваем нижнюю границу
      low = m + 1;
    }
  }

  if (bestM === null) {
    throw new Error('Не удалось найти решение для заданных параметров');
  }

  // Финальный расчет с найденным взносом
  const finalParams = {
    ...params,
    monthlyContrib: bestM,
    annualContrib: 0,
  };

  const sim = simulateAccumulation(finalParams);
  const K = sim.capitalFinal;
  const W_life = monthlyLifetimePayment(K, sex, ageAtStart);
  const W_10 = monthly10YearPayment(K);
  const allowLump = lumpSumAllowed(W_life, federalPM);

  return {
    monthlyContribRequired: bestM,
    capitalFinal: K,
    payouts: {
      life: W_life,
      tenYears: W_10,
      lumpAllowed: allowLump,
    },
    breakdown: sim.breakdown,
  };
}

/**
 * Сценарий 2: Расчет капитала к началу выплат
 * @param {Object} params - Параметры расчета
 * @returns {Object} Результат расчета
 */
export function computeCapitalAtStart(params) {
  const { sex, age, horizonYears } = params;
  const ageAtStart = age + horizonYears;

  const sim = simulateAccumulation(params);
  const K = sim.capitalFinal;

  return {
    capitalFinal: K,
    breakdown: sim.breakdown,
    payoutsPreview: {
      life: monthlyLifetimePayment(K, sex, ageAtStart),
      tenYears: monthly10YearPayment(K),
    },
  };
}

/**
 * Сценарий 3: Расчет от взноса (без цели)
 * @param {Object} params - Параметры расчета
 * @returns {Object} Результат расчета
 */
export function computeFromContrib(params) {
  return computeCapitalAtStart(params);
}

/**
 * Формирует итоговый отчет в едином формате
 * @param {Object} simResult - Результат симуляции
 * @param {Object} params - Параметры расчета
 * @param {number} federalPM - Федеральный ПМ пенсионера
 * @returns {Object} Структурированный отчет
 */
export function buildReport(simResult, params, federalPM = 12000) {
  const { sex, age, horizonYears } = params;
  const ageAtStart = age + horizonYears;

  const K = simResult.capitalFinal;
  const life = monthlyLifetimePayment(K, sex, ageAtStart);
  const ten = monthly10YearPayment(K);
  const lumpOk = lumpSumAllowed(life, federalPM);

  return {
    1: { label: 'Личные взносы', value: simResult.breakdown.personalTotal },
    2: { label: 'Размер ежемесячных личных взносов', value: simResult.breakdown.monthlyPersonal },
    3: { label: 'Софинансирование государства', value: simResult.breakdown.govTotal },
    4: { label: 'Перевод пенсионных сбережений (ОПС)', value: simResult.breakdown.opsTotal },
    5: { label: 'Инвестиционный доход', value: simResult.breakdown.investIncome },
    6: { label: 'Налоговый вычет', value: simResult.breakdown.taxTotal },
    7: {
      label: 'Размер ежемесячных выплат',
      value: {
        пожизненно: life,
        'в течение 10 лет': ten,
        единовременная: lumpOk ? K : 0,
      },
    },
  };
}
