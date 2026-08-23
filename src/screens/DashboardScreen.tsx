import { useEffect } from "react";
import { motion } from "motion/react";
import { useScreens } from "../state/screens";
import { useNow } from "../hooks/useNow";
import { formatUptime, session } from "../state/session";
import { CERTIFICATIONS, EXPERIENCE } from "../content/resume";
import { StatusLed } from "../components/StatusLed";

/*
 * Operator dashboard (01-VISION.md §5): Grafana-style observability layout,
 * but the REAL-data panels — Experience timeline + Certifications — carry
 * equal or greater visual weight than the atmospheric telemetry panels
 * (throughput / threats / uptime), which are clearly labeled as simulated.
 */

const EXP_TAGS: Record<string, string> = {
  Disway: "MONITORING",
  CAF: "OPERATIONS",
  "Colas Digital Solutions": "SECURITY",
  Enactus: "LEADERSHIP",
};

function Panel({
  title,
  sub,
  accent = false,
  children,
  className = "",
}: {
  title: string;
  sub?: string;
  accent?: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`relative rounded-panel border border-border-hairline bg-bg-panel ${className}`}
    >
      {/* corner screws */}
      <span aria-hidden className="pointer-events-none absolute -left-px -top-px size-[0.3125rem] rounded-full bg-border-hairline" />
      <span aria-hidden className="pointer-events-none absolute -right-px -top-px size-[0.3125rem] rounded-full bg-border-hairline" />
      <span aria-hidden className="pointer-events-none absolute -bottom-px -left-px size-[0.3125rem] rounded-full bg-border-hairline" />
      <span aria-hidden className="pointer-events-none absolute -bottom-px -right-px size-[0.3125rem] rounded-full bg-border-hairline" />

      <header className="flex items-center justify-between gap-2 border-b border-border-hairline px-4 py-2">
        <h2
          className={`truncate font-mono text-xs tracking-[0.2em] uppercase ${
            accent ? "text-accent-cyan" : "text-text-muted"
          }`}
        >
          {title}
        </h2>
        {sub && <span className="shrink-0 font-mono text-[0.625rem] text-text-muted">{sub}</span>}
      </header>
      {children}
    </section>
  );
}

/* ---- Decorative telemetry helpers (clearly-labeled simulated feeds) ---- */

const frac = (n: number) => n - Math.floor(n);

function throughputSeries(ticks: number): number[] {
  const pts: number[] = [];
  for (let k = 0; k < 48; k++) {
    const x = ticks - (47 - k);
    pts.push(
      Math.min(
        1,
        Math.max(
          0,
          0.52 +
            0.3 * Math.sin(x / 8.2) +
            0.16 * Math.sin(x / 3.1 + 1.7) +
            0.14 * frac(Math.sin(k * 127.1 + Math.floor(x)) * 43758.55) -
            0.06,
        ),
      ),
    );
  }
  return pts;
}

function Sparkline({ points }: { points: number[] }) {
  const w = 252;
  const h = 44;
  const step = w / (points.length - 1);
  const d = points.map((p, i) => `${i === 0 ? "M" : "L"} ${(i * step).toFixed(1)} ${(h - 4 - p * (h - 10)).toFixed(1)}`).join(" ");
  const last = points[points.length - 1];
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-11 w-full" preserveAspectRatio="none" role="img" aria-label="Simulated WAN throughput graph">
      <path d={`${d} L ${w} ${h} L 0 ${h} Z`} fill="var(--accent-cyan)" opacity="0.07" />
      <path d={d} fill="none" stroke="var(--accent-cyan)" strokeWidth="1.4" />
      <circle cx={w} cy={h - 4 - last * (h - 10)} r="2.4" fill="var(--accent-cyan)" className="led-breathe" />
    </svg>
  );
}

