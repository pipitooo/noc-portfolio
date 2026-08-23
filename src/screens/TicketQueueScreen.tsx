/*
 * Ticket queue (01-VISION.md §7): NOC-flavored helpdesk view listing real
 * resolved fixes (03-CONTENT.md). Deliberately short — genuine entries
 * over filler. Staggered row reveal; ESC tears down to the hub.
 */

import { useEffect } from "react";
import { motion } from "motion/react";
import { useScreens } from "../state/screens";
import { TICKETS } from "../content/tickets";
import { StatusLed } from "../components/StatusLed";

export function TicketQueueScreen() {
  const navigate = useScreens((s) => s.navigate);

  // ESC tears the session down -> desktop hub
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") navigate("hub");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [navigate]);

  return (
    <div className="rack-grid relative flex h-full w-full flex-col overflow-hidden">
      {/* Status strip */}
      <header className="absolute inset-x-0 top-0 z-20 flex h-9 shrink-0 items-center justify-between border-b border-border-hairline bg-bg-panel/90 px-4 font-mono text-xs backdrop-blur-sm">
        <span className="text-text-muted">// TICKET QUEUE — SERVICE DESK</span>
        <span className="flex items-center gap-3">
          <span className="hidden items-center gap-1.5 font-mono text-accent-green-led md:flex">
            <StatusLed breathing />
            QUEUE DRAINED
          </span>
          <button
            onClick={() => navigate("hub")}
            className="rounded-panel border border-border-hairline bg-bg-void px-2.5 py-1 text-text-muted transition-colors duration-150 ease-noc hover:border-accent-cyan-dim hover:text-accent-amber"
          >
            ← hub
          </button>
        </span>
      </header>

      <main className="flex flex-1 flex-col items-center overflow-y-auto p-4 pt-14">
        <div className="flex w-full max-w-4xl flex-col gap-3">
          {/* Queue stats */}
          <div className="flex flex-wrap gap-2 font-mono text-xs">
            {[
              { label: "OPEN", value: "0", tone: "text-text-muted" },
              { label: "RESOLVED", value: String(TICKETS.length), tone: "text-accent-green-led" },
              { label: "SLA BREACHES", value: "0", tone: "text-text-muted" },
            ].map((s) => (
              <span
                key={s.label}
                className="rounded-panel border border-border-hairline bg-bg-panel px-2.5 py-1"
              >
                <span className="text-text-muted">{s.label} </span>
                <span className={s.tone}>{s.value}</span>
              </span>
            ))}
          </div>

          {/* Table head */}
          <div className="hidden grid-cols-[5.5rem_1fr_9rem_10rem] gap-4 border-b border-border-hairline px-3 pb-1.5 font-mono text-[0.625rem] tracking-[0.25em] text-text-muted sm:grid">
            <span>TICKET</span>
            <span>SUBJECT</span>
            <span>STATUS</span>
            <span className="text-right">CATEGORY</span>
          </div>

          {/* Rows */}
          <ol role="list" aria-label="Resolved tickets">
            {TICKETS.map((t, i) => (
              <motion.li
                key={t.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.12 + i * 0.09, duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
                className="group rounded-panel border border-border-hairline bg-bg-panel transition-colors duration-150 ease-noc hover:border-accent-cyan-dim hover:bg-bg-panel-raised"
              >
                <div className="grid grid-cols-1 gap-x-4 gap-y-2 px-3 py-3 sm:grid-cols-[5.5rem_1fr_9rem_10rem] sm:items-baseline">
                  <span className="font-mono text-xs text-accent-cyan">{t.id}</span>
                  <span className="min-w-0">
                    <p className="text-sm font-medium text-text-primary">{t.subject}</p>
                    <p className="mt-1 text-sm leading-relaxed text-text-muted">{t.resolution}</p>
                  </span>
                  <span>
                    <span className="inline-flex items-center gap-1.5 rounded-panel border border-border-hairline bg-bg-void px-2 py-0.5 font-mono text-[0.625rem] tracking-wider text-accent-green-led">
                      <StatusLed soft />
                      RESOLVED
                    </span>
                  </span>
                  <span className="text-right font-mono text-[0.625rem] tracking-wider text-text-muted">
                    {t.category}
                  </span>
                </div>
              </motion.li>
            ))}
          </ol>

          <p className="mt-1 pl-1 font-mono text-[0.625rem] tracking-wider text-text-muted/70">
            // queue holds confirmed fixes only — new tickets land here as work completes
          </p>
        </div>
      </main>

      <footer className="absolute inset-x-0 bottom-0 z-20 flex h-7 shrink-0 items-center justify-between border-t border-border-hairline bg-bg-panel/80 px-4 font-mono text-[0.625rem] tracking-wider text-text-muted backdrop-blur-sm">
        <span>HELPDESK V1.2 · ESC DESKTOP</span>
        <span className="hidden sm:inline">BOUZNIKA · MA</span>
      </footer>
    </div>
  );
}
