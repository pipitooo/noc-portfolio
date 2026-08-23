import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";
import { useScreens } from "../state/screens";
import { formatUptime } from "../state/session";
import { OPERATOR, TERMINAL_FILES } from "../content/resume";
import { StatusLed } from "../components/StatusLed";

/*
 * Operator shell (01-VISION.md §3): a REAL command parser — help, whoami,
 * ls, cat <file>, clear + plausible not-found handling. Output streams with
 * the design-system typewriter (speed adapts to output size; Enter flushes;
 * prefers-reduced-motion prints instantly). ↑/↓ cycles command history.
 * File contents come verbatim from 03-CONTENT.md via content/resume.ts.
 */

interface TermLine {
  id: number;
  text: string;
  cls: string;
  echo?: string;
}

type OutLine = [text: string, cls?: string];

const CLS = {
  primary: "text-text-primary",
  muted: "text-text-muted",
  cyan: "text-accent-cyan",
  green: "text-accent-green-led",
  red: "text-accent-red",
} as const;

let nextId = 1;

function execute(raw: string): { lines: OutLine[]; action?: "clear" | "exit" } {
  const tokens = raw.trim().split(/\s+/);
  const cmd = (tokens[0] ?? "").toLowerCase();
  const arg = tokens[1];
  const rest = raw.trim().slice(cmd.length).trim();

  switch (cmd) {
    case "":
      return { lines: [] };

    case "help":
      return {
        lines: [
          ["NOC shell — available commands", CLS.cyan],
          ["", ""],
          ["  help                 show this list", CLS.primary],
          ["  whoami               operator identity", CLS.primary],
          ["  ls                   list files in ~/operator", CLS.primary],
          ["  cat <file>           read a file — about · experience · education · contact", CLS.primary],
          ["  clear                clear the terminal   (also: Ctrl+L)", CLS.primary],
          ["  uptime               session uptime", CLS.primary],
          ["  date                 local time — Bouznika, MA", CLS.primary],
          ["  exit                 close session, return to desktop", CLS.primary],
          ["", ""],
          ["tip: ↑ / ↓ cycle command history · Enter flushes streaming output", CLS.muted],
        ],
      };

    case "whoami":
      return {
        lines: [
          [OPERATOR.name, CLS.primary],
          [OPERATOR.role, CLS.cyan],
          [`${OPERATOR.location} · ${OPERATOR.languages.join(" · ")}`, CLS.muted],
        ],
      };

    case "ls": {
      const names = Object.keys(TERMINAL_FILES);
      return {
        lines: [
          [names.join("   "), CLS.cyan],
          ["4 files · run `cat <file>` to read", CLS.muted],
        ],
      };
    }

    case "cat": {
      if (!arg) return { lines: [["cat: missing operand — try `cat about.txt`", CLS.red]] };
      const file = TERMINAL_FILES[arg];
      if (!file) {
        return { lines: [[`cat: ${rest}: No such file or directory`, CLS.red]] };
      }
      return { lines: file.map((t) => [t, CLS.primary]) };
    }

    case "clear":
      return { lines: [], action: "clear" };

    case "uptime":
      return {
        lines: [
          [
            `up ${formatUptime(Date.now())},  session active — load average: 0.08, 0.05, 0.02`,
            CLS.primary,
          ],
        ],
      };

    case "date":
      return {
        lines: [
          [
            new Date().toLocaleString("en-GB", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
              hour12: false,
              timeZone: "Africa/Casablanca",
            }) + " — West Africa Time",
            CLS.primary,
          ],
        ],
      };

    case "exit":
    case "logout":
    case "quit":
      return { lines: [["closing session ...", CLS.green]], action: "exit" };

    default:
      return {
        lines: [
          [`noc: ${cmd}: command not found`, CLS.red],
          ["type `help` to list available commands", CLS.muted],
        ],
      };
  }
}

