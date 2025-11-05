// Service to fetch real data from free medical APIs

export interface PubMedArticle {
  id: string;
  title: string;
  abstract?: string;
  year: number;
  authors?: string[];
  journal?: string;
}

export interface ClinicalTrial {
  id: string;
  title: string;
  status: string;
  phase: string;
  conditions: string[];
  location: string;
  city?: string;
  country?: string;
  description?: string;
  sponsor?: string;
  url?: string;
  enrollment?: number;
  summary?: string;
}

export interface ExpertResearcher {
  id: string;
  name: string;
  orcidId?: string;
  specialty: string;
  conditions: string[];
  city: string;
  country: string;
  active: boolean;
  email?: string;
  affiliation?: string;
  publicationCount?: number;
  url?: string;
}

/**
 * Fetch publications from PubMed API
 * @param searchTerms - Medical conditions or keywords to search
 * @param maxResults - Maximum number of results (default: 10)
 * @param autoExpand - Automatically expand terms with synonyms (default: true)
 */
export async function fetchPubMedPublications(
  searchTerms: string[],
  maxResults: number = 10,
  autoExpand: boolean = true
): Promise<PubMedArticle[]> {
  try {
    // Expand search terms to include related medical conditions
    const expandedTerms = autoExpand ? expandMedicalTerms(searchTerms) : searchTerms;
    
    // Construct search query with expanded terms
    const query = expandedTerms.join(' OR ');
    
    // Step 1: Search for article IDs
    const searchUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=${encodeURIComponent(query)}&retmax=${maxResults}&retmode=json&sort=relevance`;
    
    const searchResponse = await fetch(searchUrl);
    const searchData = await searchResponse.json();
    
    const ids = searchData.esearchresult?.idlist || [];
    
    if (ids.length === 0) {
      return [];
    }
    
    // Step 2: Fetch article details
    const summaryUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&id=${ids.join(',')}&retmode=json`;
    
    const summaryResponse = await fetch(summaryUrl);
    const summaryData = await summaryResponse.json();
    
    const articles: PubMedArticle[] = [];
    
    for (const id of ids) {
      const article = summaryData.result?.[id];
      if (article) {
        articles.push({
          id: `pmid-${id}`,
          title: article.title || 'Untitled',
          year: parseInt(article.pubdate?.substring(0, 4) || new Date().getFullYear().toString()),
          authors: article.authors?.map((a: any) => a.name) || [],
          journal: article.fulljournalname || article.source || 'Unknown Journal',
        });
      }
    }
    
    return articles;
  } catch (error) {
    console.error('Error fetching PubMed data:', error);
    return [];
  }
}

/**
 * Fetch clinical trials from ClinicalTrials.gov API
 * @param conditions - Medical conditions to search
 * @param location - Optional location filter (city, state, or country)
 * @param maxResults - Maximum number of results (default: 10)
 * @param autoExpand - Automatically expand terms with synonyms (default: true)
 */
