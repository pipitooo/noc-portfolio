import { useNow } from "../hooks/useNow";
import { formatUptime } from "../state/session";

function Led({
  color,
  shadow,
  label,
  breathing = false,
}: {
  color: string;
  shadow: string;
  label: string;
  breathing?: boolean;
}) {
  return (
    <span
      title={label}
      className={`inline-block size-2 rounded-full ${breathing ? "led-breathe" : ""}`}
      style={{ backgroundColor: color, boxShadow: shadow }}
    />
  );
}

export function Taskbar() {
  const now = useNow();
  return (
    <footer className="absolute inset-x-0 bottom-0 z-20 flex h-12 items-center justify-between border-t border-border-hairline bg-bg-panel/95 px-4 backdrop-blur-sm">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5">
          <Led
            color="var(--accent-green-led)"
            shadow="var(--glow-green-led)"
            label="PWR — system online"
          />
          <Led
            color="var(--accent-cyan)"
            shadow="var(--glow-cyan-led)"
            label="LINK — remote session established"
          />
          <Led
            color="var(--accent-green-led)"
            shadow="var(--glow-green-led)"
            label="STATUS — available for work"
            breathing
          />
        </div>
        <span className="h-4 w-px bg-border-hairline" aria-hidden />
        <span className="font-mono text-xs text-text-muted">
          marouane@noc:~
        </span>
      </div>

      <div className="flex items-center gap-4 font-mono text-xs">
        <span className="hidden text-text-muted sm:inline" title="Session uptime">
          UP {formatUptime(now.getTime())}
        </span>
        <span className="hidden h-4 w-px bg-border-hairline sm:inline" aria-hidden />
        <span className="tabular-nums text-text-primary">
          {now.toLocaleTimeString("en-GB", { hour12: false })}
        </span>
        <span className="hidden font-sans text-[0.625rem] text-text-muted sm:inline">BOUZNIKA · MA</span>
      </div>
    </footer>
  );
}
