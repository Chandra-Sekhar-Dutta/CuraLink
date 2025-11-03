// Utility to manage researcher IDs for notifications
const RESEARCHERS_KEY = 'activeResearchers';

export type ResearcherInfo = {
  userId: string;
  name: string;
  email?: string;
  lastActive: Date;
};

// Register a researcher (call this when researcher logs in or visits dashboard)
export function registerResearcher(userId: string, name: string, email?: string) {
  if (typeof window === 'undefined') return;
  
  try {
    const researchers = getResearchers();
    const existing = researchers.find(r => r.userId === userId);
    
    if (existing) {
      // Update last active time
      existing.lastActive = new Date();
      existing.name = name;
      if (email) existing.email = email;
    } else {
      // Add new researcher
      researchers.push({
        userId,
        name,
        email,
        lastActive: new Date()
      });
    }
    
    localStorage.setItem(RESEARCHERS_KEY, JSON.stringify(researchers));
  } catch {}
}

// Get all registered researchers
export function getResearchers(): ResearcherInfo[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const raw = localStorage.getItem(RESEARCHERS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return parsed.map((r: any) => ({
        ...r,
        lastActive: new Date(r.lastActive)
      }));
    }
  } catch {}
  return [];
}

// Get all researcher user IDs
export function getResearcherIds(): string[] {
  return getResearchers().map(r => r.userId);
}

// Remove inactive researchers (optional cleanup)
export function cleanupInactiveResearchers(daysInactive = 30) {
  if (typeof window === 'undefined') return;
  
  try {
    const researchers = getResearchers();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysInactive);
    
    const active = researchers.filter(r => r.lastActive > cutoffDate);
    localStorage.setItem(RESEARCHERS_KEY, JSON.stringify(active));
  } catch {}
}
