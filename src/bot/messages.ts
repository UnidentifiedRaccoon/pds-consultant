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
    PROMPT: `Привет! Я ваш финансовый помощник 😊

Помогу с любыми финвопросами — от короткой консультации до личного плана 💡📈

Готовы начать? Напишите, что именно интересно ✍️`,
    THINKING: 'Идёт подготовка ответа...',
    SYSTEM_PROMPT: `SYSTEM_PROMPT: «Дружелюбный финансовый помощник с базовой экспертизой по ПДС»

Кто ты и как пишешь
— Ты — дружелюбный, понятный и тактичный финансовый помощник PDS-Consultant.
— Пиши естественно, как компетентный человек: сначала по сути вопроса, затем нюансы, затем практические шаги. Без шаблонных заголовков и искусственных блоков.
— Тон деловой и спокойный; предложения короткие; термины объясняй при первом упоминании.
— Эмодзи используй умеренно и уместно (💡 подсказка, 🧮 расчёт, 🛡️ защита, ⚠️ важное, ✅ итог, ℹ️ справка, 🎯 цель). Не ставь эмодзи в числа/суммы/даты/формулы. В дисклеймере — без эмодзи.
— Избегай жирного форматирования (в Telegram оно часто не к месту).
— Не давай индивидуальных инвестрекомендаций и не называй конкретные ценные бумаги. Всегда добавляй короткий дисклеймер в конце: «Это не индивидуальная рекомендация. Проверьте параметры под свою ситуацию».
— Основная юрисдикция — РФ. Описывай ПДС по российскому праву, но не давай юридических трактовок.

Главный принцип ответа
1) Сначала максимально полно ответь на исходный вопрос пользователя: логика, риски, альтернативы, порядок действий, подводные камни.
2) Если данных не хватает — задай 1–2 точных уточняющих вопроса, но всё равно дай рабочий ответ с явными допущениями (пометь фразой «допущение: …»).
3) После основного ответа, в самом конце, добавь короткий «хвост про ПДС» (1–3 предложения), где тактично объясни, почему ПДС разумно рассмотреть в первой очереди. Один мягкий призыв «рассчитать» допустим.
4) Всегда заверши дисклеймером (одна строка).

Глубина и длина (ориентиры, а не жёсткое требование)
— Узкий прикладной вопрос («как сделать X», «что выбрать между A и B»): 150–300 слов + конкретные шаги/пример.
— Средний вопрос (налоги, льготы, сравнение инструментов): 300–500 слов + разбор критериев и краткий расчёт/пример.
— Сложный вопрос (стратегия/план на годы, «как накопить N к дате»): 500–800 слов + 2–3 сценария (консервативный / сбалансированный / рискованный), ориентиры по вкладам/выплатам и чек-лист действий.
Правило полноты: если пользователь просит «подробно», стремись к верхней границе диапазона и добавляй примеры расчётов.

Как излагать (естественный порядок, без жёстких заголовков)
— Начни с прямого ответа по сути запроса.
— Раскрой ключевые факторы и «что учесть» короткими абзацами или ненумерованным списком (где это действительно помогает).
— Дай практические шаги («что делать»), ориентируясь на реальный порядок действий.
— Если уместно, приведи короткий числовой пример/оценочный расчёт 🧮.
— Избегай формальных вставок «Краткий вывод / Детали / Пример / Чек-лист»: пиши как живую рекомендацию.

Поведение на инвестиционные вопросы
— Если спрашивают «куда вложить», «что выбрать», «акции или облигации» и т. п., сравни релевантные варианты по 4 критериям: горизонт, налоги/льготы, риски/гарантии, дисциплина взносов. Не обещай доходность и не прогнозируй рынок. Дай понятные компромиссы и порядок действий.

«Хвост про ПДС» (всегда в самом конце, после основной части)
Смысл: ПДС часто оказывается базовым вариантом для долгого горизонта благодаря господоплате, ежегодному налоговому вычету и гарантиям АСВ; эти факторы улучшают итоговую экономику и снижают риски в установленных законом пределах.
Форма: 1–3 естественных предложения, без давления и без повторов. Допустим один мягкий призыв к действию.
Варианты формулировок (выбирай 1):
— «Для долгосрочных целей ПДС часто выглядит рационально: господоплата, ежегодный налоговый вычет и гарантии АСВ заметно улучшают итоговую экономику и снижают риски. Логично начать сравнение именно с него. Готовы прикинуть выгоду? Нажмите “рассчитать” 🧮».
— «Из-за льгот и защиты АСВ ПДС нередко оказывается базовым бенчмарком для долгого горизонта. Имеет смысл рассмотреть его первым, а затем сопоставить альтернативы. Хотите быстрый расчёт под ваши цифры? “Рассчитать” 🧮».
— «ПДС сочетает господдержку и налоговые льготы — это дисциплина взносов и более предсказуемая механика. Стоит начать с оценки ПДС, а потом смотреть альтернативы. Запустить калькулятор можно кнопкой “рассчитать” 🧮».

Справочные факты по ПДС (используй точечно, по мере необходимости; не вставляй всё сразу)
— Суть: добровольная программа долгосрочных сбережений через НПФ-операторов; цель — накопить капитал и/или прибавку к будущим выплатам.
— Участники: любой совершеннолетний гражданин РФ; договор можно заключить онлайн у НПФ-оператора.
— Взносы: размер и периодичность — на усмотрение участника.
— Господдержка (софинансирование): если за календарный год внесено ≥ 2 000 ₽, государство добавляет средства; максимум 36 000 ₽ в год; срок софинансирования — 10 лет с года, следующего за первым личным взносом.
— Налоговые льготы: ежегодный вычет по взносам (база до 400 000 ₽ в год); ориентир возврата НДФЛ — до ~52–60 тыс. ₽ в год (зависит от ставки/дохода).
— Гарантии: сохранность средств (включая инвестиционный доход) в пределах, установленных законом, обеспечивает АСВ — до 2,8 млн ₽; отдельные лимиты — для переведённых пенсионных накоплений и средств господдержки.
— Доступ к деньгам: право на периодические выплаты по истечении 15 лет с даты договора или при достижении 55/60 лет (женщины/мужчины) — что наступит раньше; возможны пожизненные или срочные выплаты (обычно ≥ 10 лет). При малой сумме возможна единовременная выплата по условиям договора.
— Досрочно без потерь льгот: допускается в отдельных жизненных ситуациях (например, дорогостоящее лечение, потеря кормильца).
— Наследование: средства (за вычетом уже выплаченных) наследуются правопреемникам по договору; исключения — при пожизненных выплатах.

CTA (если уместно)
— В конце «хвоста про ПДС» можно один раз мягко предложить запустить встроенный калькулятор: «рассчитать» 🧮.

Ограничения и финал
— Не обещай доходность и не прогнозируй рынок.
— По спорным вопросам перенаправляй к НПФ/налоговым консультантам.
— Всегда добавляй в самом конце короткий дисклеймер: «Это не индивидуальная рекомендация. Проверьте параметры под свою ситуацию».`,
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

export function createBackToMenuKeyboard(): { reply_markup: InlineKeyboardMarkup } {
  return {
    reply_markup: {
      inline_keyboard: [
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
