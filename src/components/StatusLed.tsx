/*
 * Link-light indicator (02-DESIGN-SYSTEM.md component primitives):
 * green LED = online/good, glow only when active. Shared by every
 * screen's status strip so the glow stays token-driven in one place.
 */

export function StatusLed({
  breathing = false,
  soft = false,
  active = true,
  label,
  className = "",
}: {
  breathing?: boolean;
  soft?: boolean;
  active?: boolean;
  label?: string;
  className?: string;
}) {
  return (
    <span
      title={label}
      className={`inline-block size-1.5 shrink-0 rounded-full ${breathing && active ? "led-breathe" : ""} ${className}`}
      style={{
        backgroundColor: active ? "var(--accent-green-led)" : "var(--accent-cyan-dim)",
        boxShadow: active ? (soft ? "var(--glow-green-led-soft)" : "var(--glow-green-led)") : "none",
      }}
    />
  );
}
