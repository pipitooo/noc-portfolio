import type { SVGProps } from "react";

/*
 * Topology device glyphs (02-DESIGN-SYSTEM.md): each motif must read as its
 * device type at a glance — dashboard, drive-bay server, twin-rack cluster,
 * radiating AP, through-flow gateway, brick-wall firewall, pinned AI chip.
 * Hand-built flat SVG, stroke currentColor, viewBox 0 0 48 40.
 */

type G = SVGProps<SVGSVGElement>;

const base: G = {
  viewBox: "0 0 48 40",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round",
  strokeLinejoin: "round",
};

export function DashboardGlyph(p: G) {
  return (
    <svg {...base} {...p}>
      <rect x="5" y="5" width="38" height="24" rx="2" />
      <path d="M20 33 h8 M24 29 v4" />
      <path d="M9 23 L15 16 L19 19.5 L25 12 L30 16.5" />
      <path d="M33 21 v2 M36 18.5 v4.5 M39 15.5 v7.5" strokeWidth="2.4" />
    </svg>
  );
}

export function ServerGlyph(p: G) {
  return (
    <svg {...base} {...p}>
      <rect x="9" y="3" width="30" height="34" rx="2" />
      <path d="M13 10 h22 M13 20 h22 M13 30 h22" />
      <circle cx="35" cy="10" r="0.9" fill="currentColor" stroke="none" />
      <circle cx="35" cy="20" r="0.9" fill="currentColor" stroke="none" />
      <circle cx="35" cy="30" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function ClusterGlyph(p: G) {
  return (
    <svg {...base} {...p}>
      <rect x="4" y="10" width="17" height="26" rx="2" />
      <path d="M7.5 16 h10 M7.5 22 h10 M7.5 28 h10" />
      <rect x="23" y="4" width="17" height="26" rx="2" />
      <path d="M26.5 10 h10 M26.5 16 h10 M26.5 22 h10" />
      <path d="M31 37 c3 -3 8 -3 11 0" strokeWidth="1.3" opacity="0.75" />
    </svg>
  );
}

export function ApGlyph(p: G) {
  return (
    <svg {...base} {...p}>
      <rect x="14" y="26" width="20" height="9" rx="2" />
      <path d="M18 26 v-2.5 h12 V26" />
      <path d="M17 18 a10 10 0 0 1 14 0" />
      <path d="M13 13 a16 16 0 0 1 22 0" opacity="0.65" />
      <circle cx="24" cy="22.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function GatewayGlyph(p: G) {
  return (
    <svg {...base} {...p}>
      <rect x="8" y="11" width="32" height="18" rx="2" />
      <path d="M2 20 h6 M40 20 h6" />
      <path d="M14 15.5 L19 20 L14 24.5 M22 15.5 L27 20 L22 24.5" />
      <path d="M31.5 20 h4" />
    </svg>
  );
}

export function FirewallGlyph(p: G) {
  return (
    <svg {...base} {...p}>
      <rect x="6" y="8" width="36" height="24" rx="2" />
      <path d="M6 16 h36 M6 24 h36" />
      <path d="M18 8 v8 M30 8 v8 M12 16 v8 M24 16 v8 M36 16 v8 M18 24 v8 M30 24 v8" />
    </svg>
  );
}

export function AiOpsGlyph(p: G) {
  return (
    <svg {...base} {...p}>
      <rect x="14" y="10" width="20" height="20" rx="2.5" />
      <rect x="20" y="16" width="8" height="8" rx="1" />
      <path
        d="M18 10 V4 M24 10 V4 M30 10 V4 M18 30 v6 M24 30 v6 M30 30 v6 M14 15 H8 M14 20 H8 M14 25 H8 M34 15 h6 M34 20 h6 M34 25 h6"
        strokeWidth="1.3"
      />
    </svg>
  );
}

/* ---- Tray-only glyphs (decorative placement bar) ---- */

export function SwitchGlyph(p: G) {
  return (
    <svg {...base} {...p}>
      <rect x="6" y="13" width="36" height="14" rx="2" />
      <path d="M10 22 h4 M17 22 h4 M24 22 h4 M31 22 h4 M38 22 h-1" strokeWidth="2.2" />
    </svg>
  );
}

export function CloudGlyph(p: G) {
  return (
    <svg {...base} {...p}>
      <path d="M14 30 a8 8 0 0 1 -1.5 -15.8 A10 10 0 0 1 32 11.5 A7.5 7.5 0 0 1 34.5 30 Z" />
    </svg>
  );
}
