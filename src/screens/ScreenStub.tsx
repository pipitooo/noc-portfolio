import { useScreens, type ScreenId } from "../state/screens";

interface ScreenStubProps {
  id: ScreenId;
  title: string;
}

export function ScreenStub({ id, title }: ScreenStubProps) {
  const navigate = useScreens((s) => s.navigate);
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-6 bg-bg-base">
      <p className="font-mono text-xs text-text-muted">
        [ {id} ] — stub screen, built in a later phase
      </p>
      <h1 className="text-3xl font-semibold text-text-primary">{title}</h1>
      <button
        onClick={() => navigate("hub")}
        className="rounded-panel border border-border-hairline bg-bg-panel px-4 py-2 font-mono text-sm text-accent-cyan transition-colors duration-150 ease-noc hover:border-accent-cyan-dim hover:bg-bg-panel-raised hover:text-accent-amber"
      >
        &larr; back to hub
      </button>
    </div>
  );
}
