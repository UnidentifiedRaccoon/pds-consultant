import { getJSON } from '../src/utils/http/index.js';
import { config } from '../src/config/env.js';

(async () => {
  try {
    // В CI проверяем внешний API, локально - локальный сервер
    const isCI = process.env.CI === 'true' || process.env.NODE_ENV === 'production';

    if (isCI) {
      // В CI проверяем внешний API
      console.log('Testing external API (CI mode)...');
      await getJSON('https://httpbin.org/json');
      console.log(`✅ HTTP test passed: External API is accessible`);
    } else {
      // Локально проверяем локальный сервер
      const port = process.env.PORT || config.DEV_PORT;
      const healthUrl = `http://localhost:${port}/health`;

      console.log(`Testing local server at ${healthUrl}...`);
      const data = await getJSON(healthUrl);

      if (data.ok === true) {
        console.log(`✅ HTTP test passed: Server is healthy`);
      } else {
        throw new Error(`Unexpected response: ${JSON.stringify(data)}`);
      }
    }
  } catch (e) {
    console.error('❌ Smoke test failed:', e.message);
    if (!process.env.CI) {
      console.error('💡 Make sure the server is running with: npm start');
    }
    process.exitCode = 1;
  }
})();
