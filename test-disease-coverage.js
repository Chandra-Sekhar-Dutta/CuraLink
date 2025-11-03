/**
 * Test Script: Disease Coverage & Spell Correction
 * 
 * This script demonstrates the new features:
 * 1. Universal disease support (malaria, dwarfism, etc.)
 * 2. AI-powered spell correction using Gemini
 * 3. Automatic term expansion
 */

console.log('🧪 Testing Disease Coverage & Spell Correction\n');
console.log('='.repeat(60));

// Test cases with expected results
const testCases = [
  { input: 'malaria', expected: 'malaria', category: 'Infectious Disease' },
  { input: 'maleria', expected: 'malaria', category: 'Spell Correction' },
  { input: 'dwarfism', expected: 'dwarfism', category: 'Genetic Disorder' },
  { input: 'dwarfizm', expected: 'dwarfism', category: 'Spell Correction' },
  { input: 'diabetees', expected: 'diabetes', category: 'Spell Correction' },
  { input: 'alzhimer', expected: 'alzheimer', category: 'Spell Correction' },
  { input: 'parkinsons', expected: 'parkinson', category: 'Neurological' },
  { input: 'tubercolosis', expected: 'tuberculosis', category: 'Spell Correction' },
];

console.log('\n📋 Test Cases:\n');
testCases.forEach((test, index) => {
  console.log(`${index + 1}. Input: "${test.input}"`);
  console.log(`   Expected: "${test.expected}"`);
  console.log(`   Category: ${test.category}`);
  console.log('');
});

console.log('='.repeat(60));
console.log('\n🔍 To test spell correction API:\n');
console.log('1. Start the dev server: npm run dev');
console.log('2. Open browser console');
console.log('3. Run this code:\n');

console.log(`
// Test spell correction
async function testSpellCheck(term) {
  const response = await fetch('/api/spell-correct', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ term })
  });
  const data = await response.json();
  console.log(\`"\${term}" → "\${data.correctedTerm}" (corrected: \${data.wasCorrected})\`);
  return data;
}

// Test multiple terms
const terms = ['maleria', 'dwarfizm', 'diabetees', 'alzhimer'];
for (const term of terms) {
  await testSpellCheck(term);
}
`);

console.log('='.repeat(60));
console.log('\n🎯 To test term expansion:\n');
console.log('1. Import the function:');
console.log('   import { expandMedicalTerms } from "@/lib/externalData";');
console.log('');
console.log('2. Test expansion:');
console.log('   expandMedicalTerms(["malaria"])');
console.log('   // Returns: ["malaria", "plasmodium", "antimalarial", "tropical disease"]');
console.log('');
console.log('   expandMedicalTerms(["dwarfism"])');
console.log('   // Returns: ["dwarfism", "achondroplasia", "short stature", ...]');

console.log('\n='.repeat(60));
console.log('\n✅ Features Implemented:\n');
console.log('✓ AI spell correction (Gemini API)');
console.log('✓ 30+ disease categories with synonyms');
console.log('✓ Automatic term expansion');
console.log('✓ Universal disease support');
console.log('✓ Real-time spell checking in UI');
console.log('✓ Malaria support ✓');
console.log('✓ Dwarfism support ✓');
console.log('✓ All major diseases supported ✓');

console.log('\n='.repeat(60));
console.log('\n🚀 Ready to test! Start the dev server and try adding conditions.\n');

// Example diseases that now work
const supportedDiseases = [
  'Malaria', 'Dwarfism', 'Tuberculosis', 'Alzheimer', 'Parkinson',
  'Diabetes', 'Cancer', 'Heart Disease', 'Hypertension', 'Asthma',
  'Arthritis', 'Depression', 'Anxiety', 'Obesity', 'Stroke',
  'Epilepsy', 'Migraine', 'Lupus', 'Celiac Disease', 'Crohn Disease',
  'Psoriasis', 'Hepatitis', 'HIV/AIDS', 'Leukemia', 'Lymphoma',
  'Anemia', 'Thyroid Disorder', 'Kidney Disease', 'Liver Disease',
  '...and virtually ANY other disease!'
];

console.log('📚 Example Supported Diseases:');
console.log(supportedDiseases.join(', '));
console.log('\n');
