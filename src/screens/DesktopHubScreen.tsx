import { useScreens, type ScreenId } from "../state/screens";
import {
  TerminalIcon,
  TopologyIcon,
  DashboardIcon,
  PatchPanelIcon,
  TicketQueueIcon,
} from "../components/icons/AppIcons";
import { Taskbar } from "../components/Taskbar";

const APPS: {
  id: ScreenId;
  label: string;
  Icon: (p: React.SVGProps<SVGSVGElement>) => React.ReactElement;
}[] = [
  { id: "terminal", label: "Terminal", Icon: TerminalIcon },
  { id: "topology", label: "Topology Map", Icon: TopologyIcon },
  { id: "dashboard", label: "Dashboard", Icon: DashboardIcon },
  { id: "patch-panel", label: "Patch Panel", Icon: PatchPanelIcon },
  { id: "ticket-queue", label: "Ticket Queue", Icon: TicketQueueIcon },
];

export function DesktopHubScreen() {
  const navigate = useScreens((s) => s.navigate);

  return (
    <div className="rack-grid relative h-full w-full overflow-hidden">
      {/* Icons ARE the nav — desktop shortcut column */}
      <div className="absolute left-4 top-4 flex flex-col gap-3 pb-16">
        {APPS.map(({ id, label, Icon }) => (
          <button
            key={id}
            onClick={(e) =>
              navigate(id, { x: e.clientX, y: e.clientY })
            }
            aria-label={`Open ${label}`}
            className="desk-icon group flex w-24 flex-col items-center gap-2 rounded-panel p-2 outline-none transition-colors duration-150 ease-noc hover:bg-bg-panel-raised/70 focus-visible:bg-bg-panel-raised/70 focus-visible:ring-1 focus-visible:ring-accent-cyan-dim"
          >
            <span className="icon-frame grid size-12 place-items-center rounded-panel border border-border-hairline bg-bg-panel text-text-muted">
              <Icon className="size-7" />
            </span>
            <span className="icon-label font-sans text-xs text-text-muted">
              {label}
            </span>
          </button>
        ))}
      </div>

      {/* Center watermark — quiet hostname stamp on the wallpaper */}
      <div className="pointer-events-none absolute inset-0 grid place-items-center" aria-hidden>
        <p className="select-none text-center">
          <span className="block font-mono text-5xl tracking-widest text-text-primary/[0.06]">
            NOC
          </span>
          <span className="mt-2 block font-mono text-xs tracking-[0.35em] text-text-muted/40">
            REMOTE OPERATIONS CENTER
          </span>
        </p>
      </div>

      <Taskbar />
    </div>
  );
}
