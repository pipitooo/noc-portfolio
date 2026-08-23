import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence } from "motion/react";
import { useScreens } from "../state/screens";
import {
  PROJECTS,
  LINKS,
  CLOUD,
  CLOUD_LINKS,
  type GlyphKind,
  type ProjectNode,
} from "../content/projects";
import { GLYPHS } from "../components/topology/glyph-map";
import { CloudGlyph, SwitchGlyph } from "../components/topology/glyphs";
import { ConsolePanel } from "../components/topology/ConsolePanel";
import { StatusLed } from "../components/StatusLed";

const W = 1280;
const H = 720;
const VIEW = `0 0 ${W} ${H}`;

type TrayKind = Extract<GlyphKind, "gateway" | "server" | "firewall" | "ap"> | "switch" | "cloud";

interface DecorDevice {
  key: number;
  kind: TrayKind;
  x: number;
  y: number;
}

const TRAY_ITEMS: { kind: TrayKind; label: string }[] = [
  { kind: "gateway", label: "router" },
  { kind: "switch", label: "switch" },
  { kind: "server", label: "server" },
  { kind: "firewall", label: "firewall" },
  { kind: "ap", label: "access point" },
  { kind: "cloud", label: "cloud" },
];

const NODE_POS: Record<string, { x: number; y: number }> = Object.fromEntries(
  PROJECTS.map((p) => [p.id, { x: p.x, y: p.y }]),
);

