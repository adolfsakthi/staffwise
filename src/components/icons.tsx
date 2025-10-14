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
        <text
          x="50%"
          y="50%"
          dominantBaseline="middle"
          textAnchor="middle"
          fontSize="24"
          fontWeight="bold"
          fill="hsl(var(--primary))"
        >
          HEZEE
        </text>
        <text
          x="50%"
          y="75%"
          dominantBaseline="middle"
          textAnchor="middle"
          fontSize="18"
          fill="hsl(var(--accent))"
        >
          ACCESS
        </text>
      </g>
      <defs>
        <clipPath id="clip0_1_2">
          <rect width="100" height="100" fill="white" />
        </clipPath>
      </defs>
    </svg>
  ),
};
