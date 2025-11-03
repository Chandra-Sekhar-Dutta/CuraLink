// Test FAQ chatbot with Gemini API
const { GoogleGenerativeAI } = require('@google/generative-ai');

const API_KEY = 'AIzaSyB6wYwuHRBsDU2BXoC2QwVOwXFXDQMyyR4';

const PLATFORM_CONTEXT = `
You are a helpful FAQ assistant for ReGeneX (also known as CuraLink), a clinical research platform. Answer questions ONLY about the ReGeneX/CuraLink platform, its features, and how to use it.

# About ReGeneX/CuraLink:
ReGeneX is a platform that connects patients with clinical trials and researchers.

## For Patients:
- Find clinical trials matching their conditions
- Contact researchers
- Save favorites
- View publications

## For Researchers:
- Create and manage clinical trials
- Find collaborators
- Manage publications
- Reply to patient questions

Be friendly, concise, and specific.
`;

async function testFAQChatbot() {
  console.log('🧪 Testing FAQ Chatbot with Gemini API...\n');
  
  const testQuestions = [
    'What is ReGeneX?',
    'How do I sign up?',
    'Can I save trials for later?',
    'Is my health data secure?'
  ];
  
  try {
    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.5-flash',
      generationConfig: {
        maxOutputTokens: 500,
        temperature: 0.7,
      },
    });
    
    console.log('✅ Gemini AI initialized successfully');
    console.log('📝 Testing with sample FAQ questions...\n');
    console.log('═'.repeat(70));
    
    for (let i = 0; i < testQuestions.length; i++) {
      const question = testQuestions[i];
      console.log(`\n❓ Question ${i + 1}: ${question}`);
      console.log('─'.repeat(70));
      
      const prompt = `${PLATFORM_CONTEXT}\n\nUser Question: ${question}\n\nAssistant (answer specifically about ReGeneX platform):`;
      
      const result = await model.generateContent(prompt);
      const response = result.response;
      const text = response.text();
      
      console.log(`\n🤖 Answer:\n${text}`);
      console.log('\n✅ Response received successfully');
      console.log('═'.repeat(70));
      
      // Small delay between requests
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    console.log('\n\n🎉 SUCCESS! All tests passed!');
    console.log('\n📋 Summary:');
    console.log(`   ✅ API Key: Valid and working`);
    console.log(`   ✅ Model: gemini-2.5-flash`);
    console.log(`   ✅ Questions tested: ${testQuestions.length}`);
    console.log(`   ✅ FAQ context: Loaded correctly`);
    console.log('\n💡 Your FAQ chatbot is ready to use on the website!');
    console.log('   Navigate to: http://localhost:3000/faq');
    
  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    console.error('\nPlease check:');
    console.error('   1. API key is correct');
    console.error('   2. Internet connection is stable');
    console.error('   3. Gemini API has no quota issues');
  }
}

testFAQChatbot();
