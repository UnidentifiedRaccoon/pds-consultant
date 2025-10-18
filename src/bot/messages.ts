/**
 * Фразы и сообщения бота PDS Consultant
 */

export const MESSAGES = {
  /** Приветственное сообщение при команде /start */
  WELCOME: `👋 Привет! Я бот-консультант по ПДС.

🎯 Что я умею:
• Рассчитать взносы по ПДС
• Узнать о ПДС
• Получить консультацию

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

  /** Консультация с LLM */
  CONSULTATION: {
    PROMPT: `🧭 Давайте разберёмся. Уточните, какую цель, горизонт (в годах) и уровень риска рассматриваете (консервативно / сбалансированно / рискованно).`,
    SYSTEM_PROMPT: `СИСТЕМНЫЙ ПРОМПТ — «Дружелюбный финансовый помощник с базовой экспертизой по ПДС»

Роль и стиль
— Ты — дружелюбный, понятный и тактичный финансовый помощник PDS-Consultant. Пиши коротко и по делу, без жаргона.
— Используй эмодзи умеренно и уместно: 💡 подсказка, 🧮 расчёт, 📈 рост, 🛡️ защита, ⚠️ важное, ✅ итог, ℹ️ справка, 🎯 цель. Не заменяй слова эмодзи и не вставляй их в числа/суммы/дату/формулы. В дисклеймерах эмодзи не используй.
— Избегай форматирования жирным (в Telegram оно не всегда уместно).
— Не давай индивидуальных инвестиционных рекомендаций и не называй конкретные ценные бумаги. Всегда добавляй короткий дисклеймер: «Это не индивидуальная рекомендация. Проверьте параметры под свою ситуацию».
— Россия — основная юрисдикция: описывай ПДС по законам РФ, юридические трактовки не давай.

Как отвечать

Сначала уточни цель и горизонт (сколько лет) и уровень риска (консервативно / сбалансированно / рискованно).

Структура ответа:
— Краткий вывод ✅
— Что важно учесть 💡
— Что сделать дальше (чек-лист)

Завершай мягким CTA: «Готовы прикинуть выгоду? Нажмите “рассчитать” 🧮».

Поведение при вопросах об инвестициях
— Если спрашивают «куда вложить», «что выбрать», «акции или облигации» и т. п., ненавязчиво, но настойчиво предложи рассмотреть ПДС как базовый долгосрочный инструмент.
— Сравни ПДС с «обычными» инструментами по 4 критериям: горизонт, налоги/льготы, риски/гарантии, дисциплина накоплений.
— Обязательно предложи запустить встроенный калькулятор кнопкой «рассчитать» 🧮.

Короткая справка по ПДС (используй факты в объяснениях)
— Что это: добровольная программа долгосрочных сбережений через НПФ (операторы программы). Цель — накопить капитал и/или прибавку к будущим выплатам.
— Кто может участвовать: любой совершеннолетний гражданин РФ. Договор можно заключить онлайн у НПФ-оператора.
— Взносы: сумма и периодичность — на усмотрение участника.
— Господдержка (софинансирование): если за календарный год внесено ≥ 2 000 ₽, государство добавляет средства; максимум 36 000 ₽ в год, срок софинансирования — 10 лет с года, следующего за первым личным взносом.
— Налоговые льготы: ежегодный вычет по взносам (сумма взносов до 400 000 ₽ в год), ориентир по возврату НДФЛ — до 52–60 тыс. ₽ в год (зависит от ставки/дохода).
— Гарантии: сохранность средств (включая инвестиционный доход) гарантируется АСВ — до 2,8 млн ₽; отдельные лимиты — для переведённых пенсионных накоплений и средств господдержки.
— Когда можно получить деньги: право на периодические выплаты — по истечении 15 лет с даты договора или при достижении возраста 55 (женщины) / 60 (мужчины) — что наступит раньше. Возможны пожизненные или срочные выплаты (обычно не менее 10 лет). При малой сумме — единовременная выплата по условиям договора.
— Досрочно без потерь льгот: допускается в отдельных жизненных ситуациях (например, дорогостоящее лечение, потеря кормильца).
— Наследование: средства (за вычетом уже выплаченных) наследуются правопреемникам по договору; исключения — при пожизненных выплатах.

Фразы-подсказки (варианты)
— «Для долгосрочных целей ПДС даёт плюсы: господоплата, налоговый вычет и гарантии 🛡️ Хотите прикинуть выгоду? Нажмите “рассчитать” 🧮».
— «Если планируете на 10–15 лет, начните с ПДС: это дисциплина взносов + льготы. Запустим калькулятор? “Рассчитать” 🧮».
— «Сделаем быстрый расчёт с учётом взносов и льгот? Жмите “рассчитать” 🧮».

Ограничения
— Не обещай доходность и не прогнозируй рынок.
— По спорным вопросам перенаправляй к НПФ/налоговым консультантам.
— Если пользователь пишет «подтверждаю данные, выполни расчёт», сразу переходи к расчёту без дополнительных уточнений.`,
    API_ERROR: `⚠️ Не удалось получить консультацию. Попробуйте ещё раз немного позже.`,
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
      TARGET_SUM: `🎯 Целевая сумма к 15-му году
Введите целое число в рублях (от 50 000 до 100 000 000).
Например: 5 000 000`,
      GENDER: `👤 Пол
Выберите вариант на клавиатуре ниже:`,
      AGE: `🎂 Возраст сейчас
Введите целое число от 18 до 100.
Например: 35`,
      INCOME: `💼 Доход (для господдержки)
Выберите подходящий диапазон:`,
      NDFL: `💳 Ставка НДФЛ
Выберите вариант:`,
      REINVEST: `🔁 Реинвестировать налоговый вычет в ПДС?
Выберите: Да / Нет`,
    },
    ERRORS: {
      INVALID_TARGET_SUM: `😅 Не удалось распознать сумму.
Введите целое число от 50 000 до 100 000 000 ₽ без пробелов и лишних символов.
Например: 5000000`,
      INVALID_AGE: `😅 Нужна цифра от 18 до 100.
Например: 35`,
    },
    RESPONSES: {
      COMPLETE: `✅ Спасибо! Мы сохранили ответы. Подробный расчёт появится совсем скоро.`,
      RESULT_HEADER: `✅ Спасибо! Считаю при доходности <b>10% годовых</b> и ежемесячной капитализации...
Учту: госдоплату (<a href="https://cbr.ru/RSCI/activity_npf/program/">до 36 000 ₽/год в течение 10 лет</a>; порог взносов 2 000 ₽/год) и налоговый вычет по выбранной ставке (<a href="https://fincult.info/article/nalogovye-vychety-na-dolgosrochnye-sberezheniya/">лимит базы 400 000 ₽/год</a>). Дополнительно: справка по ПДС от <a href="https://minfin.gov.ru/ru/perfomance/pds/">Минфин</a>.`,
      RESULT_BODY: `<b>📊 Сводка на конец 15-го года (разовая выплата):</b>

<b>Личные взносы:</b> ≈ {personalTotal}

<b>Ежемесячный взнос (расчётный):</b> ≈ {monthlyContribution}/мес

<b>Софинансирование государства:</b> ≈ {stateTotal} (по {annualStateSupport}/год в первые 10 лет; <a href="https://cbr.ru/RSCI/activity_npf/program/">Банк России</a>)

<b>Перевод пенсионных сбережений (ОПС):</b> {opsTransfer}

<b>Инвестиционный доход:</b> ≈ {investmentIncome}

<b>Налоговый вычет (сумма возвратов):</b> ≈ {taxTotal} ({taxRate}% от ваших годовых взносов в пределах лимита 400 000 ₽/год; <a href="https://fincult.info/article/nalogovye-vychety-na-dolgosrochnye-sberezheniya/">Финкульт</a>){taxNote}

<b>Размер ежемесячных выплат (оценка):</b>
• <i>пожизненно</i>: ≈ {lifePayment}/мес
• <i>на 10 лет</i>: ≈ {tenYearPayment}/мес
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
    CONSULTATION: '💬 Получить консультацию',
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
    CONSULTATION: 'consultation',
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

type InlineKeyboardMarkup = {
  inline_keyboard: Array<Array<{ text: string; callback_data: string }>>;
};

/**
 * Создает клавиатуру с кнопками для главного меню
 */
export function createMainKeyboard(): { reply_markup: InlineKeyboardMarkup } {
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
        [
          {
            text: MESSAGES.BUTTONS.CONSULTATION,
            callback_data: MESSAGES.CALLBACK_DATA.CONSULTATION,
          },
        ],
      ],
    },
  };
}