export function TerminalScreen() {
  const navigate = useScreens((s) => s.navigate);
  const reduced = useReducedMotion();
  const [lines, setLines] = useState<TermLine[]>([]);
  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const busyRef = useRef(false);
  const skipRef = useRef(false);
  const cancelledRef = useRef(false);
  const historyRef = useRef<string[]>([]);
  const histIdxRef = useRef(-1);

  useEffect(() => {
    // StrictMode simulates mount -> cleanup -> mount; the ref object
    // survives, so reset the flag on (re)mount, not just at definition.
    cancelledRef.current = false;
    return () => {
      cancelledRef.current = true;
    };
  }, []);

  // ESC tears the session down -> desktop hub
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") navigate("hub");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [navigate]);

  // Welcome MOTD on open
  useEffect(() => {
    const motd = (text: string, cls: string) => {
      const id = nextId++;
      setLines((prev) => [...prev, { id, text, cls }]);
    };
    const t1 = setTimeout(() => motd("NOC shell v2.6 — remote session established", CLS.cyan), 250);
    const t2 = setTimeout(
      () => motd("type `help` to list commands", CLS.muted),
      reduced ? 260 : 480,
    );
    inputRef.current?.focus();
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keep view pinned to the bottom as output streams
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [lines]);

  function sleep(ms: number) {
    return new Promise<void>((r) => setTimeout(r, ms));
  }

  async function streamOutput(out: OutLine[]) {
    const totalChars = out.reduce((n, [t]) => n + t.length, 0);
    // Adaptive typewriter speed: short answers keep the boot-style cadence,
    // long `cat` files stream fast enough to stay readable (02-DESIGN-SYSTEM).
    const perChar =
      reduced || totalChars === 0
        ? 0
        : Math.min(28, Math.max(3, Math.round(2400 / Math.max(1, totalChars))));
    const linePause = perChar === 0 ? 0 : perChar > 10 ? 110 : 26;

    for (const [text, cls = CLS.primary] of out) {
      if (cancelledRef.current) return;
      const rowId = nextId++;
      setLines((prev) => [...prev, { id: rowId, text: "", cls }]);
      if (skipRef.current || perChar === 0) {
        setLines((prev) => [...prev.slice(0, -1), { ...prev[prev.length - 1], text }]);
      } else {
        for (const ch of text) {
          if (cancelledRef.current || skipRef.current) {
            setLines((prev) => [...prev.slice(0, -1), { ...prev[prev.length - 1], text }]);
            break;
          }
          setLines((prev) => {
            const last = prev[prev.length - 1];
            return [...prev.slice(0, -1), { ...last, text: last.text + ch }];
          });
          await sleep(perChar);
        }
        await sleep(linePause);
      }
    }
  }

  function pushEcho(raw: string) {
    const id = nextId++;
    setLines((prev) => [...prev, { id, text: "", cls: "", echo: raw }]);
  }

  async function submit() {
    const raw = input;
    setInput("");

    if (busyRef.current) {
      skipRef.current = true; // flush the in-flight stream instead
      return;
    }

    const trimmed = raw.trim();
    if (trimmed && historyRef.current[historyRef.current.length - 1] !== trimmed) {
      historyRef.current.push(trimmed);
    }
    histIdxRef.current = -1;

    busyRef.current = true;
    skipRef.current = false;
    pushEcho(raw);

    const { lines: out, action } = execute(raw);

    if (action === "clear") {
      setLines([]);
    } else {
      await streamOutput(out);
    }

    busyRef.current = false;
    skipRef.current = false;

    if (action === "exit" && !cancelledRef.current) {
      window.setTimeout(() => navigate("hub"), 420);
    }
    inputRef.current?.focus();
  }

  const onInputKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowUp" || e.key === "ArrowDown") {
      e.preventDefault();
      const h = historyRef.current;
      if (h.length === 0) return;
      if (e.key === "ArrowUp") {
        histIdxRef.current =
          histIdxRef.current === -1 ? h.length - 1 : Math.max(0, histIdxRef.current - 1);
      } else if (histIdxRef.current !== -1) {
        histIdxRef.current += 1;
        if (histIdxRef.current >= h.length) histIdxRef.current = -1;
      }
      setInput(histIdxRef.current === -1 ? "" : h[histIdxRef.current]);
      return;
    }
    if (e.ctrlKey && (e.key === "l" || e.key === "L")) {
      e.preventDefault();
      if (!busyRef.current) setLines([]);
      return;
    }
    if (e.ctrlKey && (e.key === "c" || e.key === "C")) {
      if (busyRef.current) {
        skipRef.current = true;
      } else {
        const id = nextId++;
        setLines((prev) => [...prev, { id, text: "^C", cls: CLS.muted }]);
        setInput("");
      }
    }
  };

  return (
    <div
      className="relative flex h-full w-full flex-col bg-bg-void"
      onClick={() => inputRef.current?.focus()}
    >
      {/* Status strip */}
      <header className="flex h-9 shrink-0 items-center justify-between border-b border-border-hairline bg-bg-panel/90 px-4 font-mono text-xs backdrop-blur-sm">
        <span className="text-text-muted">// TERMINAL — OPERATOR SHELL</span>
        <span className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-accent-green-led">
            <StatusLed breathing />
            TTY0
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate("hub");
            }}
            className="rounded-panel border border-border-hairline bg-bg-void px-2.5 py-1 text-text-muted transition-colors duration-150 ease-noc hover:border-accent-cyan-dim hover:text-accent-amber"
          >
            ← hub
          </button>
        </span>
      </header>

      {/* Output */}
      <div
        ref={scrollRef}
        className="rack-grid flex-1 overflow-y-auto px-5 py-4 font-mono text-sm leading-relaxed"
        role="log"
        aria-label="Terminal output"
      >
        <div className="mx-auto max-w-4xl">
          {lines.map((l) =>
            l.echo !== undefined ? (
              <p key={l.id} className="whitespace-pre-wrap">
                <span className="text-accent-cyan">marouane@noc</span>
                <span className="text-text-muted">:~$ </span>
                <span className="text-text-primary">{l.echo}</span>
              </p>
            ) : (
              <p key={l.id} className={`whitespace-pre-wrap ${l.cls}`}>
                {l.text}
              </p>
            ),
          )}

          {/* Input row: visible text mirrors state; the native input floats
              above it invisibly to capture keys */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void submit();
            }}
            className="mt-1 flex"
          >
            <label htmlFor="noc-term-input" className="shrink-0 select-none whitespace-pre">
              <span className="text-accent-cyan">marouane@noc</span>
              <span className="text-text-muted">:~$&nbsp;</span>
            </label>
            <span className="relative min-w-0 flex-1 whitespace-pre">
              <span className="whitespace-pre text-text-primary">{input}</span>
              <span
                className="caret absolute top-[0.18em] h-[1.05em] w-[0.6em] bg-accent-cyan"
                style={{ left: `${input.length}ch` }}
                aria-hidden
              />
              <input
                id="noc-term-input"
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={onInputKey}
                autoComplete="off"
                autoCapitalize="off"
                spellCheck={false}
                aria-label="Terminal input"
                className="absolute inset-0 w-full bg-transparent text-transparent caret-transparent outline-none"
              />
            </span>
          </form>
        </div>
      </div>

      <footer className="flex h-7 shrink-0 items-center justify-between border-t border-border-hairline bg-bg-panel/80 px-4 font-mono text-[0.625rem] tracking-wider text-text-muted backdrop-blur-sm">
        <span>ENTER exec · CTRL+C interrupt · CTRL+L clear · ESC desktop</span>
        <span className="hidden sm:inline">{OPERATOR.location.toUpperCase()}</span>
      </footer>
    </div>
  );
}