export async function fetchClinicalTrials(
  conditions: string[],
  location?: string,
  maxResults: number = 10,
  autoExpand: boolean = true
): Promise<ClinicalTrial[]> {
  try {
    // Expand search terms to include related medical conditions
    const expandedTerms = autoExpand ? expandMedicalTerms(conditions) : conditions;
    
    // Build API URL with condition and location parameters
    let apiUrl = `https://clinicaltrials.gov/api/v2/studies?query.cond=${encodeURIComponent(conditions.join(','))}`;
    
    // Add location filter if provided
    if (location) {
      apiUrl += `&query.locn=${encodeURIComponent(location)}`;
    }
    
    apiUrl += `&pageSize=${maxResults}&format=json`;
    
    console.log('Fetching trials with URL:', apiUrl);
    
    const response = await fetch(apiUrl);
    const data = await response.json();
    
    const studies = data.studies || [];
    const trials: ClinicalTrial[] = [];
    
    for (const study of studies) {
      const protocolSection = study.protocolSection;
      const identificationModule = protocolSection?.identificationModule;
      const statusModule = protocolSection?.statusModule;
      const designModule = protocolSection?.designModule;
      const conditionsModule = protocolSection?.conditionsModule;
      const contactsLocationsModule = protocolSection?.contactsLocationsModule;
      const descriptionModule = protocolSection?.descriptionModule;
      const sponsorCollaboratorsModule = protocolSection?.sponsorCollaboratorsModule;
      
      // Get all locations for better matching
      const locations = contactsLocationsModule?.locations || [];
      
      // If location filter is provided, try to find the best matching location
      let bestLocation = locations[0] || {};
      if (location && locations.length > 0) {
        const normalizedLocation = location.toLowerCase().trim();
        // Find location that best matches the filter
        const matchingLocation = locations.find((loc: any) => {
          const city = (loc.city || '').toLowerCase();
          const country = (loc.country || '').toLowerCase();
          const state = (loc.state || '').toLowerCase();
          return city.includes(normalizedLocation) || 
                 normalizedLocation.includes(city) ||
                 country.includes(normalizedLocation) ||
                 normalizedLocation.includes(country) ||
                 state.includes(normalizedLocation) ||
                 normalizedLocation.includes(state);
        });
        if (matchingLocation) {
          bestLocation = matchingLocation;
        }
      }
      
      // Map phase
      const phases = designModule?.phases || [];
      let phase = 'Not Specified';
      if (phases.length > 0) {
        const p = phases[0];
        if (p.includes('1')) phase = 'Phase I';
        else if (p.includes('2')) phase = 'Phase II';
        else if (p.includes('3')) phase = 'Phase III';
        else if (p.includes('4')) phase = 'Phase IV';
      }
      
      // Map status
      const overallStatus = statusModule?.overallStatus || 'Unknown';
      let status = 'Active';
      if (overallStatus.toLowerCase().includes('recruit')) status = 'Recruiting';
      else if (overallStatus.toLowerCase().includes('completed')) status = 'Completed';
      else if (overallStatus.toLowerCase().includes('not')) status = 'Not Recruiting';
      
      const nctId = identificationModule?.nctId || `trial-${trials.length}`;
      
      trials.push({
        id: nctId,
        title: identificationModule?.briefTitle || 'Untitled Study',
        status,
        phase,
        conditions: conditionsModule?.conditions || [],
        location: bestLocation.city && bestLocation.country 
          ? `${bestLocation.city}, ${bestLocation.country}`
          : 'Location not specified',
        city: bestLocation.city,
        country: bestLocation.country,
        description: descriptionModule?.briefSummary || '',
        sponsor: sponsorCollaboratorsModule?.leadSponsor?.name || 'Unknown Sponsor',
        url: nctId.startsWith('NCT') ? `https://clinicaltrials.gov/study/${nctId}` : undefined,
      });
    }
    
    // Sort trials by location relevance if location filter is provided
    if (location) {
      const normalizedLocation = location.toLowerCase().trim();
      trials.sort((a, b) => {
        const aCity = (a.city || '').toLowerCase();
        const aCountry = (a.country || '').toLowerCase();
        const bCity = (b.city || '').toLowerCase();
        const bCountry = (b.country || '').toLowerCase();
        
        // Exact city match gets highest priority
        const aExactCity = aCity === normalizedLocation;
        const bExactCity = bCity === normalizedLocation;
        if (aExactCity && !bExactCity) return -1;
        if (!aExactCity && bExactCity) return 1;
        
        // City contains location gets next priority
        const aCityMatch = aCity.includes(normalizedLocation) || normalizedLocation.includes(aCity);
        const bCityMatch = bCity.includes(normalizedLocation) || normalizedLocation.includes(bCity);
        if (aCityMatch && !bCityMatch) return -1;
        if (!aCityMatch && bCityMatch) return 1;
        
        // Country match gets lower priority
        const aCountryMatch = aCountry.includes(normalizedLocation) || normalizedLocation.includes(aCountry);
        const bCountryMatch = bCountry.includes(normalizedLocation) || normalizedLocation.includes(bCountry);
        if (aCountryMatch && !bCountryMatch) return -1;
        if (!aCountryMatch && bCountryMatch) return 1;
        
        return 0;
      });
    }
    
    return trials;
  } catch (error) {
    console.error('Error fetching clinical trials:', error);
    return [];
  }
}

/**
 * Fetch expert researchers from ORCID API
 * ORCID is a free, global registry of researchers with their publications and affiliations
 * @param conditions - Medical conditions/specialties to search for
 * @param maxResults - Maximum number of results (default: 20)
 * @param autoExpand - Automatically expand terms with synonyms (default: true)
 */
