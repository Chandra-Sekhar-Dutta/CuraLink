# Architecture Diagram: External API Integration

## System Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER INTERFACE                          │
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐        │
│  │   Patient    │  │ Publications │  │ Clinical     │        │
│  │  Dashboard   │  │     Page     │  │ Trials Page  │        │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘        │
│         │                  │                  │                 │
└─────────┼──────────────────┼──────────────────┼─────────────────┘
          │                  │                  │
          │ (React State)    │ (React State)    │ (React State)
          │                  │                  │
          ▼                  ▼                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                       FRONTEND LOGIC                            │
│                                                                 │
│  • useEffect hooks trigger on profile changes                  │
│  • fetch() calls to API routes                                 │
│  • Loading states managed                                       │
│  • Data stored in component state                              │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
          │                  │                  │
          │ HTTP GET         │ HTTP GET         │ HTTP GET
          │                  │                  │
          ▼                  ▼                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                    NEXT.JS API ROUTES                           │
│                                                                 │
│  /api/external-data/publications    /api/external-data/        │
│  • Receives: conditions[]           clinical-trials            │
│  • Calls: fetchPubMedPublications() • Receives: conditions[],  │
│  • Returns: JSON with publications    location                 │
│                                     • Calls:                    │
│                                       fetchClinicalTrials()     │
│                                     • Returns: JSON with trials │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
          │                  │                  │
          │                  │                  │
          ▼                  ▼                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                    SERVICE LAYER                                │
│                     (lib/externalData.ts)                       │
│                                                                 │
│  fetchPubMedPublications()        fetchClinicalTrials()        │
│  • Format search query            • Format search query         │
│  • Call PubMed API                • Call ClinicalTrials.gov     │
│  • Parse response                 • Parse response              │
│  • Format data                    • Format data                 │
│  • Return typed objects           • Return typed objects        │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
          │                              │
          │ HTTPS                        │ HTTPS
          │                              │
          ▼                              ▼
┌──────────────────────┐      ┌──────────────────────┐
│   PubMed API         │      │ ClinicalTrials.gov   │
│   (NCBI E-utilities) │      │    API v2            │
│                      │      │                      │
│  • 30M+ citations    │      │  • 400K+ studies     │
│  • FREE access       │      │  • FREE access       │
│  • No API key        │      │  • No API key        │
│  • Global coverage   │      │  • Global coverage   │
└──────────────────────┘      └──────────────────────┘
```

## Data Flow Example

### Scenario: Patient searches for "Diabetes" publications

```
1. USER ACTION
   ├─ Patient sets up profile
   ├─ Enters condition: "Diabetes"
   └─ Saves profile

2. FRONTEND (Dashboard)
   ├─ useEffect detects profile change
   ├─ Calls: /api/external-data/publications?conditions=Diabetes
   └─ Shows loading spinner

3. API ROUTE (Server-side)
   ├─ Receives request with conditions=["Diabetes"]
   ├─ Calls fetchPubMedPublications(["Diabetes"], 10)
   └─ Waits for response

4. SERVICE LAYER
   ├─ Formats query: "Diabetes"
   ├─ Step 1: Search PubMed for article IDs
   │   └─ GET https://eutils.ncbi.nlm.nih.gov/.../esearch.fcgi
   ├─ Step 2: Fetch article details by IDs
   │   └─ GET https://eutils.ncbi.nlm.nih.gov/.../esummary.fcgi
   └─ Parses and formats results

5. EXTERNAL API (PubMed)
   ├─ Searches database
   ├─ Returns matching article IDs
   ├─ Returns article summaries
   └─ Responds with JSON data

6. SERVICE LAYER (Return)
   ├─ Transforms API response
   ├─ Creates typed objects:
   │   {
   │     id: "pmid-12345678",
   │     title: "Managing Type 2 Diabetes...",
   │     year: 2024,
   │     authors: ["Smith J", "Jones A"],
   │     journal: "Diabetes Care"
   │   }
   └─ Returns array of publications

7. API ROUTE (Response)
   ├─ Receives formatted data
   └─ Returns: { success: true, publications: [...], count: 10 }

8. FRONTEND (Display)
   ├─ Receives response
   ├─ Updates state: setRealPublications(data.publications)
   ├─ Hides loading spinner
   └─ Renders publications in UI

9. USER SEES
   ├─ 10 real publications about Diabetes
   ├─ Authors, journals, years
   ├─ Links to PubMed
   └─ NO "not found" message! ✅
