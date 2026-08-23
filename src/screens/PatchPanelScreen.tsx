/*
 * Patch panel (01-VISION.md §6): RJ-45 drag-to-patch contact screen.
 * Dragging a plug from the tray into an open port establishes that
 * channel's uplink — the contact card flips from NO CARRIER to a live
 * link. Location: Bouznika (03-CONTENT.md). Amber stays reserved for
 * hover/warning; cables use existing palette tokens only.
 */

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useScreens } from "../state/screens";
import { StatusLed } from "../components/StatusLed";

interface Channel {
  id: string;
  port: string;
  label: string;
  value: string;
  href?: string;
  color: string;
}

const CHANNELS: Channel[] = [
  {
    id: "email",
    port: "ETH-01",
    label: "EMAIL",
    value: "marouane0aabirrouch@gmail.com",
    href: "mailto:marouane0aabirrouch@gmail.com",
    color: "var(--accent-cyan)",
  },
  {
    id: "phone",
    port: "ETH-02",
    label: "PHONE",
    value: "+212 631 016 297",
    href: "tel:+212631016297",
    color: "var(--accent-green-led)",
  },
  {
    id: "linkedin",
    port: "ETH-03",
    label: "LINKEDIN",
    value: "linkedin.com/in/marouane-aabirrouche-55a716272",
    href: "https://www.linkedin.com/in/marouane-aabirrouche-55a716272",
    color: "var(--text-muted)",
  },
  {
    id: "location",
    port: "ETH-04",
    label: "LOCATION",
    value: "Bouznika, Morocco",
    color: "var(--text-primary)",
  },
];

