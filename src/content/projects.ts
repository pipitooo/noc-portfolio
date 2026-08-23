/*
 * Topology map content — source of truth: 03-CONTENT.md (+ extracted
 * firewall_gns3_project.pdf for node PRJ-06). No invented facts.
 */

export type GlyphKind =
  | "dashboard"
  | "server"
  | "cluster"
  | "ap"
  | "gateway"
  | "firewall"
  | "aiops";

export interface SubEntry {
  name: string;
  desc: string;
}

export interface SkillCategory {
  name: string;
  items: string[];
}

export interface ProjectNode {
  id: string;
  code: string;
  name: string;
  typeLabel: string;
  glyph: GlyphKind;
  x: number;
  y: number;
  summary: string;
  detail: string[];
  stack: string[];
  pdfUrl?: string;
  warn?: boolean;
  skills?: SkillCategory[];
  subs?: SubEntry[];
  sections?: { title: string; bullets?: string[]; pre?: string }[];
}

export const SKILLS: SkillCategory[] = [
  {
    name: "System Administration",
    items: [
      "Windows Server (AD, DNS, GPO)",
      "Linux (Ubuntu, Mint, permissions)",
      "Virtualization (VMware, Docker)",
      "Prometheus & Grafana",
    ],
  },
  {
    name: "Networking",
    items: [
      "L2 Switching (VLAN, VTP, DTP, STP, CDP/LLDP)",
      "L3 Routing & HA (OSPF, RIP, HSRP, VRRP, GLBP)",
      "Services (NTP, Syslog, VPN)",
      "Network Security (EAPOL 802.1X)",
    ],
  },
  {
    name: "Cybersecurity",
    items: [
      "SOC Operations Triage",
      "CrowdStrike XDR / Trend Vision One",
      "Netskope (CASB)",
      "CyberArk (PAM)",
      "Pentesting (Nmap, Burp Suite, Gobuster)",
    ],
  },
  {
    name: "Cloud, AI & Tech",
    items: ["Azure", "Tailscale Mesh VPN", "AI-assisted development (Cursor, Lovable)"],
  },
  {
    name: "Languages",
    items: ["Arabic (Native)", "English (Full Professional)", "French (Professional)"],
  },
];

const GNS3_IP_PLAN = `VLAN  ZONE         SUBNET           GATEWAY (IOU2)
10    Management   10.10.10.0/24    10.10.10.1     IOU1, PC1, Kali
20    Sales        10.10.20.0/24    10.10.20.1     IOU3, PC2
30    IT           10.10.30.0/24    10.10.30.1     IOU4, PC3
40    DMZ          10.10.40.0/24    10.10.40.1     IOU5, PC4
--    Core uplink  10.10.0.0/30     .1 FortiGate <-> .2 IOU2`;

