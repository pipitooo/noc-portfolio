import { motion } from "motion/react";
import type { ProjectNode } from "../../content/projects";
import { StatusLed } from "../StatusLed";

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="mb-2 font-mono text-xs tracking-[0.2em] text-accent-cyan uppercase">
      {children}
    </h3>
  );
}

function Bullets({ items }: { items: string[] }) {
  return (
    <ul className="space-y-1.5">
      {items.map((b, i) => (
        <li key={i} className="flex gap-2 text-sm leading-relaxed text-text-muted">
          <span className="mt-px shrink-0 font-mono text-xs text-accent-cyan-dim" aria-hidden>
            ▸
          </span>
          <span>{b}</span>
        </li>
      ))}
    </ul>
  );
}

function StackChips({ stack }: { stack: string[] }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {stack.map((s) => (
        <span
          key={s}
          className="rounded-panel border border-border-hairline bg-bg-void px-2 py-0.5 font-mono text-xs text-text-muted"
        >
          {s}
        </span>
      ))}
    </div>
  );
}

export function ConsolePanel({
  node,
  onClose,
}: {
  node: ProjectNode;
  onClose: () => void;
}) {
  return (
    <motion.aside
      initial={{ x: 48, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 48, opacity: 0 }}
      transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
      className="absolute inset-y-0 right-0 z-20 flex w-full flex-col border-l border-border-hairline bg-bg-panel sm:w-[35rem]"
      role="dialog"
      aria-label={`${node.name} console`}
    >
      {/* Title bar */}
      <header className="flex items-center justify-between gap-3 border-b border-border-hairline px-5 py-3">
        <div className="min-w-0">
          <p className="font-mono text-[0.625rem] tracking-[0.25em] text-text-muted">
            {node.code} // CONSOLE
          </p>
          <h2 className="truncate font-mono text-sm text-text-primary">{node.name}</h2>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <span className="flex items-center gap-1.5 font-mono text-[0.625rem] text-accent-green-led">
            <StatusLed breathing />
            ONLINE
          </span>
          <button
            onClick={onClose}
            aria-label="Close console"
            className="rounded-panel border border-border-hairline bg-bg-void px-2.5 py-1 font-mono text-xs text-text-muted transition-colors duration-150 ease-noc hover:border-accent-cyan-dim hover:text-accent-amber"
          >
            ✕ esc
          </button>
        </div>
      </header>

      {/* Body */}
      <div className="flex-1 space-y-6 overflow-y-auto px-5 py-5">
        {node.warn && (
          <p
            className="rounded-panel border px-3 py-2 font-mono text-xs"
            style={{ borderColor: "var(--accent-amber)", color: "var(--accent-amber)" }}
          >
            ⚠ SIMULATED THREAT ENVIRONMENT — isolated educational lab only
          </p>
        )}

        <section>
          <SectionTitle>Summary</SectionTitle>
          <p className="text-sm leading-relaxed text-text-primary">{node.summary}</p>
          {node.detail.map((d, i) => (
            <p key={i} className="mt-2 text-sm leading-relaxed text-text-muted">
              {d}
            </p>
          ))}
        </section>

        <section>
          <SectionTitle>Stack</SectionTitle>
          <StackChips stack={node.stack} />
        </section>

        {node.subs && (
          <section>
            <SectionTitle>Sub-systems</SectionTitle>
            <ol className="space-y-3">
              {node.subs.map((s, i) => (
                <li key={s.name} className="border-l border-border-hairline pl-3">
                  <p className="font-mono text-sm text-text-primary">
                    <span className="mr-2 text-accent-cyan-dim">{String(i + 1).padStart(2, "0")}</span>
                    {s.name}
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-text-muted">{s.desc}</p>
                </li>
              ))}
            </ol>
          </section>
        )}

        {node.sections?.map((sec) => (
          <section key={sec.title}>
            <SectionTitle>{sec.title}</SectionTitle>
            {sec.bullets && <Bullets items={sec.bullets} />}
            {sec.pre && (
              <pre className="overflow-x-auto rounded-panel border border-border-hairline bg-bg-void p-3 font-mono text-xs leading-relaxed text-accent-cyan">
                {sec.pre}
              </pre>
            )}
          </section>
        ))}

        {node.skills && (
          <section className="border-t border-border-hairline pt-5">
            <div className="mb-4 flex items-center gap-3">
              <h2 className="font-mono text-sm tracking-[0.2em] text-text-primary uppercase">
                Operator Skill Matrix
              </h2>
              <span className="h-px flex-1 bg-border-hairline" aria-hidden />
            </div>
            <div className="space-y-5">
              {node.skills.map((cat) => (
                <div key={cat.name}>
                  <SectionTitle>{cat.name}</SectionTitle>
                  <p className="text-sm leading-relaxed text-text-muted">
                    {cat.items.join(" · ")}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Footer / report link */}
      {node.pdfUrl && (
        <footer className="border-t border-border-hairline px-5 py-3">
          <a
            href={node.pdfUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-panel border border-border-hairline bg-bg-void px-3 py-1.5 font-mono text-xs text-accent-cyan transition-colors duration-150 ease-noc hover:border-accent-cyan-dim hover:text-accent-amber"
          >
            ▸ open full report (pdf)
          </a>
        </footer>
      )}
    </motion.aside>
  );
}
