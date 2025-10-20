import { fetchConsultationReply } from '../src/services/yandexGpt.js';

async function main(): Promise<void> {
  const { text } = await fetchConsultationReply([], 'Привет! Расскажи коротко про ПДС.');
  console.log('Ответ модели:');
  console.log(text);
}

main().catch((error) => {
  console.error('YC GPT check failed:', error);
  process.exitCode = 1;
});
