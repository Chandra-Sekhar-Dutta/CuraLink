// List available models for Gemini API
const https = require('https');

const API_KEY = 'AIzaSyB6wYwuHRBsDU2BXoC2QwVOwXFXDQMyyR4';

console.log('🧪 Listing available Gemini models...\n');

const testEndpoints = [
  '/v1/models',
  '/v1beta/models',
];

async function testEndpoint(path) {
  return new Promise((resolve) => {
    const options = {
      hostname: 'generativelanguage.googleapis.com',
      path: `${path}?key=${API_KEY}`,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    };

    console.log(`\n📡 Testing: https://${options.hostname}${path}`);

    const req = https.request(options, (res) => {
      console.log(`   Status: ${res.statusCode}`);

      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          
          if (res.statusCode === 200) {
            if (parsed.models && parsed.models.length > 0) {
              console.log(`\n   ✅ Found ${parsed.models.length} models:\n`);
              parsed.models.forEach(model => {
                console.log(`      - ${model.name}`);
                console.log(`        Display: ${model.displayName || 'N/A'}`);
                console.log(`        Supported: ${model.supportedGenerationMethods?.join(', ') || 'N/A'}`);
                console.log('');
              });
            } else {
              console.log('   ⚠️  No models found in response');
            }
          } else {
            console.log(`   ❌ Error:`, parsed.error?.message || JSON.stringify(parsed));
          }
          resolve();
        } catch (e) {
          console.log('   ❌ Failed to parse response');
          resolve();
        }
      });
    });

    req.on('error', (e) => {
      console.error(`   ❌ Request Error: ${e.message}`);
      resolve();
    });

    req.end();
  });
}

async function main() {
  for (const endpoint of testEndpoints) {
    await testEndpoint(endpoint);
  }
  
  console.log('\n' + '═'.repeat(70));
  console.log('\n💡 IMPORTANT NOTES:');
  console.log('   1. If you see 403 errors, the API key may be invalid');
  console.log('   2. If you see 404 errors, Gemini API may not be enabled');
  console.log('   3. To enable Gemini API:');
  console.log('      - Go to: https://makersuite.google.com/app/apikey');
  console.log('      - Or: https://console.cloud.google.com/apis/library');
  console.log('      - Search for "Generative Language API"');
  console.log('      - Click "Enable"');
  console.log('   4. You may need to create a new API key from Google AI Studio');
  console.log('\n');
}

main();