export function DashboardScreen() {
  const navigate = useScreens((s) => s.navigate);
  const now = useNow(1000);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") navigate("hub");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [navigate]);

  const ticks = Math.floor(now.getTime() / 2000);
  const series = throughputSeries(ticks);
  const gbps = (0.4 + series[series.length - 1] * 0.85).toFixed(2);
  const threatsBlocked = 1180 + Math.floor((now.getTime() - session.startedAt) / 6000);
  const uptimeSegments = Array.from({ length: 30 }, (_, i) => i !== 22);

  return (
    <div className="rack-grid relative flex h-full w-full flex-col overflow-hidden">
      {/* Status strip */}
      <header className="absolute inset-x-0 top-0 z-20 flex h-9 items-center justify-between border-b border-border-hairline bg-bg-panel/90 px-4 font-mono text-xs backdrop-blur-sm">
        <span className="text-text-muted">// DASHBOARD — OPERATOR TELEMETRY</span>
        <span className="flex items-center gap-3">
          <span className="hidden items-center gap-1.5 text-accent-green-led md:flex">
            <StatusLed breathing />
            FEED LIVE
          </span>
          <button
            onClick={() => navigate("hub")}
            className="rounded-panel border border-border-hairline bg-bg-void px-2.5 py-1 text-text-muted transition-colors duration-150 ease-noc hover:border-accent-cyan-dim hover:text-accent-amber"
          >
            ← hub
          </button>
        </span>
      </header>

      {/* Panels */}
      <main className="flex flex-1 flex-col gap-3 overflow-y-auto p-3 pt-12 xl:grid xl:grid-cols-[minmax(0,1fr)_296px]">
        {/* -------- Real-data panels (primary weight) -------- */}
        <div className="flex min-w-0 flex-col gap-3">
          <Panel
            title="Experience Timeline"
            sub="operator activity log"
            accent
            className="flex min-h-0 flex-1 flex-col"
          >
            <ol className="divide-y divide-border-hairline">
              {EXPERIENCE.map((e, i) => (
                <motion.li
                  key={e.org}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 + i * 0.09, duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
                  className="flex flex-col gap-1 px-4 py-3.5 sm:flex-row sm:gap-4"
                >
                  <div className="flex shrink-0 items-baseline gap-2 font-mono text-xs sm:w-44 sm:flex-col sm:gap-0.5">
                    <span className="text-accent-cyan-dim">{String(EXPERIENCE.length - i).padStart(2, "0")}</span>
                    <span className="text-text-muted">{e.period}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="flex flex-wrap items-baseline gap-x-2.5">
                      <span className="text-sm font-medium text-text-primary">{e.role}</span>
                      <span className="font-mono text-xs text-accent-cyan">— {e.org}</span>
                      <span className="rounded-panel border border-border-hairline bg-bg-void px-1.5 py-px font-mono text-[0.625rem] text-text-muted">
                        {EXP_TAGS[e.org]}
                      </span>
                    </p>
                    <p className="mt-0.5 font-mono text-[0.625rem] tracking-wider text-text-muted">{e.location.toUpperCase()}</p>
                    <p className="mt-1.5 max-w-prose text-sm leading-relaxed text-text-muted">{e.summary}</p>
                  </div>
                </motion.li>
              ))}
            </ol>
          </Panel>

          <Panel title="Certifications" sub={`${CERTIFICATIONS.length} active credentials`} accent>
            <ul className="grid gap-x-6 px-4 py-2 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
              {CERTIFICATIONS.map((c) => (
                <li key={c.name} className="flex items-center gap-2.5 border-b border-border-hairline/60 py-2 last:border-b-0">
                  <StatusLed soft />
                  <span className="min-w-0 flex-1 truncate text-sm text-text-primary" title={c.name}>
                    {c.name}
                  </span>
                  <span className="hidden shrink-0 font-mono text-[0.625rem] text-text-muted md:inline">
                    {c.issuer}
                  </span>
                  <span className="shrink-0 rounded-panel border border-border-hairline bg-bg-void px-1.5 py-px font-mono text-[0.625rem] text-text-muted">
                    {c.year.toUpperCase()}
                  </span>
                </li>
              ))}
            </ul>
          </Panel>
        </div>

        {/* -------- Atmospheric telemetry (visually secondary) -------- */}
        <aside className="flex flex-col gap-3">
          <Panel title="WAN Throughput" sub="simulated feed">
            <div className="px-4 pb-3 pt-2">
              <div className="flex items-baseline justify-between">
                <span className="font-mono text-xl text-text-primary tabular-nums">{gbps}</span>
                <span className="font-mono text-[0.625rem] text-text-muted">Gb/s ↓ eth0</span>
              </div>
              <div className="mt-2">
                <Sparkline points={series} />
              </div>
            </div>
          </Panel>

          <Panel title="Threats Blocked" sub="simulated feed">
            <div className="flex items-center justify-between px-4 pb-3 pt-2.5">
              <span className="font-mono text-xl tabular-nums text-text-primary">
                {threatsBlocked.toLocaleString("en-US")}
              </span>
              <span className="flex items-center gap-1.5 font-mono text-[0.625rem] text-accent-green-led">
                <StatusLed breathing />
                EDGE FW OK
              </span>
            </div>
          </Panel>

          <Panel title="Lab Fleet Uptime" sub="30 days">
            <div className="px-4 pb-3 pt-2.5">
              <div className="flex items-baseline justify-between">
                <span className="font-mono text-xl text-text-primary tabular-nums">99.98%</span>
                <span className="font-mono text-[0.625rem] text-text-muted">SLA</span>
              </div>
              <div className="mt-2.5 flex gap-[0.1875rem]" aria-hidden>
                {uptimeSegments.map((ok, i) => (
                  <span
                    key={i}
                    className="h-4 flex-1 rounded-[2px]"
                    style={{
                      backgroundColor: ok ? "var(--accent-cyan-dim)" : "var(--accent-amber)",
                      opacity: ok ? 0.85 : 1,
                    }}
                  />
                ))}
              </div>
            </div>
          </Panel>

          <Panel title="Session" sub="tty0">
            <dl className="space-y-1.5 px-4 pb-3 pt-2.5 font-mono text-xs">
              <div className="flex justify-between gap-2">
                <dt className="text-text-muted">uptime</dt>
                <dd className="tabular-nums text-text-primary">{formatUptime(now.getTime())}</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-text-muted">nodes</dt>
                <dd className="text-accent-green-led">7/7 ONLINE</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-text-muted">pop</dt>
                <dd className="text-text-primary">BOUZNIKA · MA</dd>
              </div>
            </dl>
          </Panel>
        </aside>
      </main>
    </div>
  );
}
