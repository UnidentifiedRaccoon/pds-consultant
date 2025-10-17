/**
 * Фразы и сообщения бота PDS Consultant
 */

export const MESSAGES = {
  /** Приветственное сообщение при команде /start */
  WELCOME: `👋 Привет! Я бот-консультант по ПДС.

🎯 Что я умею:
• Рассчитать взносы по ПДС
• Узнать о ПДС

Выберите действие:`,

  /** Информация о программе долгосрочных сбережений */
  INFO_ABOUT_PDS: `✨ Что такое ПДС

Программа долгосрочных сбережений (ПДС) — это новый способ формировать личный капитал 💰. Её запустили по инициативе правительства, Минфина и Банка России 🏛️.

👥 Участвовать может любой совершеннолетний: достаточно заключить договор с НПФ.

💡 Что даёт ПДС:
• 💸 Господдержка: прибавка к взносам в первые 10 лет
• 🛡️ Защита: страхование вложений и дохода
• 💰 Налоговый вычет каждый год
• ⏳ Гибкость: можно забрать деньги через 15 лет
• 👨‍👩‍👧 Наследование: сбережения переходят родным

🔗 Подробнее: <a href="https://объясняем.рф/articles/useful/kak-priumnozhit-i-poluchit-nakopitelnuyu-pensiyu/">объясняем.рф</a>`,

  /** Выбор сценария расчёта */
  CALCULATE_PROMPT: `🎯 Выбери цель расчёта:

💰 Дополнительная выплата — рассчитаю, сколько нужно вносить для получения желаемой ежемесячной выплаты

🏦 Капитал к началу выплат — рассчитаю, какой капитал накоплю к определённому возрасту

💸 Без цели — рассчитаю от взноса — покажу, что получится при регулярных взносах`,

  /** Заглушки для сценариев расчёта */
  CALCULATE_RESPONSES: {
    EXTRA_PAYOUT: `💰 Расчёт дополнительной выплаты пока в разработке. Скоро добавим!`,
    WITHOUT_GOAL: `📊 Расчёт без цели пока в разработке. Скоро добавим!`,
  },

  /** Последовательность шагов для сценария "Капитал к началу выплат" */
  CAPITAL_FLOW: {
    INTRO: `🧮 Что посчитаем
• Итоговую сумму через 15 лет.
• Плюс ориентиры ежемесячных выплат (если решите не забрать всё сразу).

⏱️ Когда вообще можно получить деньги

✅ Через 15 лет — можно забрать разом или оформить ежемесячные выплаты.

⚠️ Если ежемесячная получается очень маленькой — менее 10% прожиточного минимума пенсионера — обычно разрешают забрать всё сразу.

❤️ Особые случаи (например, дорогостоящее лечение) — могут дать право на досрочное получение по правилам вашего НПФ.`,
    PROMPTS: {
      TARGET_SUM: `Сумма, которую нужно накопить к 15-му году, ₽
Введите целое число от 50 000 до 100 000 000 без разделителей.`,
      GENDER: `Пол
Выберите вариант:`,
      AGE: `Возраст сейчас, лет
Введите целое число от 18 до 100.`,
      INCOME: `Ваш среднемесячный доход (диапазон) — для расчёта софинансирования государства
Выберите подходящий вариант:`,
      NDFL: `Ставка НДФЛ (для налогового вычета)
Выберите вариант:`,
      REINVEST: `Реинвестировать налоговый вычет в ПДС?`,
    },
    ERRORS: {
      INVALID_TARGET_SUM: `Пожалуйста, введите целое число от 50 000 до 100 000 000 ₽ без пробелов и дополнительных символов.`,
      INVALID_AGE: `Пожалуйста, введите целое число от 18 до 100.`,
    },
    RESPONSES: {
      COMPLETE: `✅ Спасибо! Мы сохранили ответы. Подробный расчёт появится совсем скоро.`,
      RESULT_HEADER: `✅ Спасибо! Считаю при доходности <b>10% годовых</b> и ежемесячной капитализации…<br/>
Учту: госдоплату (<a href="https://cbr.ru/RSCI/activity_npf/program/">до 36 000 ₽/год в течение 10 лет</a>; порог взносов 2 000 ₽/год) и налоговый вычет по выбранной ставке (<a href="https://fincult.info/article/nalogovye-vychety-na-dolgosrochnye-sberezheniya/">лимит базы 400 000 ₽/год</a>). Дополнительно: справка по ПДС от <a href="https://minfin.gov.ru/ru/perfomance/pds/">Минфин</a>.`,
      RESULT_BODY: `<b>📊 Сводка на конец 15-го года (разовая выплата):</b><br/>
<br/>
<b>Личные взносы:</b> ≈ {personalTotal}<br/>
<br/>
<b>Ежемесячный взнос (расчётный):</b> ≈ {monthlyContribution}/мес<br/>
<br/>
<b>Софинансирование государства:</b> ≈ {stateTotal} (по {annualStateSupport}/год в первые 10 лет; <a href="https://cbr.ru/RSCI/activity_npf/program/">Банк России</a>)<br/>
<br/>
<b>Перевод пенсионных сбережений (ОПС):</b> {opsTransfer}<br/>
<br/>
<b>Инвестиционный доход:</b> ≈ {investmentIncome}<br/>
<br/>
<b>Налоговый вычет (сумма возвратов):</b> ≈ {taxTotal} ({taxRate}% от ваших годовых взносов в пределах лимита 400 000 ₽/год; <a href="https://fincult.info/article/nalogovye-vychety-na-dolgosrochnye-sberezheniya/">Финкульт</a>){taxNote}<br/>
<br/>
<b>Размер ежемесячных выплат (оценка):</b><br/>
• <i>пожизненно</i>: ≈ {lifePayment}/мес<br/>
• <i>на 10 лет</i>: ≈ {tenYearPayment}/мес<br/>
• <i>единовременно</i>: {lumpSum}`,
      RESTART_HINT: `Хотите попробовать другой сценарий? Нажмите «⬅️ Главное меню».`,
      PDF_TEMPLATE: `<!DOCTYPE html>
<html lang="ru">
  <head>
    <meta charset="UTF-8" />
    <title>Отчёт по программе ПДС</title>
    <style>
      body {
        font-family: 'Arial', sans-serif;
        margin: 32px;
        color: #1f2933;
        line-height: 1.6;
      }
      h1 {
        font-size: 24px;
        margin-bottom: 12px;
      }
      h2 {
        font-size: 20px;
        margin: 24px 0 12px;
        color: #0f4c81;
      }
      .section {
        margin-bottom: 18px;
      }
      .note {
        font-size: 13px;
        color: #52606d;
      }
      .highlight {
        font-weight: bold;
        color: #0f4c81;
      }
      ul {
        padding-left: 20px;
      }
      a {
        color: #0f4c81;
        text-decoration: none;
      }
      .footer {
        margin-top: 24px;
        font-size: 12px;
        color: #9aa5b1;
      }
    </style>
  </head>
  <body>
    <h1>Итоговый отчёт по программе долгосрочных сбережений (ПДС)</h1>
    <div class="section">
      <p><strong>Доходность:</strong> <span class="highlight">10% годовых</span>, ежемесячная капитализация.</p>
      <p>
        Учтены:<br/>
        • Государственная доплата (<a href="https://cbr.ru/RSCI/activity_npf/program/">до 36 000 ₽/год</a>, порог взносов — 2 000 ₽/год).<br/>
        • Налоговый вычет по выбранной ставке (<a href="https://fincult.info/article/nalogovye-vychety-na-dolgosrochnye-sberezheniya/">лимит базы 400 000 ₽/год</a>).<br/>
        • Дополнительные материалы: <a href="https://minfin.gov.ru/ru/perfomance/pds/">Минфин</a>.
      </p>
    </div>

    <h2>📊 Сводка на конец 15-го года</h2>
    <div class="section">
      <p><strong>Личные взносы:</strong> {personalTotal}</p>
      <p><strong>Ежемесячный взнос (расчётный):</strong> {monthlyContribution}/мес</p>
      <p><strong>Софинансирование государства:</strong> {stateTotal} (по {annualStateSupport}/год в первые 10 лет; <a href="https://cbr.ru/RSCI/activity_npf/program/">Банк России</a>)</p>
      <p><strong>Перевод пенсионных сбережений (ОПС):</strong> {opsTransfer}</p>
      <p><strong>Инвестиционный доход:</strong> {investmentIncome}</p>
      <p><strong>Налоговый вычет (сумма возвратов):</strong> {taxTotal} ({taxRate}% от годовых взносов; <a href="https://fincult.info/article/nalogovye-vychety-na-dolgosrochnye-sberezheniya/">Финкульт</a>){taxNote}</p>
    </div>

    <h2>💸 Размер предполагаемых выплат</h2>
    <div class="section">
      <ul>
        <li>Пожизненно (условно, 20 лет): {lifePayment}/мес</li>
        <li>На 10 лет: {tenYearPayment}/мес</li>
        <li>Единовременно: {lumpSum}</li>
      </ul>
    </div>

    <div class="footer">
      Расчёт является приблизительным и не учитывает индивидуальные условия договоров НПФ. Проверьте данные и проконсультируйтесь с вашим фонтом перед принятием решения.
    </div>
  </body>
</html>`,
    },
  },

  /** Общие сообщения об ошибках */
  ERRORS: {
    GENERIC: `❌ Произошла ошибка. Попробуйте позже.`,
  },

  /** Тексты кнопок */
  BUTTONS: {
    CALCULATE: '🧮 Рассчитать',
    INFO: 'ℹ️ Что такое ПДС?',
    CALCULATE_EXTRA_PAYOUT: '💰 Доп. выплата',
    CALCULATE_CAPITAL: '🏦 Капитал к началу выплат',
    CALCULATE_WITHOUT_GOAL: '📊 Рассчитать от взноса',
    CAPITAL_CONTINUE: '➡️ Продолжить',
    CAPITAL_GENDER_MALE: '👨 Мужчина',
    CAPITAL_GENDER_FEMALE: '👩 Женщина',
    CAPITAL_INCOME_LOW: '📉 До 80 000 ₽/мес',
    CAPITAL_INCOME_MID: '📈 80 001–150 000 ₽/мес',
    CAPITAL_INCOME_HIGH: '💼 Свыше 150 000 ₽/мес',
    CAPITAL_NDFL_13: '13% НДФЛ',
    CAPITAL_NDFL_15: '15% НДФЛ',
    CAPITAL_NDFL_18: '18% НДФЛ',
    CAPITAL_NDFL_20: '20% НДФЛ',
    CAPITAL_NDFL_22: '22% НДФЛ',
    CAPITAL_REINVEST_YES: '✅ Да',
    CAPITAL_REINVEST_NO: '❌ Нет',
    CAPITAL_RESULT_PDF: '📄 Получить PDF-отчёт',
    BACK_TO_MENU: '⬅️ Главное меню',
  },

  /** Данные для callback-запросов */
  CALLBACK_DATA: {
    CALCULATE: 'calculate',
    INFO: 'info',
    CALCULATE_EXTRA_PAYOUT: 'calculate_extra_payout',
    CALCULATE_CAPITAL: 'calculate_capital',
    CALCULATE_WITHOUT_GOAL: 'calculate_without_goal',
    CAPITAL_CONTINUE: 'capital_continue',
    CAPITAL_GENDER_MALE: 'capital_gender_male',
    CAPITAL_GENDER_FEMALE: 'capital_gender_female',
    CAPITAL_INCOME_LOW: 'capital_income_low',
    CAPITAL_INCOME_MID: 'capital_income_mid',
    CAPITAL_INCOME_HIGH: 'capital_income_high',
    CAPITAL_NDFL_13: 'capital_ndfl_13',
    CAPITAL_NDFL_15: 'capital_ndfl_15',
    CAPITAL_NDFL_18: 'capital_ndfl_18',
    CAPITAL_NDFL_20: 'capital_ndfl_20',
    CAPITAL_NDFL_22: 'capital_ndfl_22',
    CAPITAL_REINVEST_YES: 'capital_reinvest_yes',
    CAPITAL_REINVEST_NO: 'capital_reinvest_no',
    CAPITAL_RESULT_PDF: 'capital_pdf',
    BACK_TO_MENU: 'start',
  },
};

