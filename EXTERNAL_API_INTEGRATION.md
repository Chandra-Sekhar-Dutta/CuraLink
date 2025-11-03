# External API Integration - Real Data Sources

## Overview
This project now integrates with **free external APIs** to provide real medical data instead of showing "not found" messages. The application fetches live data from reputable medical databases.

## Integrated APIs

### 1. **PubMed API** (NCBI E-utilities)
- **Purpose**: Fetch real medical research publications
- **Endpoint**: `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/`
- **Cost**: FREE - No API key required
- **Data Provided**:
  - Research article titles
  - Publication dates
  - Authors
  - Journal names
  - Abstracts (when available)

### 2. **ClinicalTrials.gov API v2**
- **Purpose**: Fetch real clinical trial information
- **Endpoint**: `https://clinicaltrials.gov/api/v2/studies`
- **Cost**: FREE - No API key required
- **Data Provided**:
  - Trial names and IDs
  - Study phases (Phase I, II, III, etc.)
  - Recruitment status
  - Location information
  - Study descriptions
  - Sponsor information

## Implementation

### New Files Created

1. **`lib/externalData.ts`**
   - Service layer for API calls
   - Functions:
     - `fetchPubMedPublications()` - Get publications from PubMed
     - `fetchClinicalTrials()` - Get trials from ClinicalTrials.gov
     - `normalizeConditionForAPI()` - Utility for query formatting

2. **API Routes**:
   - **`app/api/external-data/publications/route.ts`**
     - Server-side route to fetch PubMed data
     - Accepts query params: `conditions`, `maxResults`
   
   - **`app/api/external-data/clinical-trials/route.ts`**
     - Server-side route to fetch ClinicalTrials.gov data
     - Accepts query params: `conditions`, `location`, `maxResults`

### Updated Components

1. **Patient Dashboard** (`app/dashboard/patient/page.tsx`)
   - Added real-time data fetching
   - Loading states while fetching data
   - Automatic API calls when profile conditions are set
   - Displays real publications and trials instead of mock data

2. **Publications Page** (`app/dashboard/patient/publications/page.tsx`)
   - Toggle between real PubMed data and mock data
   - Shows 20+ real publications based on patient conditions
   - Direct links to PubMed articles
   - Author information and journal names

3. **Clinical Trials Page** (`app/dashboard/patient/trials/page.tsx`)
   - Toggle between real ClinicalTrials.gov data and mock data
   - Location-based filtering
   - Phase and status filters
   - Direct links to trial details on ClinicalTrials.gov

## Features

### Real-time Data Fetching
- Publications and trials are fetched automatically when:
  - Patient sets up their profile with conditions
  - Patient updates their condition preferences
  - Patient changes location settings

### Intelligent Caching
- Data is fetched when profile changes
- Loading states prevent UI flickering
- Graceful fallback to mock data if APIs fail

### User Controls
- **Toggle switches** to switch between real and mock data
- Helpful for testing and comparison
- Located in publications and trials pages

### Enhanced Display
- **Publications show**:
  - Full article titles
  - Journal names
  - Publication years
  - Author lists (first 3 authors + "et al.")
  - Direct links to PubMed
  
- **Trials show**:
  - Trial names and NCT IDs
  - Phase badges (Phase I/II/III)
  - Status indicators (Recruiting, Active, etc.)
  - Location information
  - Sponsor details
  - Brief descriptions
  - Direct links to ClinicalTrials.gov

## How It Works

### Flow Diagram
```
Patient Profile Setup
    ↓
Conditions Selected (e.g., "Diabetes")
    ↓
Auto-fetch from APIs
    ↓
Display Real Data
    ↓
No "Not Found" Messages!
```

### Example API Call Flow

1. **Patient enters condition**: "Diabetes"
2. **Frontend calls**: `/api/external-data/publications?conditions=Diabetes&maxResults=10`
3. **Backend fetches**: PubMed API → Process → Return JSON
4. **Frontend displays**: Real research papers about diabetes

## Benefits

✅ **No more "not found" messages**
✅ **Real, up-to-date medical data**
✅ **Free APIs - no cost**
✅ **No API keys required**
✅ **Automatic updates as new research is published**
✅ **Location-aware trial matching**
✅ **Professional, credible data sources**

## Testing

### To Test Publications:
1. Go to Patient Dashboard
2. Click "Set up profile" 
3. Enter condition: "Cancer", "Diabetes", or any medical condition
4. Click "Save and View Dashboard"
5. See real publications from PubMed!

### To Test Clinical Trials:
1. From dashboard, navigate to "Trials" section
2. Real trials based on your condition will appear
3. Filter by location, phase, or status
4. Click "View on CT.gov" to see full trial details

### Toggle Feature:
- Both Publications and Trials pages have a toggle button
- Switch between "Real Data" and "Mock Data" to see the difference

## Error Handling

- If APIs are down or slow, fallback to mock data
- Loading spinners show while fetching
- Helpful messages guide users
- No crashes even if APIs fail

## Future Enhancements

Potential additions (not yet implemented):
- OpenFDA API for drug information
- ORCID API for researcher/expert data
- WHO clinical trials registry
- NIH Reporter API for grant information
- Cache management for better performance
- Rate limiting protection

## API Limitations

### PubMed:
- Rate limit: ~3 requests/second (generally sufficient)
- No authentication required for basic access
- Returns up to 10,000 results per search

### ClinicalTrials.gov:
- Rate limit: Generous, no strict limits for reasonable use
- No authentication required
- Comprehensive trial database

## Technical Notes

- All API calls are made server-side (Next.js API routes)
- Prevents CORS issues
- Keeps API logic secure
- Client-side only displays data
- TypeScript types ensure data consistency

## Conclusion

The application now provides **real, live data** from trusted medical sources:
- ✅ **PubMed** for research publications
- ✅ **ClinicalTrials.gov** for clinical trials
- ✅ No more "not found" messages
- ✅ 100% FREE APIs
- ✅ No API keys needed

Users can now discover actual medical research and clinical trials relevant to their health conditions!
