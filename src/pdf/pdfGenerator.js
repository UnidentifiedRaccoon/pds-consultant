/**
 * Простой сервис генерации PDF-отчётов с помощью Playwright
 * Конвертирует HTML-отчёты в PDF с минималистичным форматированием
 */

import { chromium } from 'playwright';
import { createSimpleReportHtml } from './simpleParser.js';
import { logger } from '../logger.js';

/**
 * Генерирует PDF-отчёт из ответа бота
 * @param {string} botResponse - Ответ бота в markdown-формате
 * @param {Object} options - Опции генерации
 * @param {string} options.reportDate - Дата отчёта
 * @param {string} options.filename - Имя файла (без расширения)
 * @returns {Promise<Buffer>} PDF-файл в виде Buffer
 */
export async function generatePdfReport(botResponse, options = {}) {
  const { reportDate, filename = 'pension-report' } = options;

  let browser = null;

  try {
    logger.info('PDF: Начинаем генерацию PDF-отчёта', {
      filename,
      botResponseLength: botResponse?.length || 0,
      hasReportDate: !!reportDate,
      environment: process.env.NODE_ENV,
      memoryUsage: process.memoryUsage(),
    });

    // Проверяем входные данные
    if (!botResponse || typeof botResponse !== 'string') {
      throw new Error(
        'Некорректные данные для генерации PDF: отсутствует или неверный формат ответа бота'
      );
    }

    if (botResponse.trim().length === 0) {
      throw new Error('Пустой ответ бота для генерации PDF');
    }

    // Проверяем доступность Playwright
    const isPlaywrightAvailable = await checkPlaywrightAvailability();
    if (!isPlaywrightAvailable) {
      // В продакшене пытаемся переустановить браузеры
      if (process.env.NODE_ENV === 'production') {
        logger.warn('Playwright недоступен в продакшене, пытаемся переустановить браузеры...');
        try {
          const { execSync } = await import('child_process');
          execSync('npx playwright install chromium --with-deps', {
            stdio: 'pipe',
            timeout: 60000, // 60 секунд таймаут
          });

          const isAvailableAfterReinstall = await checkPlaywrightAvailability();
          if (!isAvailableAfterReinstall) {
            throw new Error(
              'Playwright недоступен даже после переустановки. Обратитесь к администратору.'
            );
          }
        } catch (reinstallError) {
          logger.error('Ошибка при переустановке браузеров', { error: reinstallError.message });
          throw new Error(
            'Playwright недоступен и не удалось переустановить браузеры. Обратитесь к администратору.'
          );
        }
      } else {
        throw new Error('Playwright недоступен. Убедитесь, что браузеры установлены.');
      }
    }

    // Создаём HTML-отчёт
    const htmlContent = createSimpleReportHtml(botResponse, { reportDate });

    // Запускаем браузер
    browser = await chromium.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--disable-web-security',
        '--disable-features=VizDisplayCompositor',
        '--no-zygote',
        '--single-process', // Экономит RAM в serverless
      ],
    });

    const context = await browser.newContext({
      viewport: { width: 1200, height: 800 },
    });

    const page = await context.newPage();

    // Блокируем внешние ресурсы в serverless окружении
    if (process.env.NODE_ENV === 'production') {
      await page.route('**/*', (route) => {
        const url = route.request().url();
        // Блокируем внешние ресурсы (шрифты, изображения, скрипты)
        if (
          url.includes('fonts.googleapis.com') ||
          url.includes('fonts.gstatic.com') ||
          url.includes('googleapis.com') ||
          url.includes('gstatic.com')
        ) {
          route.abort();
        } else {
          route.continue();
        }
      });
    }

    // Устанавливаем содержимое страницы
    await page.setContent(htmlContent, {
      waitUntil: 'domcontentloaded', // Изменено с networkidle на domcontentloaded
      timeout: 15000, // Уменьшено до 15 секунд
    });

    // В serverless окружении не ждём загрузки внешних ресурсов
    if (process.env.NODE_ENV !== 'production') {
      await page.waitForTimeout(1000);
    }

    try {
      // Минимальные настройки PDF для serverless окружения
      const pdfOptions = {
        format: 'A4',
        printBackground: false, // Отключаем фоновые изображения для упрощения
        margin: {
          top: '10mm',
          right: '10mm',
          bottom: '10mm',
          left: '10mm',
        },
        // Дополнительные настройки для стабильности в serverless
        preferCSSPageSize: false,
        displayHeaderFooter: false, // Отключаем header/footer для упрощения
      };

      // В development окружении добавляем header/footer
      if (process.env.NODE_ENV !== 'production') {
        pdfOptions.displayHeaderFooter = true;
        pdfOptions.headerTemplate = `
          <div style="font-size: 10px; color: #6b7280; text-align: center; width: 100%; padding: 5px;">
            PDS Consultant - Отчёт по пенсионным накоплениям
          </div>
        `;
        pdfOptions.footerTemplate = `
          <div style="font-size: 10px; color: #6b7280; text-align: center; width: 100%; padding: 5px;">
            Страница <span class="pageNumber"></span> из <span class="totalPages"></span>
          </div>
        `;
      }

      // В serverless окружении используем более короткий таймаут
      const isServerless = process.env.NODE_ENV === 'production';
      const pdfTimeout = isServerless ? 15000 : 30000; // 15 секунд для serverless, 30 для обычного

      let pdfBuffer;

      // В serverless окружении пробуем сначала самый простой подход
      if (isServerless && !pdfBuffer) {
        try {
          const simpleOptions = {
            format: 'A4',
            margin: { top: '5mm', right: '5mm', bottom: '5mm', left: '5mm' },
            printBackground: false,
            preferCSSPageSize: false,
            displayHeaderFooter: false,
          };

          const simplePdfPromise = page.pdf(simpleOptions);

          const simpleTimeoutPromise = new Promise((_resolve, reject) => {
            setTimeout(() => {
              reject(new Error('Simple PDF generation timeout'));
            }, 10000); // 10 секунд для простого подхода
          });

          pdfBuffer = await Promise.race([simplePdfPromise, simpleTimeoutPromise]);
        } catch (simpleError) {
          // Продолжаем с основным подходом
        }
      }

      if (!pdfBuffer) {
        try {
          // Добавляем таймаут для генерации PDF
          const pdfPromise = page.pdf(pdfOptions);

          let timer;
          const timeoutPromise = new Promise((_resolve, reject) => {
            timer = setTimeout(() => {
              reject(new Error('PDF generation timeout'));
            }, pdfTimeout);
          });

          pdfBuffer = await Promise.race([pdfPromise, timeoutPromise]);
          clearTimeout(timer);
        } catch (firstError) {
          // Закрываем вкладку при ошибке для освобождения памяти
          try {
            await page.close({ runBeforeUnload: false });
          } catch (closeError) {
            logger.warn('PDF: Ошибка при закрытии вкладки', { error: closeError.message });
          }

          // Создаем новую вкладку для fallback попыток
          const newPage = await context.newPage();
          await newPage.setContent(htmlContent, {
            waitUntil: 'domcontentloaded',
            timeout: 10000,
          });

          // Пробуем с минимальными настройками
          const minimalOptions = {
            format: 'A4',
            margin: { top: '5mm', right: '5mm', bottom: '5mm', left: '5mm' },
          };

          try {
            const minimalPdfPromise = newPage.pdf(minimalOptions);

            const minimalTimeout = isServerless ? 10000 : 20000; // 10 секунд для serverless, 20 для обычного

            const minimalTimeoutPromise = new Promise((_resolve, reject) => {
              setTimeout(() => {
                reject(new Error('Minimal PDF generation timeout'));
              }, minimalTimeout);
            });

            pdfBuffer = await Promise.race([minimalPdfPromise, minimalTimeoutPromise]);
          } catch (minimalError) {
            // В serverless окружении пробуем еще более простой подход
            if (isServerless) {
              try {
                const ultraMinimalOptions = {
                  format: 'A4',
                  margin: { top: '2mm', right: '2mm', bottom: '2mm', left: '2mm' },
                  printBackground: false,
                  preferCSSPageSize: false,
                  displayHeaderFooter: false,
                };

                const ultraMinimalPromise = newPage.pdf(ultraMinimalOptions);

                const ultraTimeoutPromise = new Promise((_resolve, reject) => {
                  setTimeout(() => {
                    reject(new Error('Ultra-minimal PDF generation timeout'));
                  }, 8000); // 8 секунд для ultra-minimal
                });

                pdfBuffer = await Promise.race([ultraMinimalPromise, ultraTimeoutPromise]);
              } catch (ultraError) {
                throw new Error(`PDF generation failed: ${ultraError.message}`);
              }
            } else {
              throw new Error(`PDF generation failed: ${minimalError.message}`);
            }
          }
        }
      }

      if (!pdfBuffer || pdfBuffer.length === 0) {
        throw new Error('PDF буфер пуст');
      }

      return pdfBuffer;
    } catch (pdfError) {
      logger.error('Ошибка при генерации PDF', {
        error: pdfError.message,
        name: pdfError.name,
        stack: pdfError.stack,
      });
      throw new Error(`Ошибка генерации PDF: ${pdfError.message}`);
    }
  } catch (error) {
    // Детальное логирование ошибки
    logger.error('Ошибка при генерации PDF-отчёта', {
      error: error.message,
      stack: error.stack,
      filename,
      errorName: error.name,
      errorCode: error.code,
      botResponseLength: botResponse?.length || 0,
      hasBrowser: !!browser,
    });

    // Специфичные сообщения об ошибках
    let userMessage = 'Не удалось сгенерировать PDF-отчёт';

    if (error.message.includes('Playwright недоступен')) {
      userMessage = 'Ошибка: браузер для генерации PDF недоступен. Обратитесь к администратору.';
    } else if (error.message.includes('timeout')) {
      userMessage = 'Ошибка: превышено время ожидания при генерации PDF. Попробуйте позже.';
    } else if (error.message.includes('Некорректные данные')) {
      userMessage = 'Ошибка: некорректные данные для генерации PDF.';
    } else if (error.message.includes('Пустой ответ')) {
      userMessage = 'Ошибка: нет данных для генерации PDF.';
    } else if (error.message.includes('ENOENT') || error.message.includes('ENOTFOUND')) {
      userMessage = 'Ошибка: не найдены необходимые файлы для генерации PDF.';
    } else if (error.message.includes('EACCES') || error.message.includes('EPERM')) {
      userMessage = 'Ошибка: недостаточно прав для генерации PDF.';
    }

    throw new Error(userMessage);
  } finally {
    if (browser) {
      try {
        logger.info('Закрываем браузер...');
        await browser.close();
        logger.info('Браузер закрыт');
      } catch (closeError) {
        logger.error('Ошибка при закрытии браузера', {
          error: closeError.message,
          stack: closeError.stack,
        });
      }
    }
  }
}