export function TopologyScreen() {
  const navigate = useScreens((s) => s.navigate);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [connecting, setConnecting] = useState<ProjectNode | null>(null);
  const [connectMsg, setConnectMsg] = useState("");
  const [decor, setDecor] = useState<DecorDevice[]>([]);
  const wrapRef = useRef<HTMLDivElement>(null);
  const timers = useRef<number[]>([]);
  const decorKey = useRef(0);

  const clearTimers = () => {
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];
  };

  const openNode = useCallback((node: ProjectNode) => {
    if (connecting) return;
    clearTimers();
    setSelectedId(null);
    setConnecting(node);
    setConnectMsg(`> ssh operator@${node.code.toLowerCase().replace("-", "")} --console`);
    timers.current.push(
      window.setTimeout(() => setConnectMsg((m) => m + "\n> establishing connection ...."), 380),
    );
    timers.current.push(
      window.setTimeout(
        () => setConnectMsg((m) => m.replace("....", ".... OK")),
        700,
      ),
    );
    timers.current.push(
      window.setTimeout(() => {
        setSelectedId(node.id);
        setConnecting(null);
      }, 900),
    );
  }, [connecting]);

  useEffect(() => () => clearTimers(), []);

  // ESC: close an open console first; with none open, tear down -> hub
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (selectedId || connecting) {
        setSelectedId(null);
      } else {
        navigate("hub");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [navigate, selectedId, connecting]);

  const toSvgPoint = (clientX: number, clientY: number) => {
    const rect = wrapRef.current?.getBoundingClientRect();
    if (!rect) return null;
    const scale = Math.min(rect.width / W, rect.height / H);
    const ox = (rect.width - W * scale) / 2;
    const oy = (rect.height - H * scale) / 2;
    return {
      x: Math.min(W - 20, Math.max(20, (clientX - rect.left - ox) / scale)),
      y: Math.min(H - 20, Math.max(20, (clientY - rect.top - oy) / scale)),
    };
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const kind = e.dataTransfer.getData("text/plain") as TrayKind;
    if (!TRAY_ITEMS.some((t) => t.kind === kind)) return;
    const pt = toSvgPoint(e.clientX, e.clientY);
    if (!pt) return;
    decorKey.current += 1;
    setDecor((d) => [...d, { key: decorKey.current, kind, ...pt }]);
  };

  const selected = PROJECTS.find((p) => p.id === selectedId) ?? null;
  const focus = connecting ?? selected;
  const zoomed = Boolean(focus);

  return (
    <div className="relative h-full w-full overflow-hidden bg-bg-base">
      {/* Status strip */}
      <header className="absolute inset-x-0 top-0 z-20 flex h-9 items-center justify-between border-b border-border-hairline bg-bg-panel/90 px-4 font-mono text-xs backdrop-blur-sm">
        <span className="text-text-muted">// TOPOLOGY — PROJECT MAP</span>
        <span className="flex items-center gap-3">
          <span className="hidden text-text-muted md:inline">
            click a node · drag tray devices onto the canvas
          </span>
          <span className="flex items-center gap-1.5 text-accent-green-led">
            <StatusLed />
            NODES 7/7 ONLINE
          </span>
          <button
            onClick={() => navigate("hub")}
            className="rounded-panel border border-border-hairline bg-bg-void px-2.5 py-1 text-text-muted transition-colors duration-150 ease-noc hover:border-accent-cyan-dim hover:text-accent-amber"
          >
            ← hub
          </button>
        </span>
      </header>

      {/* Canvas */}
      <div
        ref={wrapRef}
        className="rack-grid absolute inset-0"
        onDragOver={(e) => {
          e.preventDefault();
          e.dataTransfer.dropEffect = "copy";
        }}
        onDrop={onDrop}
      >
        <div
          className="absolute inset-0"
          style={{
            transformOrigin: focus
              ? `${(focus.x / W) * 100}% ${(focus.y / H) * 100}%`
              : "center",
            transform: zoomed ? "scale(1.14)" : "scale(1)",
            transition: "transform 600ms var(--ease-noc)",
          }}
        >
          <svg
            viewBox={VIEW}
            preserveAspectRatio="xMidYMid meet"
            className="h-full w-full"
            role="img"
            aria-label="Network topology of seven projects"
          >
            {/* Links */}
            {LINKS.map(([a, b], i) => {
              const p1 = NODE_POS[a];
              const p2 = NODE_POS[b];
              const dx = p2.x - p1.x;
              const dy = p2.y - p1.y;
              const len = Math.hypot(dx, dy) || 1;
              const ux = dx / len;
              const uy = dy / len;
              const off = 34;
              return (
                <g key={`${a}-${b}`}>
                  <line
                    x1={p1.x + ux * off}
                    y1={p1.y + uy * off}
                    x2={p2.x - ux * off}
                    y2={p2.y - uy * off}
                    stroke="var(--border-hairline)"
                    strokeWidth="1.6"
                  />
                  <line
                    x1={p1.x + ux * off}
                    y1={p1.y + uy * off}
                    x2={p2.x - ux * off}
                    y2={p2.y - uy * off}
                    stroke="var(--accent-cyan-dim)"
                    strokeWidth="1.4"
                    strokeDasharray="2 10"
                    className="link-flow"
                    style={{ animationDelay: `${i * -0.45}s` }}
                  />
                  <circle
                    cx={p1.x + ux * (off - 6)}
                    cy={p1.y + uy * (off - 6)}
                    r="2.2"
                    fill="var(--accent-green-led)"
                    className="led-breathe"
                    style={{ animationDelay: `${(i % 4) * 0.6}s` }}
                  />
                  <circle
                    cx={p2.x - ux * (off - 6)}
                    cy={p2.y - uy * (off - 6)}
                    r="2.2"
                    fill="var(--accent-green-led)"
                    className="led-breathe"
                    style={{ animationDelay: `${(i % 4) * 0.6 + 0.3}s` }}
                  />
                </g>
              );
            })}
            {CLOUD_LINKS.map(([a]) => {
              const p1 = NODE_POS[a];
              return (
                <line
                  key={`c-${a}`}
                  x1={p1.x}
                  y1={p1.y}
                  x2={CLOUD.x}
                  y2={CLOUD.y}
                  stroke="var(--border-hairline)"
                  strokeWidth="1.6"
                  strokeDasharray="5 4"
                />
              );
            })}

            {/* Decorative placed devices (set dressing) */}
            {decor.map((d) => {
              const G =
                d.kind === "switch"
                  ? SwitchGlyph
                  : d.kind === "cloud"
                    ? CloudGlyph
                    : GLYPHS[d.kind as GlyphKind];
              return (
                <g key={d.key} transform={`translate(${d.x - 28},${d.y - 23})`} opacity="0.55" pointerEvents="none">
                  <G x={0} y={0} width={56} height={46.7} />
                </g>
              );
            })}

            {/* Internet cloud anchor */}
            <g className="text-text-muted" pointerEvents="none">
              <CloudGlyph x={CLOUD.x - 27} y={CLOUD.y - 22.5} width={54} height={45} />
              <text
                x={CLOUD.x}
                y={CLOUD.y + 36}
                textAnchor="middle"
                fontSize="10"
                fontFamily="var(--font-mono)"
                fill="var(--text-muted)"
                letterSpacing="2"
              >
                INTERNET
              </text>
            </g>

            {/* Project nodes */}
            {PROJECTS.map((n) => {
              const G = GLYPHS[n.glyph];
              const isActive = selectedId === n.id || connecting?.id === n.id;
              const dimmed = zoomed && !isActive;
              return (
                <g
                  key={n.id}
                  transform={`translate(${n.x - 32},${n.y - 30})`}
                  className="cursor-pointer"
                  style={{
                    color: isActive
                      ? "var(--accent-cyan)"
                      : n.warn
                        ? "var(--accent-amber)"
                        : "var(--text-primary)",
                    opacity: dimmed ? 0.3 : 1,
                    transition: "opacity 300ms var(--ease-noc), color 150ms",
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    openNode(n);
                  }}
                >
                  <rect x="-6" y="-6" width="76" height="86" fill="transparent" />
                  {(isActive || n.warn) && (
                    <rect
                      x="1"
                      y="1"
                      width="62"
                      height="52"
                      rx="5"
                      fill="none"
                      strokeWidth="1.2"
                      strokeDasharray={n.warn && !isActive ? "4 3" : undefined}
                      stroke={
                        isActive
                          ? "var(--accent-cyan)"
                          : "var(--accent-amber)"
                      }
                      opacity={isActive ? 0.9 : 0.55}
                    />
                  )}
                  <G x={4} y={0} width={56} height={46.7} />
                  <text
                    x="32"
                    y="60"
                    textAnchor="middle"
                    fontSize="11"
                    fontFamily="var(--font-mono)"
                    fill="var(--text-primary)"
                    style={{ pointerEvents: "none" }}
                  >
                    {n.code}
                  </text>
                  <text
                    x="32"
                    y="73"
                    textAnchor="middle"
                    fontSize="8"
                    fontFamily="var(--font-sans)"
                    letterSpacing="1.5"
                    fill="var(--text-muted)"
                    style={{ pointerEvents: "none" }}
                  >
                    {n.typeLabel}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* Connecting readout */}
      <AnimatePresence>
        {connecting && (
          <div className="pointer-events-none absolute left-1/2 top-14 z-30 -translate-x-1/2">
            <pre className="whitespace-pre rounded-panel border border-border-hairline bg-bg-void/95 px-4 py-2 font-mono text-xs leading-relaxed text-accent-cyan">
              {connectMsg}
            </pre>
          </div>
        )}
      </AnimatePresence>

      {/* Console detail view — ends above the device tray so the panel
          footer (report link) stays visible */}
      <AnimatePresence>
        {selected && (
          <div key="console-layer" className="absolute inset-x-0 top-0 bottom-[4.75rem] z-20">
            <button
              key="backdrop"
              aria-label="Close console"
              className="absolute inset-0 z-10 cursor-default"
              onClick={() => setSelectedId(null)}
            />
            <ConsolePanel
              key="panel"
              node={selected}
              onClose={() => setSelectedId(null)}
            />
          </div>
        )}
      </AnimatePresence>

      {/* Device tray (Packet Tracer-style, decorative placement) */}
      <footer className="absolute inset-x-0 bottom-0 z-20 flex h-[4.75rem] items-center gap-1.5 border-t border-border-hairline bg-bg-panel/95 px-4 backdrop-blur-sm">
        <span className="mr-3 shrink-0 font-mono text-[0.625rem] tracking-[0.25em] text-text-muted">
          DEVICE
          <br />
          TRAY
        </span>
        {TRAY_ITEMS.map(({ kind, label }) => {
          const G =
            kind === "switch"
              ? SwitchGlyph
              : kind === "cloud"
                ? CloudGlyph
                : GLYPHS[kind as GlyphKind];
          return (
            <button
              key={kind}
              draggable
              onDragStart={(e) => {
                e.dataTransfer.setData("text/plain", kind);
                e.dataTransfer.effectAllowed = "copy";
              }}
              className="group flex w-[4.625rem] cursor-grab flex-col items-center gap-1 rounded-panel border border-transparent px-2 py-1.5 outline-none transition-colors duration-150 ease-noc hover:border-accent-cyan-dim hover:bg-bg-panel-raised focus-visible:border-accent-cyan-dim active:cursor-grabbing"
              title={`drag onto canvas — ${label}`}
            >
              <G className="size-7 text-text-muted transition-colors duration-150 ease-noc group-hover:text-accent-cyan" />
              <span className="truncate font-mono text-[0.625rem] text-text-muted">{label}</span>
            </button>
          );
        })}
      </footer>
    </div>
  );
}
