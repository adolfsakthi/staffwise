
import type { SVGProps } from 'react';

export const Icons = {
  logo: (props: SVGProps<SVGSVGElement>) => (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 256 256"
      className="h-6 w-6"
    >
      <rect width="256" height="256" fill="none" />
      <path
        d="M32,80.4,128,32l96,48.4V175.6L128,224,32,175.6Z"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="16"
      />
      <polyline
        points="128 72 128 128 176 152"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="16"
      />
    </svg>
  ),
  hezeeLogo: (props: SVGProps<SVGSVGElement>) => (
    <svg
      {...props}
      width="64"
      height="64"
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M32 6L6 22V38C6 48.4 17.6 58 32 62C46.4 58 58 48.4 58 38V22L32 6Z"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M22 28L32 38L42 28"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
       <path d="M42 16L46 12" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>
       <path d="M46 16L42 12" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>
       <path d="M50 20L54 16" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>
       <path d="M54 20L50 16" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>
    </svg>
  ),
};
