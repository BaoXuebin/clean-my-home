import { useEffect, useRef, useState } from 'react';

/** Animate a number towards `target` with an ease-out curve (rAF). Restarts
 *  from the currently-displayed value when the target changes. */
export function useCountUp(target: number, duration = 650): number {
  const displayRef = useRef(target);
  const [display, setDisplay] = useState(target);

  useEffect(() => {
    const from = displayRef.current;
    const to = target;
    if (Math.abs(from - to) < 0.5) {
      displayRef.current = to;
      setDisplay(to);
      return;
    }
    let raf = 0;
    const t0 = performance.now();
    const step = (t: number) => {
      const k = Math.min(1, (t - t0) / duration);
      const e = 1 - Math.pow(1 - k, 3);
      const v = from + (to - from) * e;
      displayRef.current = v;
      setDisplay(v);
      if (k < 1) {
        raf = requestAnimationFrame(step);
      } else {
        displayRef.current = to;
      }
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);

  return display;
}