/**
 * Генерирует PDF-отчёт и сохраняет его в файл
 * @param {string} botResponse - Ответ бота в markdown-формате
 * @param {string} filePath - Путь для сохранения файла
 * @param {Object} options - Опции генерации
 * @returns {Promise<string>} Путь к сохранённому файлу
 */
export async function generatePdfReportToFile(botResponse, filePath, options = {}) {
  const fs = await import('fs/promises');
  const path = await import('path');

  try {
    // Генерируем PDF
    const pdfBuffer = await generatePdfReport(botResponse, options);

    // Создаём директорию если не существует
    const dir = path.dirname(filePath);
    await fs.mkdir(dir, { recursive: true });

    // Сохраняем файл
    await fs.writeFile(filePath, pdfBuffer);

    return filePath;
  } catch (error) {
    logger.error('Ошибка при сохранении PDF-отчёта', {
      error: error.message,
      filePath,
    });
    throw error;
  }
}

/**
 * Проверяет доступность Playwright
 * @returns {Promise<boolean>} true если Playwright доступен
 */
export async function checkPlaywrightAvailability() {
  let browser = null;
  try {
    browser = await chromium.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--disable-web-security',
        '--disable-features=VizDisplayCompositor',
      ],
    });

    return true;
  } catch (error) {
    logger.error('Playwright недоступен', {
      error: error.message,
      errorName: error.name,
      errorCode: error.code,
    });
    return false;
  } finally {
    if (browser) {
      try {
        await browser.close();
      } catch (closeError) {
        logger.warn('Ошибка при закрытии тестового браузера', {
          error: closeError.message,
        });
      }
    }
  }
}
