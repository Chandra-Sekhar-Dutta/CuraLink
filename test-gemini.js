// Simple test script to verify Gemini API integration
const { GoogleGenerativeAI } = require('@google/generative-ai');

const API_KEY = 'AIzaSyB6wYwuHRBsDU2BXoC2QwVOwXFXDQMyyR4';

async function testGeminiAPI() {
  console.log('🧪 Testing Gemini API...\n');
  
  try {
    console.log('✅ API Key found');
    console.log('📡 Initializing Gemini AI...');
    
    const genAI = new GoogleGenerativeAI(API_KEY);
    
    console.log('📋 Fetching available models...\n');
    
    // First, let's see what models are available
    try {
      const models = await genAI.listModels();
      console.log('Available models:');
      for await (const model of models) {
        console.log(`  - ${model.name} (${model.displayName})`);
      }
    } catch (listError) {
      console.log('Could not list models, trying direct generation...');
    }
    
    // Try different model names
    const modelNames = [
      'gemini-1.5-pro',
      'gemini-1.5-flash', 
      'gemini-pro',
      'gemini-1.0-pro',
      'models/gemini-pro',
      'models/gemini-1.5-flash'
    ];
    
    let success = false;
    
    for (const modelName of modelNames) {
      try {
        console.log(`\n📤 Trying model: ${modelName}...`);
        const model = genAI.getGenerativeModel({ model: modelName });
        
        const prompt = 'What is ReGeneX platform? Answer in 2 sentences.';
        const result = await model.generateContent(prompt);
        const response = result.response;
        const text = response.text();
        
        console.log(`\n✅ SUCCESS with model: ${modelName}\n`);
        console.log('📝 Response:');
        console.log('─'.repeat(60));
        console.log(text);
        console.log('─'.repeat(60));
        console.log(`\n✨ Use this model in your API routes: "${modelName}"`);
        success = true;
        break;
      } catch (err) {
        console.log(`  ❌ Failed: ${err.message.split(':')[0]}`);
      }
    }
    
    if (!success) {
      throw new Error('None of the tried models worked');
    }
    
  } catch (error) {
    console.error('\n❌ ERROR: Gemini API test failed');
    console.error('─'.repeat(60));
    console.error('Error message:', error.message);
    console.error('─'.repeat(60));
    
    console.error('\n💡 Suggestions:');
    console.error('1. Verify your API key is correct and active');
    console.error('2. Check if the Gemini API is enabled in Google Cloud Console');
    console.error('3. Ensure billing is enabled for your Google Cloud project');
    console.error('4. Check API quota and limits');
  }
}

testGeminiAPI();