export async function fetchExpertsByCondition(
  conditions: string[],
  maxResults: number = 20,
  autoExpand: boolean = true
): Promise<ExpertResearcher[]> {
  try {
    // Expand search terms to include related medical conditions
    const expandedTerms = autoExpand ? expandMedicalTerms(conditions) : conditions;
    
    // Construct search query for ORCID
    const query = expandedTerms.join(' OR ');
    
    // ORCID Public API (no authentication required for public data)
    const searchUrl = `https://pub.orcid.org/v3.0/search/?q=${encodeURIComponent(query)}&rows=${maxResults}`;
    
    const response = await fetch(searchUrl, {
      headers: {
        'Accept': 'application/json',
      },
    });
    
    if (!response.ok) {
      console.error('ORCID API error:', response.status);
      return [];
    }
    
    const data = await response.json();
    const results = data.result || [];
    const experts: ExpertResearcher[] = [];
    
    // Process each ORCID record
    for (let i = 0; i < Math.min(results.length, maxResults); i++) {
      const result = results[i];
      const orcidId = result['orcid-identifier']?.path;
      
      if (!orcidId) continue;
      
      try {
        // Fetch detailed profile for each researcher
        const profileUrl = `https://pub.orcid.org/v3.0/${orcidId}/record`;
        const profileResponse = await fetch(profileUrl, {
          headers: { 'Accept': 'application/json' },
        });
        
        if (!profileResponse.ok) continue;
        
        const profile = await profileResponse.json();
        
        // Extract basic info
        const person = profile.person || {};
        const name = person.name || {};
        const givenName = name['given-names']?.value || '';
        const familyName = name['family-name']?.value || '';
        const fullName = `${givenName} ${familyName}`.trim() || 'Unknown Researcher';
        
        // Extract affiliations
        const employments = profile['activities-summary']?.employments?.['affiliation-group'] || [];
        let affiliation = 'Not specified';
        let city = 'Not specified';
        let country = 'Not specified';
        
        if (employments.length > 0) {
          const firstEmployment = employments[0]?.summaries?.[0]?.['employment-summary'];
          if (firstEmployment) {
            affiliation = firstEmployment.organization?.name || affiliation;
            city = firstEmployment.organization?.address?.city || city;
            country = firstEmployment.organization?.address?.country || country;
          }
        }
        
        // Extract keywords/research areas
        const keywords = person.keywords?.keyword || [];
        const researchAreas = keywords.map((k: any) => k.content).filter(Boolean);
        
        // Get publication count
        const works = profile['activities-summary']?.works?.group || [];
        const publicationCount = works.length;
        
        // Determine specialty based on keywords/research areas
        let specialty = 'Researcher';
        if (researchAreas.length > 0) {
          specialty = researchAreas.slice(0, 3).join(', ');
        }
        
        // Extract email if available (usually private)
        const emails = person.emails?.email || [];
        const email = emails.find((e: any) => e.visibility === 'PUBLIC')?.email;
        
        experts.push({
          id: `orcid-${orcidId}`,
          name: fullName,
          orcidId: orcidId,
          specialty: specialty,
          conditions: researchAreas.length > 0 ? researchAreas.slice(0, 5) : conditions,
          city: city,
          country: country,
          active: true, // ORCID profiles are by definition active
          email: email,
          affiliation: affiliation,
          publicationCount: publicationCount,
          url: `https://orcid.org/${orcidId}`,
        });
        
      } catch (profileError) {
        console.error(`Error fetching profile for ${orcidId}:`, profileError);
        continue;
      }
    }
    
    return experts;
  } catch (error) {
    console.error('Error fetching experts from ORCID:', error);
    return [];
  }
}

/**
 * Correct spelling of medical terms using Gemini AI
 * @param term - Medical term that might have spelling errors
 * @returns Corrected medical term
 */
export async function correctMedicalSpelling(term: string): Promise<string> {
  try {
    const response = await fetch('/api/spell-correct', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ term }),
    });
    
    if (response.ok) {
      const data = await response.json();
      return data.correctedTerm || term;
    }
    return term;
  } catch (error) {
    console.error('Spell correction failed:', error);
    return term; // Return original term if correction fails
  }
}

