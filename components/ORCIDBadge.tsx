'use client';

import { useSession } from 'next-auth/react';

interface ORCIDBadgeProps {
  orcidId?: string | null;
  className?: string;
}

export default function ORCIDBadge({ orcidId, className = '' }: ORCIDBadgeProps) {
  const { data: session } = useSession();
  
  // Use provided orcidId or get from session
  const displayOrcidId = orcidId || (session?.user as any)?.orcidId;
  
  if (!displayOrcidId) {
    return null;
  }

  return (
    <a
      href={`https://orcid.org/${displayOrcidId}`}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center gap-2 px-3 py-1.5 bg-white border-2 border-[#a6ce39] rounded-lg hover:bg-gray-50 transition-colors ${className}`}
      title="View ORCID profile"
    >
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="#a6ce39">
        <path d="M12 0C5.372 0 0 5.372 0 12s5.372 12 12 12 12-5.372 12-12S18.628 0 12 0zM7.369 4.378c.525 0 .947.431.947.947s-.422.947-.947.947a.95.95 0 0 1-.947-.947c0-.525.422-.947.947-.947zm-.722 3.038h1.444v10.041H6.647V7.416zm3.562 0h3.9c3.712 0 5.344 2.653 5.344 5.025 0 2.578-2.016 5.016-5.325 5.016h-3.919V7.416zm1.444 1.303v7.444h2.297c2.359 0 3.825-1.444 3.825-3.722 0-2.056-1.285-3.722-3.844-3.722h-2.278z"/>
      </svg>
      <span className="text-sm font-medium text-gray-700">
        {displayOrcidId}
      </span>
      <svg className="w-3 h-3 text-[#a6ce39]" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
      </svg>
    </a>
  );
}
