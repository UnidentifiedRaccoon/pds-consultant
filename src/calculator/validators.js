/**
 * Валидаторы для пошагового калькулятора
 */

/**
 * Нормализует и валидирует пол
 * @param {string} input - Ввод пользователя
 * @returns {Object} { isValid: boolean, value: string|null, error: string|null }
 */
export function validateGender(input) {
  const normalized = input.toLowerCase().trim();

  // Проверяем различные варианты ввода
  if (['м', 'муж', 'мужской', 'm', 'male'].includes(normalized)) {
    return { isValid: true, value: 'm', error: null };
  }

  if (['ж', 'жен', 'женский', 'f', 'female'].includes(normalized)) {
    return { isValid: true, value: 'f', error: null };
  }

  return { isValid: false, value: null, error: 'gender' };
}

/**
 * Валидирует возраст
 * @param {string} input - Ввод пользователя
 * @returns {Object} { isValid: boolean, value: number|null, error: string|null }
 */
export function validateAge(input) {
  const age = parseInt(input.trim(), 10);

  if (isNaN(age) || !Number.isInteger(age)) {
    return { isValid: false, value: null, error: 'age' };
  }

  if (age < 18 || age > 100) {
    return { isValid: false, value: null, error: 'age' };
  }

  return { isValid: true, value: age, error: null };
}

/**
 * Парсит и валидирует сумму дохода
 * @param {string} input - Ввод пользователя
 * @returns {Object} { isValid: boolean, value: number|null, error: string|null }
 */
export function validateIncome(input) {
  // Убираем пробелы, валютные символы, запятые и точки
  const cleaned = input.replace(/[\s₽,.]/g, '');
  const amount = parseInt(cleaned, 10);

  if (isNaN(amount) || !Number.isInteger(amount)) {
    return { isValid: false, value: null, error: 'income' };
  }

  if (amount < 0 || amount > 10000000) {
    return { isValid: false, value: null, error: 'income' };
  }

  return { isValid: true, value: amount, error: null };
}

/**
 * Валидирует количество лет для начала выплат
 * @param {string} input - Ввод пользователя
 * @returns {Object} { isValid: boolean, value: number|null, error: string|null }
 */
export function validatePayoutYears(input) {
  const years = parseInt(input.trim(), 10);

  if (isNaN(years) || !Number.isInteger(years)) {
    return { isValid: false, value: null, error: 'payout_years' };
  }

  if (years < 2 || years > 40) {
    return { isValid: false, value: null, error: 'payout_years' };
  }

  return { isValid: true, value: years, error: null };
}

/**
 * Парсит и валидирует стартовый капитал
 * @param {string} input - Ввод пользователя
 * @returns {Object} { isValid: boolean, value: number|null, error: string|null }
 */
export function validateStartingCapital(input) {
  // Убираем пробелы, валютные символы, запятые и точки
  const cleaned = input.replace(/[\s₽,.]/g, '');
  const amount = parseInt(cleaned, 10);

  if (isNaN(amount) || !Number.isInteger(amount)) {
    return { isValid: false, value: null, error: 'starting_capital' };
  }

  if (amount < 0) {
    return { isValid: false, value: null, error: 'starting_capital' };
  }

  return { isValid: true, value: amount, error: null };
}

/**
 * Валидирует ставку НДФЛ
 * @param {string} input - Ввод пользователя
 * @returns {Object} { isValid: boolean, value: number|null, error: string|null }
 */
export function validateTaxRate(input) {
  const rate = parseInt(input.trim(), 10);

  if (isNaN(rate) || !Number.isInteger(rate)) {
    return { isValid: false, value: null, error: 'tax_rate' };
  }

  if (![13, 15, 18, 20, 22].includes(rate)) {
    return { isValid: false, value: null, error: 'tax_rate' };
  }

  return { isValid: true, value: rate, error: null };
}

/**
 * Нормализует и валидирует ответ Да/Нет
 * @param {string} input - Ввод пользователя
 * @returns {Object} { isValid: boolean, value: boolean|null, error: string|null }
 */
