import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";
import { useScreens } from "../state/screens";
import { session } from "../state/session";

/*
 * Boot/POST sequence (01-VISION.md §2): fake BIOS/POST whose device
 * enumeration reveals the operator. Ends on a login prompt that unfolds
 * into the desktop. Skippable (any key / click); on repeat visits within
 * the same session the POST is skipped and the login stage plays instead.
 * Identity strings come verbatim from 03-CONTENT.md.
 */

interface Line {
  id: number;
  text: string;
  cls: string;
}

type Step =
  | { kind: "line"; text: string; cls?: string; typed?: boolean }
  | { kind: "memcount" };

const OK = "text-accent-green-led";

const POST: Step[] = [
  { kind: "line", text: "NOC-BIOS v2.6.1 — Remote Access Gateway", cls: "text-text-primary" },
  { kind: "line", text: "Copyright (c) 2026 Marouane Aabirrouche", cls: "text-text-muted" },
  { kind: "line", text: "" },
  { kind: "line", text: "CPU : SYSADMIN CORE ................. ONLINE", typed: true },
  { kind: "memcount" },
  { kind: "line", text: "" },
  { kind: "line", text: "Enumerating devices ...", typed: true },
  { kind: "line", text: "Detecting operator... Marouane Aabirrouche", cls: "text-accent-cyan", typed: true },
  { kind: "line", text: "  role ......... IT Infrastructure specialist — Réseaux & Systèmes", cls: "text-text-muted" },
  { kind: "line", text: "  education .... OFPPT · CMC Tanger — Specialized Technician, Networks & Systems", cls: "text-text-muted" },
  { kind: "line", text: "  location ..... Bouznika, Morocco", cls: "text-text-muted" },
  { kind: "line", text: "" },
  { kind: "line", text: "Detecting network interfaces ...", typed: true },
  { kind: "line", text: "  eth0   LINK UP — 1000FDX" },
  { kind: "line", text: "  wan0   LINK UP — Bouznika POP" },
  { kind: "line", text: "" },
  { kind: "line", text: "Mounting project nodes .......... [ 7/7 ] OK", cls: OK },
  { kind: "line", text: "Verifying credentials ........... [ 7/7 ] OK", cls: OK },
  { kind: "line", text: "" },
  { kind: "line", text: "Loading NOC environment ......... OK", cls: OK },
];

let nextId = 1;

export function BootScreen() {
  const navigate = useScreens((s) => s.navigate);
  const reduced = useReducedMotion() ?? false;
  const [lines, setLines] = useState<Line[]>([]);
  const skipRef = useRef(false);
  const doneRef = useRef(false);

  useEffect(() => {
    let cancelled = false;

    const sleep = (ms: number) =>
      new Promise<void>((r) => setTimeout(r, skipRef.current || reduced ? 0 : ms));

    const push = (text: string, cls = "") =>
      setLines((prev) => [...prev, { id: nextId++, text, cls }]);

    const updateLast = (fn: (l: Line) => Line) =>
      setLines((prev) => [...prev.slice(0, -1), fn(prev[prev.length - 1])]);

    async function typeLine(text: string, cls: string) {
      if (skipRef.current || reduced) {
        push(text, cls);
        return;
      }
      push("", cls);
      for (const ch of text) {
        if (cancelled) return;
        if (skipRef.current) {
          updateLast((l) => ({ ...l, text }));
          return;
        }
        updateLast((l) => ({ ...l, text: l.text + ch }));
        await sleep(22 + Math.random() * 10);
      }
      await sleep(80 + Math.random() * 70);
    }

    async function memCount() {
      const total = 32768;
      if (skipRef.current || reduced) {
        push(`MEM : ${total}K .................. ${"OK"}`, OK);
        return;
      }
      push(`MEM : 0K`, "");
      for (let v = 2048; v <= total; v += 2048) {
        if (cancelled) return;
        const filled = ".".repeat(Math.max(2, Math.round(18 * (v / total))));
        updateLast((l) => ({ ...l, text: `MEM : ${v}K ${filled}` }));
        await sleep(skipRef.current ? 0 : 14);
      }
      updateLast((l) => ({ ...l, text: `MEM : ${total}K ${"." .repeat(18)} OK`, cls: OK }));
      await sleep(120);
    }

    function finishToHub() {
      if (doneRef.current || cancelled) return;
      doneRef.current = true;
      session.bootedThisSession = true;
      navigate("hub");
    }

    async function run() {
      setLines([]);
      await sleep(350);

      if (!session.bootedThisSession) {
        for (const step of POST) {
          if (cancelled) return;
          if (step.kind === "memcount") {
            await memCount();
          } else if (step.typed) {
            await typeLine(step.text, step.cls ?? "");
          } else {
            push(step.text, step.cls ?? "");
            await sleep(60);
          }
          if (skipRef.current) await sleep(0);
        }
      } else {
        push("NOC-BIOS v2.6.1 — session already warm", "text-text-muted");
        await sleep(200);
      }

      // Login stage
      await typeLine("noc login: marouane", "text-text-primary");
      await typeLine("password: ••••••••••••", "text-text-primary");
      await sleep(250);
      push("ACCESS GRANTED — establishing remote session ...", "text-accent-green-led");
      await sleep(skipRef.current ? 150 : 900);
      finishToHub();
    }

    run();

    const onSkip = () => {
      skipRef.current = true;
    };
    window.addEventListener("keydown", onSkip);
    return () => {
      cancelled = true;
      window.removeEventListener("keydown", onSkip);
    };
  }, [navigate, reduced]);

  return (
    <div
      className="h-full w-full overflow-hidden bg-bg-void"
      onClick={() => {
        skipRef.current = true;
      }}
    >
      <div className="mx-auto flex h-full max-w-3xl flex-col justify-start gap-y-0 px-8 pt-10 font-mono text-sm leading-relaxed">
        {lines.map((l) => (
          <p key={l.id} className={`whitespace-pre-wrap ${l.cls}`}>
            {l.text}
            {l === lines[lines.length - 1] && (
              <span className="caret ml-0.5 inline-block h-[1em] w-[0.55em] translate-y-[0.15em] bg-accent-cyan" />
            )}
          </p>
        ))}
      </div>
      <p className="absolute bottom-5 right-6 font-mono text-xs text-text-muted caret-blink-slow">
        press any key to skip
      </p>
    </div>
  );
}
