import { AnimatePresence, MotionConfig } from "motion/react";
import { useScreens, type ScreenId } from "./state/screens";
import { PacketOverlay, ScreenMotion } from "./components/PacketOverlay";
import { BootScreen } from "./screens/BootScreen";
import { DesktopHubScreen } from "./screens/DesktopHubScreen";
import { TerminalScreen } from "./screens/TerminalScreen";
import { TopologyScreen } from "./screens/TopologyScreen";
import { DashboardScreen } from "./screens/DashboardScreen";
import { PatchPanelScreen } from "./screens/PatchPanelScreen";
import { TicketQueueScreen } from "./screens/TicketQueueScreen";

const SCREENS: Record<ScreenId, () => React.ReactElement> = {
  boot: BootScreen,
  hub: DesktopHubScreen,
  terminal: TerminalScreen,
  topology: TopologyScreen,
  dashboard: DashboardScreen,
  "patch-panel": PatchPanelScreen,
  "ticket-queue": TicketQueueScreen,
};

export default function App() {
  const screen = useScreens((s) => s.screen);
  const Current = SCREENS[screen];

  return (
    <MotionConfig reducedMotion="user">
      <main className="h-full w-full overflow-hidden bg-bg-void">
        <AnimatePresence mode="wait">
          <ScreenMotion id={screen}>
            <Current />
          </ScreenMotion>
        </AnimatePresence>
        <PacketOverlay />
      </main>
    </MotionConfig>
  );
}
