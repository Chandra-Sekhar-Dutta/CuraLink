interface CuraLinkLogoProps {
  className?: string;
  width?: number;
  height?: number;
}

export default function CuraLinkLogo({ className = '', width = 40, height = 40 }: CuraLinkLogoProps) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Medical Cross - Blue gradient */}
      <path
        d="M50 10 C45 10 40 12 40 15 L40 40 L15 40 C12 40 10 45 10 50 C10 55 12 60 15 60 L40 60 L40 85 C40 88 45 90 50 90 C55 90 60 88 60 85 L60 60 L85 60 C88 60 90 55 90 50 C90 45 88 40 85 40 L60 40 L60 15 C60 12 55 10 50 10 Z"
        fill="url(#blueGradient)"
        stroke="url(#blueStroke)"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      
      {/* Leaf - Teal/Green gradient */}
      <path
        d="M65 30 C65 30 75 32 80 40 C85 48 85 55 82 62 C80 67 75 70 70 71 C65 72 58 70 52 65 C50 63 48 60 47 57 C46 54 46 51 48 48 C50 45 54 43 58 42 C62 41 66 41 68 42 C70 43 71 44 71 46 C71 48 69 49 67 49 C65 49 63 48 61 46"
        fill="url(#greenGradient)"
        stroke="url(#greenStroke)"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      
      {/* Gradient definitions */}
      <defs>
        <linearGradient id="blueGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: '#2563eb', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: '#1e40af', stopOpacity: 1 }} />
        </linearGradient>
        
        <linearGradient id="blueStroke" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: '#1d4ed8', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: '#1e3a8a', stopOpacity: 1 }} />
        </linearGradient>
        
        <linearGradient id="greenGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: '#14b8a6', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: '#0d9488', stopOpacity: 1 }} />
        </linearGradient>
        
        <linearGradient id="greenStroke" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: '#0f766e', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: '#115e59', stopOpacity: 1 }} />
        </linearGradient>
      </defs>
    </svg>
  );
}
