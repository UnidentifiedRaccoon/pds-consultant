import { performance } from 'node:perf_hooks';
import { chromium, type Browser, type PDFOptions } from 'playwright';
import { MESSAGES } from './messages.js';
import { CapitalLumpSumResult } from '../../calculation-models/capital-lump-sum/index.js';
import { logger } from '../logger.js';

interface ConversationData {
  targetSum?: number;
  gender?: 'male' | 'female';
  age?: number;
  income?: 'low' | 'mid' | 'high';
  ndflRate?: string;
  reinvest?: boolean;
}

export interface PdfReportOptions {
  targetSum?: number;
  data?: ConversationData;
}

const CFG = {
  TIMEOUT_SET_CONTENT: 10_000,
  TIMEOUT_PDF_SIMPLE: 10_000,
  TIMEOUT_PDF_NORMAL: 12_000,
  TIMEOUT_PDF_MINIMAL: 8_000,
  DISABLE_BROWSER_REUSE: false,
  BLOCK_EXTERNAL: true,
  CHROMIUM_ARGS: [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-dev-shm-usage',
    '--disable-gpu',
    '--no-zygote',
    '--single-process',
  ],
  VIEWPORT: { width: 1200, height: 800 } as const,
} as const;

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 0,
  }).format(value);
}

function withTimeout<T>(promise: Promise<T>, ms: number, tag: string): Promise<T> {
  let timer: NodeJS.Timeout | null = null;
  const timeout = new Promise<never>((resolve, reject) => {
    void resolve;
    timer = setTimeout(() => reject(new Error(`${tag} timeout ${ms}ms`)), ms);
  });

  return Promise.race([promise, timeout]).finally(() => {
    if (timer) {
      clearTimeout(timer);
    }
  });
}

let browserPromise: Promise<Browser> | null = null;

async function launchBrowser(): Promise<Browser> {
  logger.info({ scope: 'pdf', step: 'browser:launch:start' }, 'pdf:browser:launch');
  const launchedAt = performance.now();
  const browser = await chromium.launch({ headless: true, args: CFG.CHROMIUM_ARGS });
  logger.info(
    {
      scope: 'pdf',
      step: 'browser:launch:success',
      durationMs: Math.round(performance.now() - launchedAt),
    },
    'pdf:browser:launch:success'
  );
  return browser;
}

async function getBrowser(): Promise<Browser> {
  if (CFG.DISABLE_BROWSER_REUSE) {
    return launchBrowser();
  }

  if (!browserPromise) {
    browserPromise = (async () => {
      try {
        return await launchBrowser();
      } catch (error) {
        browserPromise = null;
        throw error;
      }
    })();
  }

  try {
    const browser = await browserPromise;
    if (typeof (browser as Browser & { isConnected?: () => boolean }).isConnected === 'function') {
      if ((browser as Browser & { isConnected: () => boolean }).isConnected()) {
        logger.info({ scope: 'pdf', step: 'browser:reuse' }, 'pdf:browser:reuse');
        return browser;
      }
    }
    browserPromise = null;
    return getBrowser();
  } catch (error) {
    browserPromise = null;
    throw error;
  }
}

async function cycleBrowser(reason: string): Promise<void> {
  if (CFG.DISABLE_BROWSER_REUSE || !browserPromise) {
    return;
  }

  try {
    const browser = await browserPromise;
    await browser.close();
  } catch (error) {
    logger.warn(
      { scope: 'pdf', step: 'browser:cycle:warn', reason, err: (error as Error).message },
      'pdf:browser:cycle:warn'
    );
  } finally {
    browserPromise = null;
    logger.info({ scope: 'pdf', step: 'browser:cycled', reason }, 'pdf:browser:cycled');
  }
}

