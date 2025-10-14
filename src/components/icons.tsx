import type { SVGProps } from 'react';

export const Icons = {
  logo: (props: SVGProps<SVGSVGElement>) => (
    <svg
      {...props}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g clipPath="url(#clip0_1_2)">
        <path
          d="M68.4966 22.8433L31.5034 77.1567L31.5034 22.8433H68.4966Z"
          fill="hsl(var(--accent))"
        />
        <path
          d="M31.5034 77.1567L68.4966 22.8433L68.4966 77.1567H31.5034Z"
          fill="hsl(var(--primary))"
        />
        <path
          d="M68.4966 22.8433L31.5034 77.1567M68.4966 22.8433H31.5034V22.8433V77.1567M68.4966 22.8433L68.4966 77.1567L31.5034 77.1567"
          stroke="hsl(var(--primary))"
          strokeWidth="4"
        />
      </g>
      <defs>
        <clipPath id="clip0_1_2">
          <rect width="100" height="100" fill="white" />
        </clipPath>
      </defs>
    </svg>
  ),
};
