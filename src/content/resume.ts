/*
 * Operator resume content — source of truth: 03-CONTENT.md.
 * Shared by the Terminal (`cat <file>`) and the Dashboard (Experience +
 * Certifications real-data panels). No invented facts.
 */

export const OPERATOR = {
  name: "Marouane Aabirrouche",
  role: "IT Infrastructure specialist — Réseaux & Systèmes",
  location: "Bouznika, Morocco",
  languages: [
    "Arabic (Native)",
    "English (Full Professional)",
    "French (Professional)",
  ],
} as const;

export interface ExperienceEntry {
  role: string;
  org: string;
  period: string;
  location: string;
  summary: string;
}

export const EXPERIENCE: ExperienceEntry[] = [
  {
    role: "IT Intern",
    org: "Disway",
    period: "Feb 2026 – Mar 2026",
    location: "Casablanca",
    summary:
      "Final-year project on centralized monitoring with Prometheus/Grafana; designed the solution, configured metrics collection + visualization, automated alerting.",
  },
  {
    role: "Team Leader / Event Coordinator",
    org: "CAF",
    period: "Dec 2025 – Jan 2026",
    location: "Tangier Stadium",
    summary:
      "Logistics + bilingual support for international delegations; led crowd/access control, delivered bilingual support, smooth operations in a multicultural high-pressure environment.",
  },
  {
    role: "Cybersecurity Intern (SOC/CSIRT)",
    org: "Colas Digital Solutions",
    period: "Jul – Aug 2025",
    location: "Casablanca",
    summary:
      "Incident response; alert triage with CrowdStrike XDR + Trend Vision One, cloud security via Netskope (CASB/SWG), CyberArk (PAM) during remediation, phishing investigations with SOC analysts.",
  },
  {
    role: "Team Leader / Marketing Manager",
    org: "Enactus",
    period: "2021 – 2023",
    location: "Tangier",
    summary:
      "Social entrepreneurship projects; met deadlines, handled resource allocation + marketing.",
  },
];

export interface Certification {
  name: string;
  issuer: string;
  year: string;
}

export const CERTIFICATIONS: Certification[] = [
  { name: "CAISR: Certified AI Security & Risk", issuer: "CAISR Institute", year: "2026" },
  { name: "Google Cybersecurity Specialization", issuer: "Google", year: "Recent" },
  { name: "Threat Intelligence (CTI 101)", issuer: "Industry Standard", year: "Recent" },
  { name: "IBM IT Fundamentals (Cyber)", issuer: "IBM", year: "Recent" },
  { name: "Certified in Cybersecurity (CC)", issuer: "(ISC)²", year: "Recent" },
  { name: "Python Essentials 1", issuer: "Cisco", year: "Recent" },
  { name: "Gen AI: Prompt Engineering", issuer: "Industry Standard", year: "Recent" },
];

export interface EducationEntry {
  title: string;
  org: string;
  period: string;
  note?: string;
}

export const EDUCATION: EducationEntry[] = [
  {
    title: "Specialized Technician diploma, Network & Systems Administration",
    org: "OFPPT — Cité des Métiers et des Compétences (CMC) Tanger",
    period: "2024 – 2026",
    note: "Infrastructure Digitale: Windows Server, DHCP/DNS/AD, Network Security. Completed.",
  },
  {
    title: "University Studies — FST",
    org: "Faculty of Sciences and Technologies",
    period: "2021 – 2024",
    note: "Science & Technology Foundation",
  },
];

export interface ContactLine {
  label: string;
  value: string;
  href?: string;
}

export const CONTACT: ContactLine[] = [
  { label: "email", value: "marouane0aabirrouch@gmail.com", href: "mailto:marouane0aabirrouch@gmail.com" },
  { label: "phone", value: "+212 631 016 297", href: "tel:+212631016297" },
  {
    label: "linkedin",
    value: "linkedin.com/in/marouane-aabirrouche-55a716272",
    href: "https://www.linkedin.com/in/marouane-aabirrouche-55a716272",
  },
  { label: "location", value: "Bouznika, Morocco" },
];

/* ---- Terminal "files" (~ /operator/*.txt), rendered as plain text ---- */

const ABOUT_TXT = [
  `${OPERATOR.name} — ${OPERATOR.role}.`,
  "",
  "Graduate of the Specialized Technician program in Network & Systems",
  "Administration — OFPPT, Cité des Métiers et des Compétences (CMC)",
  "Tanger (2024–2026). Studies complete.",
  "",
  `Based in ${OPERATOR.location}. Working languages:`,
  "  Arabic (native) · English (full professional) · French (professional)",
  "",
  "Focus areas: network & systems administration, monitoring/",
  "observability, and security operations.",
  "",
  "run `ls` to see what else is on file.",
];

const EXPERIENCE_TXT = EXPERIENCE.flatMap((e) => [
  `${e.role} — ${e.org}`,
  `  ${e.period} · ${e.location}`,
  `  ${e.summary}`,
  "",
]);

const EDUCATION_TXT = EDUCATION.flatMap((e) => [
  e.title,
  `  ${e.org} · ${e.period}`,
  ...(e.note ? [`  ${e.note}`] : []),
  "",
]);

const CONTACT_TXT = [
  ...CONTACT.map((c) => `${c.label.padEnd(9)}${c.value}`),
  "",
  "open the Patch Panel app to patch a line directly.",
];

export const TERMINAL_FILES: Record<string, string[]> = {
  "about.txt": ABOUT_TXT,
  "experience.txt": EXPERIENCE_TXT,
  "education.txt": EDUCATION_TXT,
  "contact.txt": CONTACT_TXT,
};
