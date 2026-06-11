import { useCallback, useEffect, useRef, useState } from 'react';

interface Size {
  width: number;
  height: number;
}

/**
 * Hook that observes an element's size via ResizeObserver.
 * Debounces updates using requestAnimationFrame and snaps
 * dimensions to the nearest pixelSize multiple.
 *
 * Measures the BORDER box (matching clip-path's default reference box),
 * with offsetWidth/offsetHeight as the fallback.
 */
export function useResponsiveSize(
  pixelSize: number,
  enabled: boolean = true,
): {
  ref: React.RefObject<HTMLDivElement | null>;
  size: Size | null;
} {
  const ref = useRef<HTMLDivElement | null>(null);
  const [size, setSize] = useState<Size | null>(null);
  const rafRef = useRef<number | null>(null);

  const snapSize = useCallback(
    (width: number, height: number): Size => ({
      width: Math.ceil(width / pixelSize) * pixelSize,
      height: Math.ceil(height / pixelSize) * pixelSize,
    }),
    [pixelSize],
  );

  useEffect(() => {
    if (!enabled || !ref.current) return;

    const element = ref.current;

    const measure = (entry?: ResizeObserverEntry): Size => {
      const box = entry?.borderBoxSize?.[0];
      if (box) {
        return snapSize(box.inlineSize, box.blockSize);
      }
      return snapSize(element.offsetWidth, element.offsetHeight);
    };

    const update = (next: Size) => {
      setSize((prev) => {
        if (prev && prev.width === next.width && prev.height === next.height) {
          return prev;
        }
        return next;
      });
    };

    let observer: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined') {
      observer = new ResizeObserver((entries) => {
        const entry = entries[0];
        if (!entry) return;

        // Cancel previous pending update
        if (rafRef.current !== null) {
          cancelAnimationFrame(rafRef.current);
        }

        // Debounce with rAF
        rafRef.current = requestAnimationFrame(() => {
          update(measure(entry));
          rafRef.current = null;
        });
      });
      observer.observe(element);
    }

    // Set initial size
    update(measure());

    return () => {
      observer?.disconnect();
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [enabled, snapSize]);

  return { ref, size };
}
