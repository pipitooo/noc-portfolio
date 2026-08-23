import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";
import { motion } from "motion/react";
import { useScreens } from "../state/screens";

/*
 * Packet-travel transition (02-DESIGN-SYSTEM.md): a glowing dot travels a
 * visible cable route from the interaction origin to the incoming screen's
 * landing zone over ~520ms ease-in-out; the cable trace fades behind it.
 * Reduced motion: no dot, no cable — screens crossfade only.
 */
export function PacketOverlay() {
  const packet = useScreens((s) => s.packet);
  const clearPacket = useScreens((s) => s.clearPacket);
  const reduced = useReducedMotion();
  const dotRef = useRef<HTMLDivElement>(null);
  const [arrived, setArrived] = useState(false);

  useEffect(() => {
    if (!packet) return;
    setArrived(false);
    if (reduced) {
      const t = setTimeout(clearPacket, 180);
      return () => clearTimeout(t);
    }

    const { x, y } = packet;
    const cx = window.innerWidth / 2;
    const cy = window.innerHeight * 0.42;
    const d = `M ${x} ${y} L ${x} ${cy} L ${cx} ${cy}`;

    const dot = dotRef.current;
    let anim: Animation | undefined;
    if (dot) {
      dot.style.offsetPath = `path("${d}")`;
      anim = dot.animate(
        [{ offsetDistance: "0%", opacity: 1 }, { offsetDistance: "92%", opacity: 1 }, { offsetDistance: "100%", opacity: 0.4 }],
        { duration: 520, easing: "cubic-bezier(0.4, 0, 0.2, 1)", fill: "forwards" },
      );
    }
    const tArrive = setTimeout(() => setArrived(true), 500);
    const tClear = setTimeout(clearPacket, 950);
    return () => {
      anim?.cancel();
      clearTimeout(tArrive);
      clearTimeout(tClear);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [packet?.key]);

  if (!packet || reduced) return null;

  const cx = window.innerWidth / 2;
  const cy = window.innerHeight * 0.42;
  const d = `M ${packet.x} ${packet.y} L ${packet.x} ${cy} L ${cx} ${cy}`;

  return (
    <div className="pointer-events-none fixed inset-0 z-50" aria-hidden>
      <svg className="absolute inset-0 h-full w-full">
        <path
          d={d}
          fill="none"
          stroke="var(--border-hairline)"
          strokeWidth="1"
          strokeDasharray="3 5"
          style={{
            opacity: arrived ? 0 : 0.7,
            transition: "opacity 300ms var(--ease-noc)",
          }}
        />
        <circle
          cx={cx}
          cy={cy}
          r="10"
          fill="none"
          stroke="var(--accent-cyan)"
          strokeWidth="1"
          style={{ opacity: arrived ? 0.8 : 0 }}
        />
        <circle
          cx={cx}
          cy={cy}
          r={arrived ? 18 : 6}
          fill="none"
          stroke="var(--accent-cyan-dim)"
          strokeWidth="1"
          style={{ opacity: arrived ? 0 : 0.6, transition: "all 400ms var(--ease-noc)" }}
        />
      </svg>
      <div
        ref={dotRef}
        className="absolute left-0 top-0 size-2 rounded-full bg-accent-cyan"
        style={{ boxShadow: "var(--glow-cyan-packet)", offsetRotate: "0deg" }}
      />
    </div>
  );
}

/* Shared screen shell motion: teardown fade-out, unfold fade-in. */
export function ScreenMotion({
  id,
  children,
}: {
  id: string;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      key={id}
      className="h-full w-full"
      initial={{ opacity: 0 }}
      animate={{
        opacity: 1,
        transition: { duration: 0.2, delay: 0.28, ease: [0.4, 0, 0.2, 1] },
      }}
      exit={{
        opacity: 0,
        filter: "brightness(0.55)",
        transition: { duration: 0.15, ease: [0.4, 0, 0.2, 1] },
      }}
    >
      {children}
    </motion.div>
  );
}
