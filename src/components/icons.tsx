import type { SVGProps } from 'react';

export const Icons = {
  logo: (props: SVGProps<SVGSVGElement>) => (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 200 50"
      className="h-6 w-auto"
    >
      <defs>
        <linearGradient id="logo-gradient" x1="0" y1="0" x2="1" y2="0">
          <stop offset="60%" stopColor="hsl(var(--primary))" />
          <stop offset="60%" stopColor="hsl(var(--accent))" />
        </linearGradient>
      </defs>
      <text
        x="0"
        y="15"
        fontFamily="Arial, sans-serif"
        fontSize="18"
        fontWeight="bold"
        fill="hsl(var(--primary))"
      >
        HEZEE
      </text>
      <text
        x="0"
        y="40"
        fontFamily="Arial, sans-serif"
        fontSize="18"
        fontWeight="bold"
      >
        <tspan fill="hsl(var(--accent))">ACC</tspan>
        <tspan fill="hsl(var(--primary))">ESS</tspan>
      </text>
    </svg>
  ),
};
