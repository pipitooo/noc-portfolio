import { create } from "zustand";

export type ScreenId =
  | "boot"
  | "hub"
  | "terminal"
  | "topology"
  | "dashboard"
  | "patch-panel"
  | "ticket-queue";

export interface PacketOrigin {
  x: number;
  y: number;
}

interface ScreenState {
  screen: ScreenId;
  previous: ScreenId | null;
  packet: (PacketOrigin & { key: number }) | null;
  navigate: (to: ScreenId, origin?: PacketOrigin) => void;
  clearPacket: () => void;
}

export const useScreens = create<ScreenState>((set) => ({
  screen: "boot",
  previous: null,
  packet: null,
  navigate: (to, origin) =>
    set((state) => {
      if (state.screen === to) return state;
      return {
        previous: state.screen,
        screen: to,
        packet: {
          x: origin?.x ?? window.innerWidth / 2,
          y: origin?.y ?? window.innerHeight * 0.72,
          key: (state.packet?.key ?? 0) + 1,
        },
      };
    }),
  clearPacket: () => set({ packet: null }),
}));
