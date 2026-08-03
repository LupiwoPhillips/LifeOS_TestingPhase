import { useEffect, useRef, useState } from "react";

/**
 * Smoothly animates a number from its previous value to `target` whenever
 * `target` changes. Used to make the Life Score feel alive instead of
 * jumping instantly on every check-in / habit / journal update.
 */
export function useAnimatedNumber(target, duration = 700) {
  const [value, setValue] = useState(target);
  const fromRef = useRef(target);
  const rafRef = useRef(null);

  useEffect(() => {
    const from = fromRef.current;
    const to = target;

    if (from === to) return;

    const start = performance.now();

    function tick(now) {
      const progress = Math.min(1, (now - start) / duration);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(from + (to - from) * eased));

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        fromRef.current = to;
      }
    }

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [target, duration]);

  return value;
}