export function createInfoKeyboard(): { reply_markup: InlineKeyboardMarkup } {
  return {
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: MESSAGES.BUTTONS.CALCULATE,
            callback_data: MESSAGES.CALLBACK_DATA.CALCULATE,
          },
        ],
      ],
    },
  };
}

export function createConsultationKeyboard(): { reply_markup: InlineKeyboardMarkup } {
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
 */
export function createCalculateKeyboard(): { reply_markup: InlineKeyboardMarkup } {
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
export function createCapitalContinueKeyboard(): { reply_markup: InlineKeyboardMarkup } {
  return {
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: MESSAGES.BUTTONS.CAPITAL_CONTINUE,
            callback_data: MESSAGES.CALLBACK_DATA.CAPITAL_CONTINUE,
          },
        ],
      ],
    },
  };
}

export function createCapitalGenderKeyboard(): { reply_markup: InlineKeyboardMarkup } {
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
      ],
    },
  };
}

export function createCapitalIncomeKeyboard(): { reply_markup: InlineKeyboardMarkup } {
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
      ],
    },
  };
}

export function createCapitalNdflKeyboard(): { reply_markup: InlineKeyboardMarkup } {
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
      ],
    },
  };
}

export function createCapitalReinvestKeyboard(): { reply_markup: InlineKeyboardMarkup } {
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
      ],
    },
  };
}

export function createCapitalResultKeyboard(): { reply_markup: InlineKeyboardMarkup } {
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
