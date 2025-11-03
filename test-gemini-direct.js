// Direct HTTP test for Gemini API
const https = require('https');

const API_KEY = 'AIzaSyB6wYwuHRBsDU2BXoC2QwVOwXFXDQMyyR4';

console.log('🧪 Testing Gemini API with direct HTTP request...\n');

const postData = JSON.stringify({
  contents: [{
    parts: [{
      text: 'Say hello in one sentence.'
    }]
  }]
});

const options = {
  hostname: 'generativelanguage.googleapis.com',
  path: `/v1/models/gemini-2.5-flash:generateContent?key=${API_KEY}`,
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  }
};

console.log(`📡 Requesting: https://${options.hostname}${options.path.split('?')[0]}\n`);

const req = https.request(options, (res) => {
  console.log(`📥 Status Code: ${res.statusCode}`);
  console.log(`📋 Headers:`, JSON.stringify(res.headers, null, 2));
  console.log('');

  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    try {
      const parsed = JSON.parse(data);
      
      if (res.statusCode === 200) {
        console.log('✅ SUCCESS!\n');
        console.log('📝 Response:');
        console.log('─'.repeat(60));
        if (parsed.candidates && parsed.candidates[0]) {
          const text = parsed.candidates[0].content.parts[0].text;
          console.log(text);
        } else {
          console.log(JSON.stringify(parsed, null, 2));
        }
        console.log('─'.repeat(60));
      } else {
        console.log('❌ ERROR:\n');
        console.log(JSON.stringify(parsed, null, 2));
        
        if (parsed.error) {
          console.log('\n💡 Error Details:');
          console.log(`  Status: ${parsed.error.status}`);
          console.log(`  Message: ${parsed.error.message}`);
          
          if (parsed.error.message.includes('API key')) {
            console.log('\n🔑 The API key may be invalid or not enabled for Gemini API');
            console.log('   Please check: https://makersuite.google.com/app/apikey');
          } else if (parsed.error.message.includes('billing')) {
            console.log('\n💳 Billing may not be enabled on your Google Cloud project');
          }
        }
      }
    } catch (e) {
      console.log('❌ Failed to parse response:');
      console.log(data);
    }
  });
});

req.on('error', (e) => {
  console.error(`❌ Request Error: ${e.message}`);
});

req.write(postData);
req.end();
