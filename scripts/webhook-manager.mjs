import { logger } from '../src/logger.js';
import { setWebhook, getWebhookInfo, deleteWebhook } from '../src/bot/webhookManager.js';

const command = process.argv[2];
const webhookUrl = process.argv[3];

async function main() {
  switch (command) {
    case 'set': {
      if (!webhookUrl) {
        logger.error('Please provide webhook URL: npm run webhook:set <url>');
        return 1;
      }
      const success = await setWebhook(webhookUrl);
      return success ? 0 : 1;
    }

    case 'info': {
      const info = await getWebhookInfo();
      if (info) {
        console.log('Webhook Info:');
        console.log(`URL: ${info.url || 'Not set'}`);
        console.log(`Has custom certificate: ${info.has_custom_certificate}`);
        console.log(`Pending update count: ${info.pending_update_count}`);
        console.log(`Last error date: ${info.last_error_date || 'None'}`);
        console.log(`Last error message: ${info.last_error_message || 'None'}`);
        console.log(`Max connections: ${info.max_connections || 'Default'}`);
        console.log(`Allowed updates: ${info.allowed_updates?.join(', ') || 'All'}`);
      }
      return 0;
    }

    case 'delete': {
      const deleted = await deleteWebhook();
      return deleted ? 0 : 1;
    }

    default: {
      console.log('Usage:');
      console.log('  npm run webhook:set <url>  - Set webhook URL');
      console.log('  npm run webhook:info       - Get webhook info');
      console.log('  npm run webhook:delete     - Delete webhook');
      return 1;
    }
  }
}

main()
  .then((exitCode) => {
    process.exit(exitCode); // eslint-disable-line n/no-process-exit
    return undefined; // eslint-disable-line promise/always-return
  })
  .catch((error) => {
    logger.error({ error: error.message }, 'Webhook command failed');
    process.exit(1); // eslint-disable-line n/no-process-exit
  });
