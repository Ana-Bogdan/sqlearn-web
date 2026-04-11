"use client";

import { useEffect, useRef } from "react";

/**
 * Mouse-driven parallax host. Reads the cursor position relative to
 * its own bounding rect and exposes --mx / --my (range -1..1) on the
 * root element. Children with class "parallax-layer" pick these up
 * and translate by their --depth value. No-ops under reduced motion.
 */
export function TiltScene({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let raf = 0;
    let pendingX = 0;
    let pendingY = 0;

    const onMove = (e: PointerEvent) => {
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      pendingX = Math.max(-1, Math.min(1, (e.clientX - cx) / (rect.width / 2)));
      pendingY = Math.max(-1, Math.min(1, (e.clientY - cy) / (rect.height / 2)));
      if (!raf) {
        raf = requestAnimationFrame(() => {
          el.style.setProperty("--mx", pendingX.toFixed(3));
          el.style.setProperty("--my", pendingY.toFixed(3));
          raf = 0;
        });
      }
    };

    const onLeave = () => {
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
      el.style.setProperty("--mx", "0");
      el.style.setProperty("--my", "0");
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerleave", onLeave);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerleave", onLeave);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div ref={ref} className={`parallax-host ${className ?? ""}`}>
      {children}
    </div>
  );
}
