import React from 'react';

export const CodeIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <defs>
      <linearGradient id="code-icon-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{ stopColor: '#818cf8' }} />
        <stop offset="100%" style={{ stopColor: '#c084fc' }} />
      </linearGradient>
    </defs>
    <polyline points="16 18 22 12 16 6" stroke="url(#code-icon-gradient)" />
    <polyline points="8 6 2 12 8 18" stroke="url(#code-icon-gradient)" />
  </svg>
);