interface PathPts {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

/* RJ-45 plug silhouette, reads as a crystal connector */
function PlugGlyph({
  className,
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <svg viewBox="0 0 32 22" className={className} style={style} fill="none" aria-hidden>
      <path
        d="M3 8 h17 v5 l4 3 v4 H3 Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <path d="M7 8 V12 M11 8 V12 M15 8 V12 M19 8 V12" stroke="currentColor" strokeWidth="1.2" />
      <path d="M24 13 h5 v7 h-5" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
      <path d="M25.5 15 h2 M25.5 17.5 h2" stroke="currentColor" strokeWidth="1" />
    </svg>
  );
}

/* Keystone jack face — open slot until patched, seated plug after */
function JackFace({ patched, hot }: { patched: boolean; hot: boolean }) {
  return (
    <svg viewBox="0 0 44 38" className="h-[2.6rem] w-12" fill="none" aria-hidden>
      <rect
        x="1"
        y="1"
        width="42"
        height="36"
        rx="3"
        stroke={hot ? "var(--accent-amber)" : patched ? "var(--accent-cyan-dim)" : "var(--border-hairline)"}
        strokeWidth="1.4"
      />
      {patched ? (
        <>
          <path
            d="M12 9 h14 v6 l5 4 v10 H12 Z M16 9 v4 M21 9 v4 M26 9 v4"
            stroke="var(--accent-cyan)"
            strokeWidth="1.3"
            strokeLinejoin="round"
          />
          <circle cx="36" cy="30" r="2" fill="var(--accent-green-led)" className="led-breathe" />
        </>
      ) : (
        <>
          <path d="M14 8 h16 v18 h-16 Z" stroke="var(--border-hairline)" strokeWidth="1.2" />
          <path d="M18 8 V26 M22 8 V26 M26 8 V26" stroke="var(--border-hairline)" strokeWidth="1" />
        </>
      )}
    </svg>
  );
}

export function PatchPanelScreen() {
  const navigate = useScreens((s) => s.navigate);
  const [patched, setPatched] = useState<string[]>([]);
  const [paths, setPaths] = useState<Record<string, PathPts>>({});
  const [dragging, setDragging] = useState<{ id: string; x: number; y: number } | null>(null);
  const [hoverPort, setHoverPort] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const screenRef = useRef<HTMLDivElement>(null);
  const plugRefs = useRef<Record<string, HTMLElement | null>>({});
  const portRefs = useRef<Record<string, HTMLElement | null>>({});
  const dragChannelRef = useRef<string | null>(null);

  // ESC tears the session down -> desktop hub
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") navigate("hub");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [navigate]);

  // Cable geometry: recompute whenever the patch set, viewport or scroll
  // changes — plugs stay mounted (dimmed) once patched, so both endpoints
  // are always measurable live.
  const recalc = () => {
    const base = screenRef.current?.getBoundingClientRect();
    if (!base) return;
    const next: Record<string, PathPts> = {};
    for (const c of CHANNELS) {
      if (!patched.includes(c.id)) continue;
      const p = portRefs.current[c.id]?.getBoundingClientRect();
      const g = plugRefs.current[c.id]?.getBoundingClientRect();
      if (!p || !g) continue;
      next[c.id] = {
        x1: g.left + g.width / 2 - base.left,
        y1: g.top - base.top + 4,
        x2: p.left + p.width / 2 - base.left,
        y2: p.top - base.top + 6,
      };
    }
    setPaths(next);
  };

  useEffect(() => {
    recalc();
    window.addEventListener("resize", recalc);
    return () => window.removeEventListener("resize", recalc);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [patched]);

  function onPlugPointerDown(e: React.PointerEvent, id: string) {
    if (patched.includes(id)) return;
    e.preventDefault();
    dragChannelRef.current = id;
    setDragging({ id, x: e.clientX, y: e.clientY });
  }

  // Window-level move/up while a plug is in hand
  useEffect(() => {
    if (!dragging) return;

    const hitTest = (x: number, y: number) => {
      const el = document.elementFromPoint(x, y);
      const port = el?.closest("[data-port]");
      setHoverPort(port ? (port as HTMLElement).dataset.port ?? null : null);
    };

    const move = (e: PointerEvent) => {
      setDragging((d) => (d ? { ...d, x: e.clientX, y: e.clientY } : d));
      hitTest(e.clientX, e.clientY);
    };
    const up = (e: PointerEvent) => {
      const el = document.elementFromPoint(e.clientX, e.clientY);
      const portId = (el?.closest("[data-port]") as HTMLElement | null)?.dataset.port;
      const ch = dragChannelRef.current;
      if (ch && portId === ch && !patched.includes(ch)) {
        setPatched((p) => [...p, ch]);
      }
      dragChannelRef.current = null;
      setDragging(null);
      setHoverPort(null);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dragging?.id, patched.length]);

  const copyValue = async (c: Channel) => {
    try {
      await navigator.clipboard.writeText(c.value);
      setCopied(c.id);
      window.setTimeout(() => setCopied(null), 1400);
    } catch {
      setCopied(null);
    }
  };

  const allPatched = patched.length === CHANNELS.length;
  const dragChannel = CHANNELS.find((c) => c.id === dragging?.id) ?? null;

  return (
    <div ref={screenRef} className="rack-grid relative flex h-full w-full flex-col overflow-hidden">
      {/* Status strip */}
      <header className="absolute inset-x-0 top-0 z-30 flex h-9 shrink-0 items-center justify-between border-b border-border-hairline bg-bg-panel/90 px-4 font-mono text-xs backdrop-blur-sm">
        <span className="text-text-muted">// PATCH PANEL — CONTACT UPLINKS</span>
        <span className="flex items-center gap-3">
          <span className="hidden items-center gap-1.5 font-mono text-text-muted md:flex">
            drag a plug into an open port to establish a channel
          </span>
          <span
            className={`flex items-center gap-1.5 ${
              allPatched ? "text-accent-green-led" : "text-accent-cyan"
            }`}
          >
            <StatusLed active={allPatched} breathing={allPatched} />
            {allPatched ? "OPERATOR REACHABLE" : `UPLINKS ${patched.length}/${CHANNELS.length}`}
          </span>
          <button
            onClick={() => navigate("hub")}
            className="rounded-panel border border-border-hairline bg-bg-void px-2.5 py-1 text-text-muted transition-colors duration-150 ease-noc hover:border-accent-cyan-dim hover:text-accent-amber"
          >
            ← hub
          </button>
        </span>
      </header>

      <main
        className="mx-auto flex w-full max-w-[88rem] flex-1 flex-col gap-4 overflow-y-auto p-4 pt-14 lg:flex-row lg:items-start"
        onScroll={recalc}
      >
        {/* ---- Channel cards ---- */}
        <section className="flex min-w-0 flex-1 flex-col gap-3 lg:max-w-[46rem]" aria-label="Contact channels">
          {CHANNELS.map((c, i) => {
            const live = patched.includes(c.id);
            return (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.08 + i * 0.07, duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
                className={`rounded-panel border bg-bg-panel px-4 py-3 transition-colors duration-200 ease-noc ${
                  live ? "border-accent-cyan-dim" : "border-border-hairline"
                }`}
                style={hoverPort === c.id ? { borderColor: "var(--accent-amber)" } : undefined}
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="flex items-center gap-2 font-mono text-xs tracking-[0.2em]">
                    <span
                      className="inline-block size-1.5 rounded-full"
                      style={{
                        backgroundColor: live ? "var(--accent-green-led)" : "transparent",
                        border: live ? "none" : "1px solid var(--border-hairline)",
                        boxShadow: live ? "var(--glow-green-led)" : "none",
                      }}
                    />
                    <span className={live ? "text-text-primary" : "text-text-muted"}>{c.label}</span>
                    <span className="text-text-muted/60">{c.port}</span>
                  </p>
                  <span
                    className={`font-mono text-[0.625rem] tracking-wider ${
                      live ? "text-accent-green-led" : "text-text-muted/60"
                    }`}
                  >
                    {live ? "CARRIER OK" : "NO CARRIER"}
                  </span>
                </div>
                <p className="mt-2 min-w-0 truncate pl-4 font-mono text-sm">
                  {live ? (
                    c.href ? (
                      <a
                        href={c.href}
                        target={c.href.startsWith("http") ? "_blank" : undefined}
                        rel="noreferrer"
                        className="text-accent-cyan transition-colors duration-150 ease-noc hover:text-accent-amber"
                        title={c.value}
                      >
                        {c.value}
                      </a>
                    ) : (
                      <span className="text-text-primary">{c.value}</span>
                    )
                  ) : (
                    <span className="select-none tracking-widest text-text-muted/50">▒▒▒▒▒▒▒▒▒▒▒▒▒</span>
                  )}
                </p>
                <AnimatePresence>
                  {live && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
                      className="mt-2 flex items-center gap-2 pl-4"
                    >
                      <button
                        onClick={() => void copyValue(c)}
                        className="rounded-panel border border-border-hairline bg-bg-void px-2 py-0.5 font-mono text-[0.625rem] text-text-muted transition-colors duration-150 ease-noc hover:border-accent-cyan-dim hover:text-accent-cyan"
                      >
                        {copied === c.id ? "✓ copied" : "copy"}
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </section>

        {/* ---- Panel + tray ---- */}
        <section
          className="relative flex w-full shrink-0 flex-col items-stretch gap-3 lg:sticky lg:top-0 lg:w-[32rem]"
          aria-label="Patch panel"
        >
          <div className="relative rounded-panel border border-border-hairline bg-bg-panel px-5 pb-4 pt-3">
            {/* corner screws */}
            <span aria-hidden className="pointer-events-none absolute -left-px -top-px size-[0.3125rem] rounded-full bg-border-hairline" />
            <span aria-hidden className="pointer-events-none absolute -right-px -top-px size-[0.3125rem] rounded-full bg-border-hairline" />
            <span aria-hidden className="pointer-events-none absolute -bottom-px -left-px size-[0.3125rem] rounded-full bg-border-hairline" />
            <span aria-hidden className="pointer-events-none absolute -bottom-px -right-px size-[0.3125rem] rounded-full bg-border-hairline" />

            <p className="mb-2 flex items-center justify-between font-mono text-[0.625rem] tracking-[0.25em] text-text-muted">
              <span>PATCH PANEL · 24U</span>
              <span>NOC-CORE-A</span>
            </p>

            <div className="grid grid-cols-3 gap-x-3 gap-y-3 sm:grid-cols-6">
              {CHANNELS.map((c) => (
                <button
                  key={c.id}
                  ref={(el) => {
                    portRefs.current[c.id] = el;
                  }}
                  data-port={c.id}
                  aria-label={`${c.port} — ${c.label} port${patched.includes(c.id) ? ", patched" : ", open"}`}
                  className={`group flex cursor-pointer flex-col items-center gap-1 rounded-panel border px-1 py-1.5 outline-none transition-colors duration-150 ease-noc ${
                    hoverPort === c.id && dragging
                      ? "border-accent-amber bg-bg-panel-raised"
                      : "border-transparent hover:bg-bg-panel-raised focus-visible:border-accent-cyan-dim"
                  }`}
                >
                  <JackFace patched={patched.includes(c.id)} hot={hoverPort === c.id && Boolean(dragging)} />
                  <span
                    className={`font-mono text-[0.625rem] leading-none ${
                      hoverPort === c.id && dragging
                        ? "text-accent-amber"
                        : patched.includes(c.id)
                          ? "text-text-primary"
                          : "text-text-muted group-hover:text-text-primary"
                    }`}
                  >
                    {c.port}
                  </span>
                </button>
              ))}
              {/* spare positions — set dressing */}
              {[1, 2].map((n) => (
                <div key={n} className="flex flex-col items-center gap-1 rounded-panel border border-transparent px-1 py-1.5 opacity-60">
                  <JackFace patched={false} hot={false} />
                  <span className="font-mono text-[0.625rem] leading-none text-text-muted/50">SP{n}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Cable tray */}
          <div className="flex items-center gap-2 rounded-panel border border-border-hairline bg-bg-panel px-4 py-3">
            <span className="mr-1 shrink-0 font-mono text-[0.625rem] leading-tight tracking-[0.25em] text-text-muted">
              CABLE
              <br />
              TRAY
            </span>
            {CHANNELS.map((c) => {
              const used = patched.includes(c.id);
              return (
                <button
                  key={c.id}
                  ref={(el) => {
                    plugRefs.current[c.id] = el;
                  }}
                  onPointerDown={(e) => onPlugPointerDown(e, c.id)}
                  disabled={used}
                  aria-label={`Patch cable for ${c.label}${used ? " (already patched)" : ""}`}
                  title={used ? `${c.label} — patched` : `drag into ${c.port}`}
                  className={`flex w-[4.625rem] flex-col items-center gap-1 rounded-panel border border-transparent px-2 py-1.5 outline-none transition-opacity duration-200 ease-noc ${
                    used ? "opacity-25" : "cursor-grab touch-none hover:bg-bg-panel-raised active:cursor-grabbing"
                  }`}
                >
                  <PlugGlyph
                    className="h-6 w-9 transition-colors duration-150 ease-noc"
                    style={{ color: c.color }}
                  />
                  <span className="truncate font-mono text-[0.625rem] text-text-muted">{c.label}</span>
                </button>
              );
            })}
          </div>

          <button
            onClick={() => {
              setPatched([]);
              setPaths({});
            }}
            disabled={patched.length === 0}
            className="self-start rounded-panel border border-border-hairline bg-bg-panel px-3 py-1.5 font-mono text-xs text-text-muted transition-colors duration-150 ease-noc hover:border-accent-cyan-dim hover:text-accent-amber disabled:pointer-events-none disabled:opacity-40"
          >
            ⟲ reset panel
          </button>
        </section>
      </main>

      {/* Established cable runs */}
      <svg className="pointer-events-none absolute inset-0 z-20 h-full w-full" aria-hidden>
        {Object.entries(paths)
          .filter(([id]) => patched.includes(id))
          .map(([id, p]) => {
            const c = CHANNELS.find((ch) => ch.id === id)!;
            const sag = Math.max(p.y1, p.y2) + 90;
            return (
              <motion.path
                key={id}
                d={`M ${p.x1} ${p.y1} C ${p.x1} ${sag}, ${p.x2} ${sag + 30}, ${p.x2} ${p.y2}`}
                fill="none"
                stroke={c.color}
                strokeWidth="1.8"
                strokeLinecap="round"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 0.85 }}
                transition={{ duration: 0.45, ease: [0.4, 0, 0.2, 1] }}
              />
            );
          })}
      </svg>

      {/* Drag ghost */}
      <AnimatePresence>
        {dragging && dragChannel && (
          <div
            className="pointer-events-none fixed z-40"
            style={{ left: dragging.x, top: dragging.y, transform: "translate(-50%, -120%)" }}
            aria-hidden
          >
            <PlugGlyph
              className="h-7 w-11"
              style={{ color: dragChannel.color, filter: "drop-shadow(var(--glow-cyan-drop))" }}
            />
          </div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="absolute inset-x-0 bottom-0 z-30 flex h-7 shrink-0 items-center justify-between border-t border-border-hairline bg-bg-panel/80 px-4 font-mono text-[0.625rem] tracking-wider text-text-muted backdrop-blur-sm">
        <span>{allPatched ? "ALL UPLINKS ESTABLISHED — OPERATOR REACHABLE" : "PATCH TO ESTABLISH CARRIER · ESC DESKTOP"}</span>
        <span className="hidden sm:inline">BOUZNIKA · MA</span>
      </footer>
    </div>
  );
}