export function validateYesNo(input) {
  const normalized = input.toLowerCase().trim();

  if (['да', 'yes', 'y', '1', 'true'].includes(normalized)) {
    return { isValid: true, value: true, error: null };
  }

  if (['нет', 'no', 'n', '0', 'false'].includes(normalized)) {
    return { isValid: true, value: false, error: null };
  }

  return { isValid: false, value: null, error: 'reinvest_tax' };
}

/**
 * Валидирует желаемую ежемесячную выплату
 * @param {string} input - Ввод пользователя
 * @returns {Object} { isValid: boolean, value: number|null, error: string|null }
 */
export function validateTargetPayment(input) {
  const cleaned = input.replace(/[\s₽,.]/g, '');
  const amount = parseInt(cleaned, 10);

  if (isNaN(amount) || !Number.isInteger(amount)) {
    return { isValid: false, value: null, error: 'target_payment' };
  }

  if (amount < 1000 || amount > 1000000) {
    return { isValid: false, value: null, error: 'target_payment' };
  }

  return { isValid: true, value: amount, error: null };
}

/**
 * Валидирует ожидаемую доходность
 * @param {string} input - Ввод пользователя
 * @returns {Object} { isValid: boolean, value: number|null, error: string|null }
 */
export function validateExpectedReturn(input) {
  const rate = parseFloat(input.trim());

  if (isNaN(rate)) {
    return { isValid: false, value: null, error: 'expected_return' };
  }

  if (rate < 3 || rate > 6) {
    return { isValid: false, value: null, error: 'expected_return' };
  }

  return { isValid: true, value: rate / 100, error: null }; // Конвертируем в долях
}

/**
 * Валидирует перевод ОПС
 * @param {string} input - Ввод пользователя
 * @returns {Object} { isValid: boolean, value: number|null, error: string|null }
 */
export function validateOpsTransfer(input) {
  const cleaned = input.replace(/[\s₽,.]/g, '');
  const amount = parseInt(cleaned, 10);

  if (isNaN(amount) || !Number.isInteger(amount)) {
    return { isValid: false, value: null, error: 'ops_transfer' };
  }

  if (amount < 0 || amount > 100000000) {
    return { isValid: false, value: null, error: 'ops_transfer' };
  }

  return { isValid: true, value: amount, error: null };
}

/**
 * Валидирует использованный лимит по НПО/ИИС-3
 * @param {string} input - Ввод пользователя
 * @returns {Object} { isValid: boolean, value: number|null, error: string|null }
 */
export function validateUsedOtherLimit(input) {
  const cleaned = input.replace(/[\s₽,.]/g, '');
  const amount = parseInt(cleaned, 10);

  if (isNaN(amount) || !Number.isInteger(amount)) {
    return { isValid: false, value: null, error: 'used_other_limit' };
  }

  if (amount < 0 || amount > 400000) {
    return { isValid: false, value: null, error: 'used_other_limit' };
  }

  return { isValid: true, value: amount, error: null };
}

/**
 * Получает сообщение об ошибке по типу
 * @param {string} errorType - Тип ошибки
 * @returns {string} Сообщение об ошибке
 */
export function getErrorMessage(errorType) {
  const errorMessages = {
    gender: '⚠️ Введи м/ж (или: мужской/женский)',
    age: '⚠️ Введи целое число от 18 до 100',
    income: '⚠️ Нужна сумма от 0 до 10 000 000 руб/мес',
    target_payment: '⚠️ Сумма от 1 000 до 1 000 000 руб/мес',
    payout_years: '⚠️ Введи целое число от 2 до 40',
    expected_return: '⚠️ От 3% до 6% годовых',
    starting_capital: '⚠️ Введи неотрицательное число (0, если нет капитала)',
    ops_transfer: '⚠️ Введи неотрицательное число (0, если нет перевода)',
    tax_rate: '⚠️ Допустимые значения: 13, 15, 18, 20, 22',
    used_other_limit: '⚠️ Введи неотрицательное число (0, если не использован)',
    reinvest_tax: '⚠️ Выбери Да или Нет',
  };

  return errorMessages[errorType] || '⚠️ Неверный формат данных';
}
