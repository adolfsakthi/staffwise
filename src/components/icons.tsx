import type { SVGProps } from 'react';

export const Icons = {
  logo: (props: SVGProps<SVGSVGElement>) => (
    <svg
      {...props}
      viewBox="0 0 50 50"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M25 0L50 14V36L25 50L0 36V14L25 0Z"
        fill="hsl(var(--primary))"
      />
      <path
        d="M13 25L25 18L37 25L25 32L13 25Z"
        fill="hsl(var(--accent))"
      />
    </svg>
  ),
};