// ========================================
// УТИЛИТЫ ДЛЯ СОЗДАНИЯ ИНТЕРФЕЙСА
// ========================================

/**
 * Создает клавиатуру с кнопками для главного меню
 * @returns {Object} Объект клавиатуры для Telegram
 */
export function createMainKeyboard() {
  return {
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: MESSAGES.BUTTONS.CALCULATE,
            callback_data: MESSAGES.CALLBACK_DATA.CALCULATE,
          },
          {
            text: MESSAGES.BUTTONS.INFO,
            callback_data: MESSAGES.CALLBACK_DATA.INFO,
          },
        ],
      ],
    },
  };
}

/**
 * Создает клавиатуру для выбора типа расчета
 * @returns {Object} Клавиатура с вариантами расчета
 */
export function createCalculateKeyboard() {
  return {
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: MESSAGES.BUTTONS.CALCULATE_EXTRA_PAYOUT,
            callback_data: MESSAGES.CALLBACK_DATA.CALCULATE_EXTRA_PAYOUT,
          },
        ],
        [
          {
            text: MESSAGES.BUTTONS.CALCULATE_CAPITAL,
            callback_data: MESSAGES.CALLBACK_DATA.CALCULATE_CAPITAL,
          },
        ],
        [
          {
            text: MESSAGES.BUTTONS.CALCULATE_WITHOUT_GOAL,
            callback_data: MESSAGES.CALLBACK_DATA.CALCULATE_WITHOUT_GOAL,
          },
        ],
        [
          {
            text: MESSAGES.BUTTONS.BACK_TO_MENU,
            callback_data: MESSAGES.CALLBACK_DATA.BACK_TO_MENU,
          },
        ],
      ],
    },
  };
}