export const PROJECTS: ProjectNode[] = [
  {
    id: "monitoring",
    code: "PRJ-01",
    name: "IT Infrastructure Monitoring",
    typeLabel: "MONITORING NODE",
    glyph: "dashboard",
    x: 175,
    y: 330,
    summary:
      "Observability stack using Prometheus for metrics and Grafana for visualization.",
    detail: [
      "Engineered a monitoring system tracking a self-hosted lab's health: Prometheus scraping time-series metrics across servers, containers, and services.",
      "Custom interactive Grafana dashboards for real-time visualization, proactive resource management, bottleneck identification, and troubleshooting.",
    ],
    stack: [
      "Monitoring",
      "Observability",
      "Prometheus",
      "Grafana",
      "Home Lab",
      "Linux",
    ],
    pdfUrl: "/reports/prj-01-monitoring.pdf",
  },
  {
    id: "windows",
    code: "PRJ-02",
    name: "Windows Server Deployment",
    typeLabel: "RACK SERVER NODE",
    glyph: "server",
    x: 645,
    y: 315,
    summary: "Full Active Directory forest with DNS/DHCP and Group Policies.",
    detail: [
      "Deployed a full AD forest with integrated DNS/DHCP.",
      "Strict GPOs for comprehensive user management and security baselines across the domain.",
    ],
    stack: ["Windows Server", "Active Directory", "DNS/DHCP", "GPO"],
    pdfUrl: "/reports/windows-server-deployment.pdf",
  },
  {
    id: "homelab",
    code: "PRJ-03",
    name: "HomeLab & Server Admin",
    typeLabel: "CLUSTER/RACK NODE",
    glyph: "cluster",
    x: 395,
    y: 505,
    summary:
      "Self-hosted environment with Docker/Linux, Jellyfin, Tailscale Mesh VPN.",
    detail: [
      "Docker on a Linux foundation, Jellyfin media server, Tailscale Mesh VPN.",
      "Bypasses NAT for secure remote access without exposing services publicly.",
    ],
    stack: ["Self-Hosting", "Tailscale", "Linux", "Docker", "Jellyfin"],
    pdfUrl: "/reports/prj-03-homelab.pdf",
    skills: SKILLS,
  },
  {
    id: "eviltwin",
    code: "PRJ-04",
    name: 'Cybersecurity Lab ("Evil Twin")',
    typeLabel: "ROGUE AP NODE",
    glyph: "ap",
    x: 815,
    y: 520,
    summary:
      "Controlled environment simulating Wi-Fi Rogue AP attacks and analyzing WPA2 vulnerabilities.",
    detail: [
      "Controlled lab for Evil Twin attacks; analyzed WPA2 by capturing and cracking authentication handshakes for security/educational purposes.",
    ],
    stack: ["Cybersecurity", "Wi-Fi Security", "WPA2", "Penetration Testing"],
    pdfUrl: "/reports/evil-twin-wpa2-lab.pdf",
    warn: true,
  },
  {
    id: "bridgelingo",
    code: "PRJ-05",
    name: "BridgeLingo AI",
    typeLabel: "GATEWAY NODE",
    glyph: "gateway",
    x: 985,
    y: 165,
    summary: "AI-powered language learning app deployed to Microsoft Azure.",
    detail: [
      "Leverages AI for personalized learning; deployed on Azure with scalable architecture using AI-assisted development tools.",
    ],
    stack: ["AI", "Azure", "Web Development"],
    pdfUrl: "/reports/prj-05-bridgelingo.pdf",
  },
  {
    id: "gns3",
    code: "PRJ-06",
    name: "Secured Multi-Zone Network (Firewall / GNS3 Lab)",
    typeLabel: "FIREWALL NODE",
    glyph: "firewall",
    x: 430,
    y: 170,
    summary:
      "A fully simulated multi-zone enterprise network in GNS3: FortiGate perimeter firewall, dot1Q VLAN segmentation, ACL-enforced trust model, port security, and anomaly-based DoS protection — validated by attacking it from a Kali Linux host inside the same topology.",
    detail: [
      "Tools: GNS3, FortiGate 7.0.9, Cisco IOU L2/L3 images, Kali Linux VM.",
      "Built to reproduce real design decisions: where to draw trust boundaries, which zones may talk to each other, how to stop a compromised host from pivoting, and how to verify controls empirically instead of assuming they work.",
    ],
    stack: ["GNS3", "FortiGate 7.0.9", "Cisco IOS", "VLANs", "ACLs", "Kali Linux"],
    pdfUrl: "/reports/prj-06-gns3-firewall.pdf",
    sections: [
      {
        title: "Objectives",
        bullets: [
          "Clearly separated trust zones: Management, Sales, IT, DMZ.",
          "VLAN segmentation via dot1Q trunking between core router and access switches.",
          "Centralized DHCP for all zones from a single core device (IOU2).",
          "Inter-VLAN routing with selective zone communication — no full mesh.",
          "FortiGate as single point of egress: NAT, static routing, anomaly-based DoS protection.",
          "Access-layer hardening: sticky-MAC port security, violation shutdown, BPDU guard.",
          "Validate everything with a Kali Linux attacker machine running recon/scanning tools.",
        ],
      },
      {
        title: "Addressing Plan",
        pre: GNS3_IP_PLAN,
      },
      {
        title: "Trust Model",
        bullets: [
          "Management ↔ IT explicitly permitted (two-way ops access).",
          "Sales: Internet allowed, blocked from every internal zone.",
          "DMZ: fully isolated — assumed public-facing/highest risk; compromise must not pivot inward.",
          "All zones egress through the FortiGate, where NAT and anomaly protections are central.",
        ],
      },
      {
        title: "Implementation Highlights",
        bullets: [
          "Core adapted to a router-class IOU image (no VLAN database): 802.1Q trunks + dot1Q subinterfaces/SVIs instead of native VLANs.",
          "Point-to-point /30 uplink IOU2 ↔ FortiGate (10.10.0.2 ↔ 10.10.0.1); default route toward the firewall.",
          "Per-zone trunks carry only their own VLAN — deliberately restrictive.",
          "One DHCP pool per VLAN, first ten addresses reserved for statics.",
          "Extended ACLs enforce isolation, deny statements placed before the final permit (top-down first-match).",
          "Port security: max 1 sticky MAC + violation shutdown + BPDU guard on access ports; higher threshold with restrict on trunks.",
          "FortiGate static routes back to every internal VLAN; LAN-to-WAN policy with NAT enabled.",
          "DoS policy blocking tcp_syn_flood (200), tcp_port_scan (50), icmp_flood (50), udp_flood (100) — works without an up-to-date FortiGuard subscription.",
          "Traffic shaper caps internal bandwidth, slowing any scan that isn't outright blocked.",
        ],
      },
      {
        title: "Security Validation (Kali, insider placement)",
        bullets: [
          "Kali attached to the Management switch — an east-west threat model: a compromised insider probing laterally, which perimeter firewalls usually under-scrutinize.",
          "Ran SYN scans (-sS), aggressive scans (-A), ping sweeps (-sP), and full 1–65535 port scans against IT-zone hosts.",
          "Observed: scans throttled by the shaper; probes dropped by DoS anomalies before reaching targets; cross-zone pings to Sales/DMZ blocked as designed; Management↔IT reachable intentionally.",
          "Live packet sniffing + log display on the FortiGate during attacks to confirm counters firing.",
        ],
      },
      {
        title: "Lessons Learned",
        bullets: [
          "ACL ordering bug: permit-before-deny silently passed all traffic — first-match processing matters.",
          "Case-sensitive ACL names: applying a mismatched access-group referenced an empty list.",
          "Port-security math differs on trunks vs access ports (switch + host + spare MACs).",
          "A firewall with Internet access says nothing about reachability to internal subnets until routes back exist.",
          "Evaluation-image IPS licensing limits were worked around with anomaly-based policies + shaping — fully functional without a subscription.",
        ],
      },
    ],
  },
  {
    id: "aiops",
    code: "PRJ-07",
    name: "AI & Agent Tooling Stack",
    typeLabel: "AI OPS / CONTROLLER NODE",
    glyph: "aiops",
    x: 1090,
    y: 350,
    summary:
      "The tooling layer behind how I build — local model hosting, a self-hosted routing layer, browser automation, and a multi-agent framework. An infrastructure-and-orchestration story, still in progress and undocumented.",
    detail: [],
    stack: [
      "Local LLMs",
      "llama.cpp",
      "ExLlamaV2",
      "Ollama",
      "OmniRoute",
      "CrewAI",
      "Playwright MCP",
    ],
    pdfUrl: "/reports/ai-agent-tooling-stack.pdf",
    subs: [
      {
        name: "Local AI hosting & quantization",
        desc: "Running quantized/smaller local models to fit an 8GB VRAM budget (RTX 2060 Super, 32GB system RAM). Explored MoE models via llama.cpp, ExLlamaV2/TabbyAPI, and Ollama.",
      },
      {
        name: "OmniRoute",
        desc: "A self-hosted LLM routing layer with an OpenAI-compatible API, running locally on :20128 and routing requests across named model pools: planning, coding, review/security, vision, cheap.",
      },
      {
        name: "Browser automation",
        desc: "Evaluated and used browser-driving tools (Playwright MCP, Browser Use) for web-based automation and AI-assisted coding workflows.",
      },
      {
        name: "CrewAI multi-agent framework",
        desc: "A hierarchical multi-agent system built on CrewAI: ten specialist agents under a custom manager agent with strict delegation-only behavior, using OmniRoute for model routing.",
      },
    ],
  },
];

/* Orthogonal-ish cable runs between related nodes (diagram aesthetics). */
export const LINKS: [string, string][] = [
  ["gns3", "monitoring"],
  ["gns3", "windows"],
  ["windows", "homelab"],
  ["monitoring", "homelab"],
  ["homelab", "eviltwin"],
  ["bridgelingo", "aiops"],
];

/* Decorative Internet cloud anchors (set dressing, not clickable). */
export const CLOUD = { x: 705, y: 62 };
/* Second element "cloud" resolves to the CLOUD anchor position. */
export const CLOUD_LINKS: [string, string][] = [
  ["gns3", "cloud"],
  ["bridgelingo", "cloud"],
];
