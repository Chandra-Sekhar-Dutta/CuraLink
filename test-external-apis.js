/**
 * Test script for External API Integration
 * This script tests both PubMed and ClinicalTrials.gov API calls
 */

import { fetchPubMedPublications, fetchClinicalTrials } from './lib/externalData.js';

console.log('🧪 Testing External API Integration...\n');

// Test 1: PubMed Publications
console.log('📚 Test 1: Fetching publications from PubMed...');
fetchPubMedPublications(['Diabetes'], 5)
  .then(publications => {
    console.log(`✅ Success! Found ${publications.length} publications`);
    if (publications.length > 0) {
      console.log('\nSample Publication:');
      console.log(`  Title: ${publications[0].title}`);
      console.log(`  Year: ${publications[0].year}`);
      console.log(`  Journal: ${publications[0].journal}`);
      console.log(`  ID: ${publications[0].id}\n`);
    }
  })
  .catch(error => {
    console.error('❌ Error fetching publications:', error.message);
  });

// Test 2: Clinical Trials
console.log('🧪 Test 2: Fetching clinical trials from ClinicalTrials.gov...');
fetchClinicalTrials(['Cancer'], undefined, 5)
  .then(trials => {
    console.log(`✅ Success! Found ${trials.length} clinical trials`);
    if (trials.length > 0) {
      console.log('\nSample Trial:');
      console.log(`  Title: ${trials[0].title}`);
      console.log(`  ID: ${trials[0].id}`);
      console.log(`  Phase: ${trials[0].phase}`);
      console.log(`  Status: ${trials[0].status}`);
      console.log(`  Location: ${trials[0].location}\n`);
    }
  })
  .catch(error => {
    console.error('❌ Error fetching trials:', error.message);
  });

// Test 3: Multiple Conditions
setTimeout(() => {
  console.log('🧪 Test 3: Fetching with multiple conditions...');
  fetchPubMedPublications(['Diabetes', 'Hypertension'], 3)
    .then(publications => {
      console.log(`✅ Success! Found ${publications.length} publications for multiple conditions`);
    })
    .catch(error => {
      console.error('❌ Error:', error.message);
    });
}, 2000);

console.log('\n⏳ Tests running... Please wait for results...\n');