export async function generateCapitalPdfReport(
  calculation: CapitalLumpSumResult,
  options?: PdfReportOptions
): Promise<Buffer> {
  const startAt = performance.now();
  let lastMark = startAt;

  const mark = (step: string, extra?: Record<string, unknown>) => {
    const now = performance.now();
    const chunkMs = now - lastMark;
    const totalMs = now - startAt;
    lastMark = now;
    logger.info(
      {
        scope: 'pdf',
        step,
        chunkMs: Math.round(chunkMs),
        totalMs: Math.round(totalMs),
        ...(extra ?? {}),
      },
      'pdf:trace'
    );
  };

  const { targetSum, data } = options ?? {};
  logger.info(
    {
      scope: 'pdf',
      step: 'build:start',
      targetSum,
      gender: data?.gender,
      age: data?.age,
      income: data?.income,
      ndflRate: data?.ndflRate,
      reinvest: data?.reinvest,
    },
    'pdf:build:start'
  );

  const pdfHtml = MESSAGES.CAPITAL_FLOW.RESPONSES.PDF_TEMPLATE.replace(
    '{personalTotal}',
    formatCurrency(calculation.personalTotal)
  )
    .replace('{monthlyContribution}', formatCurrency(calculation.monthlyContribution))
    .replace('{stateTotal}', formatCurrency(calculation.stateTotal))
    .replace('{annualStateSupport}', formatCurrency(calculation.annualStateSupport))
    .replace('{opsTransfer}', formatCurrency(0))
    .replace('{investmentIncome}', formatCurrency(calculation.investmentIncome))
    .replace('{taxTotal}', formatCurrency(calculation.taxTotal))
    .replace('{taxRate}', String(data?.ndflRate ?? 0))
    .replace(
      '{taxNote}',
      calculation.reinvestedTaxTotal > 0
        ? ''
        : '<br/>Налоговый вычет не реинвестируется и выплачивается на ваш счёт.'
    )
    .replace('{lifePayment}', formatCurrency(calculation.lifePayment))
    .replace('{tenYearPayment}', formatCurrency(calculation.tenYearPayment))
    .replace('{lumpSum}', formatCurrency(targetSum ?? calculation.lumpSum));

  mark('html:ready', { htmlLength: pdfHtml.length });

  const browser = await getBrowser();
  mark('browser:ready');

  const context = await browser.newContext({ viewport: CFG.VIEWPORT });
  mark('context:created');

  let pdfBuffer: Buffer | null = null;

  try {
    const page = await context.newPage();
    mark('page:created');

    if (CFG.BLOCK_EXTERNAL) {
      await page.route('**/*', (route) => {
        const url = route.request().url();
        if (url.startsWith('about:') || url.startsWith('data:')) {
          return route.continue();
        }
        return route.abort();
      });
      mark('route:blocked');
    }

    await withTimeout(
      page.setContent(pdfHtml, { waitUntil: 'domcontentloaded' }),
      CFG.TIMEOUT_SET_CONTENT,
      'setContent'
    );
    mark('page:content:set');

    const simpleOptions: PDFOptions = {
      format: 'A4',
      printBackground: false,
      margin: { top: '5mm', right: '5mm', bottom: '5mm', left: '5mm' },
      preferCSSPageSize: false,
      displayHeaderFooter: false,
    };

    const normalOptions: PDFOptions = {
      format: 'A4',
      printBackground: false,
      margin: { top: '10mm', right: '10mm', bottom: '10mm', left: '10mm' },
      preferCSSPageSize: false,
      displayHeaderFooter: false,
    };

    const minimalOptions: PDFOptions = {
      format: 'A4',
      printBackground: false,
    };

    const tryPdf = async (options: PDFOptions, timeout: number, tag: string) => {
      const buffer = await withTimeout(page.pdf(options), timeout, tag);
      mark(tag, { pdfSize: buffer.length });
      return buffer;
    };

    try {
      pdfBuffer = await tryPdf(simpleOptions, CFG.TIMEOUT_PDF_SIMPLE, 'pdf:simple');
    } catch (simpleError) {
      logger.warn(
        { scope: 'pdf', step: 'pdf:simple:fail', err: (simpleError as Error).message },
        'pdf:simple:fail'
      );
      try {
        pdfBuffer = await tryPdf(normalOptions, CFG.TIMEOUT_PDF_NORMAL, 'pdf:normal');
      } catch (normalError) {
        logger.warn(
          { scope: 'pdf', step: 'pdf:normal:fail', err: (normalError as Error).message },
          'pdf:normal:fail'
        );
        pdfBuffer = await tryPdf(minimalOptions, CFG.TIMEOUT_PDF_MINIMAL, 'pdf:minimal');
      }
    }

    if (!pdfBuffer || pdfBuffer.length === 0) {
      throw new Error('empty PDF buffer');
    }

    mark('pdf:generated', { pdfSize: pdfBuffer.length });
  } catch (error) {
    logger.error(
      { scope: 'pdf', step: 'build:error', err: (error as Error).message },
      'pdf:build:error'
    );
    await cycleBrowser('build:error');
    throw error;
  } finally {
    try {
      await context.close();
    } catch (closeError) {
      logger.warn(
        { scope: 'pdf', step: 'context:close:warn', err: (closeError as Error).message },
        'pdf:context:close:warn'
      );
    }
    mark('context:closed');
  }

  logger.info(
    { scope: 'pdf', step: 'build:done', totalMs: Math.round(performance.now() - startAt) },
    'pdf:build:done'
  );

  return pdfBuffer;
}