/**
 * Expand search terms to include related medical conditions
 * @param conditions - Original condition terms
 * @returns Expanded list with synonyms and related terms
 */
export function expandMedicalTerms(conditions: string[]): string[] {
  const expansions: { [key: string]: string[] } = {
    // Common diseases
    'diabetes': ['diabetes', 'diabetes mellitus', 'diabetic', 'hyperglycemia', 'insulin resistance'],
    'cancer': ['cancer', 'carcinoma', 'tumor', 'neoplasm', 'malignancy', 'oncology'],
    'malaria': ['malaria', 'plasmodium', 'antimalarial', 'tropical disease'],
    'dwarfism': ['dwarfism', 'achondroplasia', 'short stature', 'skeletal dysplasia', 'growth hormone deficiency'],
    'tuberculosis': ['tuberculosis', 'TB', 'mycobacterium', 'pulmonary tuberculosis'],
    'alzheimer': ['alzheimer', 'dementia', 'cognitive decline', 'neurodegeneration'],
    'parkinson': ['parkinson', 'parkinsons disease', 'movement disorder', 'tremor'],
    'asthma': ['asthma', 'bronchial asthma', 'airway inflammation', 'respiratory disease'],
    'arthritis': ['arthritis', 'rheumatoid arthritis', 'osteoarthritis', 'joint inflammation'],
    'hypertension': ['hypertension', 'high blood pressure', 'elevated blood pressure', 'cardiovascular'],
    'depression': ['depression', 'major depressive disorder', 'mood disorder', 'mental health'],
    'anxiety': ['anxiety', 'anxiety disorder', 'panic disorder', 'mental health'],
    'obesity': ['obesity', 'overweight', 'weight management', 'metabolic syndrome'],
    'stroke': ['stroke', 'cerebrovascular accident', 'brain attack', 'cerebral infarction'],
    'heart disease': ['heart disease', 'cardiovascular disease', 'coronary artery disease', 'cardiac'],
    'epilepsy': ['epilepsy', 'seizure', 'seizure disorder', 'neurological disorder'],
    'migraine': ['migraine', 'headache', 'chronic migraine', 'neurological'],
    'lupus': ['lupus', 'systemic lupus erythematosus', 'autoimmune disease', 'SLE'],
    'celiac': ['celiac', 'celiac disease', 'gluten intolerance', 'gluten sensitivity'],
    'crohn': ['crohn', 'crohns disease', 'inflammatory bowel disease', 'IBD'],
    'psoriasis': ['psoriasis', 'skin disorder', 'autoimmune skin disease'],
    'hepatitis': ['hepatitis', 'liver inflammation', 'viral hepatitis'],
    'hiv': ['hiv', 'aids', 'human immunodeficiency virus', 'antiretroviral'],
    'leukemia': ['leukemia', 'blood cancer', 'hematological malignancy'],
    'lymphoma': ['lymphoma', 'non-hodgkin lymphoma', 'hodgkin lymphoma', 'blood cancer'],
    'anemia': ['anemia', 'iron deficiency', 'low hemoglobin', 'blood disorder'],
    'thyroid': ['thyroid', 'hypothyroidism', 'hyperthyroidism', 'thyroid disorder'],
    'kidney disease': ['kidney disease', 'renal disease', 'chronic kidney disease', 'nephropathy'],
    'liver disease': ['liver disease', 'cirrhosis', 'hepatic disease', 'liver dysfunction'],
  };
  
  const expanded = new Set<string>();
  
  for (const condition of conditions) {
    const normalized = condition.toLowerCase().trim();
    expanded.add(condition); // Add original
    
    // Check for direct matches
    if (expansions[normalized]) {
      expansions[normalized].forEach(term => expanded.add(term));
    } else {
      // Check for partial matches
      for (const [key, values] of Object.entries(expansions)) {
        if (normalized.includes(key) || key.includes(normalized)) {
          values.forEach(term => expanded.add(term));
          break;
        }
      }
    }
  }
  
  return Array.from(expanded);
}

/**
 * Utility function to normalize condition names for API queries
 */
export function normalizeConditionForAPI(condition: string): string {
  return condition
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .trim();
}
