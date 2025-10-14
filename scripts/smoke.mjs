import { getJSON } from '../src/utils/http/index.js';

(async () => {
  try {
    // Используем более стабильный endpoint вместо GitHub API
    const data = await getJSON('https://httpbin.org/json');
    console.log(`✅ HTTP test passed: ${data.slideshow?.title || 'JSON received'}`);
  } catch (e) {
    console.error('❌ Smoke test failed:', e.message);
    process.exitCode = 1;
  }
})();
