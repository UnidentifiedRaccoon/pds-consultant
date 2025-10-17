import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import fsExtra from 'fs-extra';
import { chromium } from 'playwright';
import { MESSAGES } from './messages.js';

const REPORTS_DIR = path.resolve(os.tmpdir(), 'pds-consultant-reports');

export async function ensureReportsDir() {
  await fsExtra.ensureDir(REPORTS_DIR);
  return REPORTS_DIR;
}

function formatCurrency(value) {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 0,
  })
    .format(value)
    .replace('₽', '₽');
}

export async function generateCapitalPdfReport(calculation, options) {
  const { targetSum, data } = options || {};

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
    .replace('{taxRate}', String(Math.round(data?.ndflRate ?? 0)))
    .replace(
      '{taxNote}',
      calculation.reinvestedTaxTotal > 0
        ? ''
        : '<br/>Налоговый вычет не реинвестируется и выплачивается на ваш счёт.'
    )
    .replace('{lifePayment}', formatCurrency(calculation.lifePayment))
    .replace('{tenYearPayment}', formatCurrency(calculation.tenYearPayment))
    .replace('{lumpSum}', formatCurrency(targetSum || calculation.lumpSum));

  await ensureReportsDir();
  const pdfPath = path.join(REPORTS_DIR, `pds-capital-report-${Date.now()}.pdf`);

  const browser = await chromium.launch();
  try {
    const page = await browser.newPage();
    await page.setContent(pdfHtml, { waitUntil: 'load' });
    await page.pdf({ path: pdfPath, format: 'A4', printBackground: true });
  } finally {
    await browser.close();
  }

  const buffer = await fs.promises.readFile(pdfPath);
  await fs.promises.unlink(pdfPath);

  return buffer;
}