/**
 * Клавиатура "Продолжить" для сценария капитала
 */
export function createCapitalContinueKeyboard() {
  return {
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: MESSAGES.BUTTONS.CAPITAL_CONTINUE,
            callback_data: MESSAGES.CALLBACK_DATA.CAPITAL_CONTINUE,
          },
        ],
        [
          {
            text: MESSAGES.BUTTONS.BACK_TO_MENU,
            callback_data: MESSAGES.CALLBACK_DATA.BACK_TO_MENU,
          },
        ],
      ],
    },
  };
}

export function createCapitalGenderKeyboard() {
  return {
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: MESSAGES.BUTTONS.CAPITAL_GENDER_MALE,
            callback_data: MESSAGES.CALLBACK_DATA.CAPITAL_GENDER_MALE,
          },
          {
            text: MESSAGES.BUTTONS.CAPITAL_GENDER_FEMALE,
            callback_data: MESSAGES.CALLBACK_DATA.CAPITAL_GENDER_FEMALE,
          },
        ],
        [
          {
            text: MESSAGES.BUTTONS.BACK_TO_MENU,
            callback_data: MESSAGES.CALLBACK_DATA.BACK_TO_MENU,
          },
        ],
      ],
    },
  };
}

export function createCapitalIncomeKeyboard() {
  return {
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: MESSAGES.BUTTONS.CAPITAL_INCOME_LOW,
            callback_data: MESSAGES.CALLBACK_DATA.CAPITAL_INCOME_LOW,
          },
        ],
        [
          {
            text: MESSAGES.BUTTONS.CAPITAL_INCOME_MID,
            callback_data: MESSAGES.CALLBACK_DATA.CAPITAL_INCOME_MID,
          },
        ],
        [
          {
            text: MESSAGES.BUTTONS.CAPITAL_INCOME_HIGH,
            callback_data: MESSAGES.CALLBACK_DATA.CAPITAL_INCOME_HIGH,
          },
        ],
        [
          {
            text: MESSAGES.BUTTONS.BACK_TO_MENU,
            callback_data: MESSAGES.CALLBACK_DATA.BACK_TO_MENU,
          },
        ],
      ],
    },
  };
}

