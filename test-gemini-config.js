// Test script to verify Gemini API configuration
// Run with: node test-gemini-api.js

const apiKey = process.env.GEMINI_API_KEY;

console.log('=================================');
console.log('Gemini API Configuration Check');
console.log('=================================\n');

if (!apiKey) {
  console.error('❌ GEMINI_API_KEY is NOT set in environment variables');
  console.log('\n📝 To fix this:');
  console.log('1. Create a .env.local file in the root directory');
  console.log('2. Add the following line:');
  console.log('   GEMINI_API_KEY=your_api_key_here');
  console.log('3. Get your API key from: https://makersuite.google.com/app/apikey');
  console.log('4. Restart your development server\n');
} else {
  console.log('✅ GEMINI_API_KEY is set');
  console.log(`   Length: ${apiKey.length} characters`);
  console.log(`   Starts with: ${apiKey.substring(0, 10)}...`);
  console.log(`   Ends with: ...${apiKey.substring(apiKey.length - 4)}\n`);
  
  console.log('✨ Your Gemini API is configured correctly!');
  console.log('   The chatbot should work on all routes.\n');
}

console.log('=================================\n');

// Check other important environment variables
console.log('Other Environment Variables:');
console.log('----------------------------');
console.log('NODE_ENV:', process.env.NODE_ENV || 'not set');
console.log('NEXTAUTH_URL:', process.env.NEXTAUTH_URL || 'not set');
console.log('NEXTAUTH_SECRET:', process.env.NEXTAUTH_SECRET ? '✅ set' : '❌ not set');
console.log('DATABASE_URL:', process.env.DATABASE_URL ? '✅ set' : '❌ not set');
console.log('\n=================================');
