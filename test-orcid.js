// Test ORCID API integration
async function testOrcidAPI() {
  console.log('🔬 Testing ORCID API for finding experts...\n');

  try {
    // Test 1: Search for cancer researchers
    console.log('Test 1: Searching for "cancer" researchers...');
    const searchUrl = 'https://pub.orcid.org/v3.0/search/?q=cancer&rows=3';
    
    const response = await fetch(searchUrl, {
      headers: { 'Accept': 'application/json' }
    });
    
    if (!response.ok) {
      console.error('❌ Failed:', response.status);
      return;
    }
    
    const data = await response.json();
    console.log(`✅ Found ${data['num-found']} total results`);
    
    const results = data.result || [];
    console.log(`📊 Retrieved ${results.length} researcher profiles\n`);
    
    // Test 2: Get detailed profile for first researcher
    if (results.length > 0) {
      const orcidId = results[0]['orcid-identifier']?.path;
      console.log(`Test 2: Getting detailed profile for ORCID: ${orcidId}`);
      
      const profileUrl = `https://pub.orcid.org/v3.0/${orcidId}/record`;
      const profileResponse = await fetch(profileUrl, {
        headers: { 'Accept': 'application/json' }
      });
      
      if (profileResponse.ok) {
        const profile = await profileResponse.json();
        const person = profile.person || {};
        const name = person.name || {};
        const givenName = name['given-names']?.value || '';
        const familyName = name['family-name']?.value || '';
        
        console.log(`✅ Name: ${givenName} ${familyName}`);
        
        const employments = profile['activities-summary']?.employments?.['affiliation-group'] || [];
        if (employments.length > 0) {
          const emp = employments[0]?.summaries?.[0]?.['employment-summary'];
          console.log(`🏛️  Affiliation: ${emp?.organization?.name || 'N/A'}`);
          console.log(`📍 Location: ${emp?.organization?.address?.city || 'N/A'}, ${emp?.organization?.address?.country || 'N/A'}`);
        }
        
        const works = profile['activities-summary']?.works?.group || [];
        console.log(`📚 Publications: ${works.length}`);
        
        const keywords = person.keywords?.keyword || [];
        console.log(`🔬 Research areas: ${keywords.map(k => k.content).join(', ') || 'N/A'}`);
        console.log(`🔗 ORCID Profile: https://orcid.org/${orcidId}\n`);
      }
    }
    
    console.log('✅ ORCID API integration test complete!');
    console.log('🎉 Experts can now be fetched from ORCID database');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testOrcidAPI();