export function createCapitalNdflKeyboard() {
  return {
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: MESSAGES.BUTTONS.CAPITAL_NDFL_13,
            callback_data: MESSAGES.CALLBACK_DATA.CAPITAL_NDFL_13,
          },
          {
            text: MESSAGES.BUTTONS.CAPITAL_NDFL_15,
            callback_data: MESSAGES.CALLBACK_DATA.CAPITAL_NDFL_15,
          },
        ],
        [
          {
            text: MESSAGES.BUTTONS.CAPITAL_NDFL_18,
            callback_data: MESSAGES.CALLBACK_DATA.CAPITAL_NDFL_18,
          },
          {
            text: MESSAGES.BUTTONS.CAPITAL_NDFL_20,
            callback_data: MESSAGES.CALLBACK_DATA.CAPITAL_NDFL_20,
          },
        ],
        [
          {
            text: MESSAGES.BUTTONS.CAPITAL_NDFL_22,
            callback_data: MESSAGES.CALLBACK_DATA.CAPITAL_NDFL_22,
          },
        ],
        [
          {
            text: MESSAGES.BUTTONS.BACK_TO_MENU,
            callback_data: MESSAGES.CALLBACK_DATA.BACK_TO_MENU,
          },
        ],
      ],
    },
  };
}

export function createCapitalReinvestKeyboard() {
  return {
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: MESSAGES.BUTTONS.CAPITAL_REINVEST_YES,
            callback_data: MESSAGES.CALLBACK_DATA.CAPITAL_REINVEST_YES,
          },
          {
            text: MESSAGES.BUTTONS.CAPITAL_REINVEST_NO,
            callback_data: MESSAGES.CALLBACK_DATA.CAPITAL_REINVEST_NO,
          },
        ],
        [
          {
            text: MESSAGES.BUTTONS.BACK_TO_MENU,
            callback_data: MESSAGES.CALLBACK_DATA.BACK_TO_MENU,
          },
        ],
      ],
    },
  };
}

export function createCapitalResultKeyboard() {
  return {
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: MESSAGES.BUTTONS.CAPITAL_RESULT_PDF,
            callback_data: MESSAGES.CALLBACK_DATA.CAPITAL_RESULT_PDF,
          },
        ],
        [
          {
            text: MESSAGES.BUTTONS.BACK_TO_MENU,
            callback_data: MESSAGES.CALLBACK_DATA.BACK_TO_MENU,
          },
        ],
      ],
    },
  };
}