```

## Component Architecture

```
┌────────────────────────────────────────────────────────────┐
│                    Patient Dashboard                        │
│                                                            │
│  State:                                                    │
│  • profile (conditions, location)                          │
│  • realPublications []                                     │
│  • realTrials []                                           │
│  • loadingExternal (boolean)                               │
│                                                            │
│  Effects:                                                  │
│  • Load profile from localStorage                          │
│  • Load profile from server                                │
│  • Fetch external data when profile changes                │
│                                                            │
│  Render:                                                   │
│  • Quick links                                             │
│  • Personalized recommendations (3 columns):               │
│    ├─ Publications (filtered.publications)                 │
│    ├─ Experts (filtered.experts)                           │
│    └─ Trials (filtered.trials)                             │
│  • Stats grid                                              │
│  • Main content                                            │
└────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────┐
│                   Publications Page                         │
│                                                            │
│  State:                                                    │
│  • query (search term)                                     │
│  • conditions []                                           │
│  • realPublications []                                     │
│  • isLoading (boolean)                                     │
│  • useRealData (boolean)                                   │
│                                                            │
│  Effects:                                                  │
│  • Load profile on mount                                   │
│  • Fetch PubMed data when conditions change                │
│                                                            │
│  Render:                                                   │
│  • Toggle button (Real Data / Mock Data)                   │
│  • Search input                                            │
│  • Loading spinner OR results list                         │
│  • Each result card with:                                  │
│    ├─ Title, journal, year                                 │
│    ├─ Authors                                              │
│    ├─ Save button                                          │
│    └─ Links to PubMed / Google Scholar                     │
└────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────┐
│                  Clinical Trials Page                       │
│                                                            │
│  State:                                                    │
│  • query, city, country, global                            │
│  • phase, recruit (filters)                                │
│  • conditions []                                           │
│  • realTrials []                                           │
│  • isLoading (boolean)                                     │
│  • useRealData (boolean)                                   │
│                                                            │
│  Effects:                                                  │
│  • Load profile on mount                                   │
│  • Fetch ClinicalTrials.gov data when conditions change    │
│                                                            │
│  Render:                                                   │
│  • Toggle button (Real Data / Mock Data)                   │
│  • Search filters (keywords, phase, status, location)      │
│  • Loading spinner OR results list                         │
│  • Each trial card with:                                   │
│    ├─ Title, phase, status badges                          │
│    ├─ Location                                             │
│    ├─ Description                                          │
│    ├─ Sponsor                                              │
│    ├─ Save button                                          │
│    └─ Link to ClinicalTrials.gov                           │
└────────────────────────────────────────────────────────────┘
```

## Error Handling Flow

```
API Call Flow with Error Handling:

try {
  ├─ Fetch from API
  │  ├─ Success → Process data → Update state
  │  └─ Network error → catch block
  │
  └─ catch (error) {
     ├─ Log error to console
     ├─ Keep existing data or empty array
     └─ UI shows fallback/mock data
  }
} finally {
  └─ Set loading = false (always)
}

Result: No crashes, graceful degradation
```

## State Management

```
┌─────────────────────────────────────┐
│      Component State                │
│                                     │
│  const [profile, setProfile]        │
│  ├─ Loaded from localStorage        │
│  ├─ Updated from server             │
│  └─ Triggers data fetching          │
│                                     │
│  const [realPublications, set...]   │
│  ├─ Empty array initially           │
│  ├─ Populated by API call           │
│  └─ Used in render                  │
│                                     │
│  const [realTrials, set...]         │
│  ├─ Empty array initially           │
│  ├─ Populated by API call           │
│  └─ Used in render                  │
│                                     │
│  const [loadingExternal, set...]    │
│  ├─ false initially                 │
│  ├─ true during fetch               │
│  └─ false after completion          │
│                                     │
│  const [useRealData, set...]        │
│  ├─ true initially (use real data)  │
│  ├─ Toggle via button               │
│  └─ Determines data source          │
└─────────────────────────────────────┘
```

## Technology Stack

```
┌──────────────────────────────────────┐
│         Frontend Layer               │
├──────────────────────────────────────┤
│  • React 18                          │
│  • Next.js 14 (App Router)           │
│  • TypeScript                        │
│  • Tailwind CSS                      │
│  • Framer Motion (animations)        │
└──────────────────────────────────────┘
           ↕
┌──────────────────────────────────────┐
│         API Layer                    │
├──────────────────────────────────────┤
│  • Next.js API Routes                │
│  • TypeScript                        │
│  • Fetch API                         │
│  • JSON responses                    │
└──────────────────────────────────────┘
           ↕
┌──────────────────────────────────────┐
│         Service Layer                │
├──────────────────────────────────────┤
│  • lib/externalData.ts               │
│  • TypeScript interfaces             │
│  • Error handling                    │
│  • Data transformation               │
└──────────────────────────────────────┘
           ↕
┌──────────────────────────────────────┐
│      External APIs                   │
├──────────────────────────────────────┤
│  • PubMed (REST API)                 │
│  • ClinicalTrials.gov (REST API)     │
│  • HTTPS                             │
│  • JSON responses                    │
└──────────────────────────────────────┘
```

## Key Design Decisions

1. **Server-side API calls**: Prevents CORS, keeps architecture clean
2. **Component state**: Simple, effective for this use case
3. **Toggle switches**: Let users compare real vs mock data
4. **Loading states**: Better UX during API calls
5. **Graceful fallback**: Never crash, always show something
6. **TypeScript**: Type safety throughout the stack
7. **Free APIs**: No cost, no API key management

---

**Visual representation of the complete architecture** ✅
