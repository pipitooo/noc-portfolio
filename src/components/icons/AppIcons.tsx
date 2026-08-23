import type { SVGProps } from "react";

/*
 * App icons for the desktop hub — hand-built flat SVG, stroke-based,
 * on-palette via currentColor. Per 02-DESIGN-SYSTEM.md these are NOT
 * generic tech icons; each silhouette reads as its specific tool.
 */

type IconProps = SVGProps<SVGSVGElement>;

const base: IconProps = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round",
  strokeLinejoin: "round",
};

export function TerminalIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="M7 9.5 L10 12 L7 14.5" />
      <path d="M12 15 H17" />
    </svg>
  );
}

export function TopologyIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <circle cx="6" cy="6" r="2.2" />
      <rect x="15.8" y="3.8" width="4.4" height="4.4" rx="1" />
      <circle cx="12" cy="18" r="2.2" />
      <path d="M8.2 6 H15.8" />
      <path d="M7.4 7.9 L10.6 16.2" />
      <path d="M16.6 7.9 L13.4 16.2" />
    </svg>
  );
}

export function DashboardIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <rect x="3" y="3" width="18" height="11" rx="1.5" />
      <path d="M5.5 10.5 L8.5 7 L11 9 L14 5.5 L18.5 8" />
      <path d="M4.5 17 V21" />
      <path d="M9 19.5 V21" />
      <path d="M13.5 16 V21" />
      <path d="M18 18 V21" />
    </svg>
  );
}

export function PatchPanelIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <rect x="2.5" y="5" width="19" height="8" rx="1.5" />
      <path d="M5.5 8 V10.5 M9 8 V10.5 M12.5 8 V10.5 M16 8 V10.5 M19.5 8 V10.5" />
      <path d="M5.5 10.5 C5.5 15.5 9 16 11 18 C12 19.2 12.5 20 12.5 21" />
      <circle cx="5.5" cy="10.5" r="0.4" />
    </svg>
  );
}

export function TicketQueueIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="M7 8.5 H17" />
      <path d="M7 11.5 H13" />
      <path d="M3 14.5 H8 L9.8 17 H14.2 L16 14.5 H21" />
    </svg>
  );
}
