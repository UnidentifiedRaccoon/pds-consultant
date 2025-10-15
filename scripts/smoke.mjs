import { getJSON } from '../src/utils/http/index.js';
import { config } from '../src/config/env.js';

(async () => {
  try {
    // Проверяем локальный сервер вместо внешнего API
    const port = process.env.PORT || config.DEV_PORT;
    const healthUrl = `http://localhost:${port}/health`;

    console.log(`Testing local server at ${healthUrl}...`);
    const data = await getJSON(healthUrl);

    if (data.ok === true) {
      console.log(`✅ HTTP test passed: Server is healthy`);
    } else {
      throw new Error(`Unexpected response: ${JSON.stringify(data)}`);
    }
  } catch (e) {
    console.error('❌ Smoke test failed:', e.message);
    console.error('💡 Make sure the server is running with: npm start');
    process.exitCode = 1;
  }
})();
