import React from 'react';

const BotIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M12 8V4H8" />
    <rect width="16" height="8" x="4" y="12" rx="2" />
    <path d="M2 12h2" />
    <path d="M20 12h2" />
    <path d="M12 12v-2a2 2 0 0 1 2-2h2.5a2.5 2.5 0 0 1 2.5 2.5V12" />
    <path d="M12 12v-2a2 2 0 0 0-2-2H7.5a2.5 2.5 0 0 0-2.5 2.5V12" />
  </svg>
);

export default BotIcon;