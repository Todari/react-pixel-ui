import { useCallback, useEffect, useRef, useState } from 'react';

interface Size {
  width: number;
  height: number;
}

/**
 * Hook that observes an element's size via ResizeObserver.
 * Debounces updates using requestAnimationFrame and snaps
 * dimensions to the nearest pixelSize multiple.
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

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;

      // Cancel previous pending update
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }

      // Debounce with rAF
      rafRef.current = requestAnimationFrame(() => {
        const { width, height } = entry.contentRect;
        const snapped = snapSize(width, height);

        setSize((prev) => {
          if (prev && prev.width === snapped.width && prev.height === snapped.height) {
            return prev;
          }
          return snapped;
        });

        rafRef.current = null;
      });
    });

    observer.observe(element);

    // Set initial size
    const rect = element.getBoundingClientRect();
    setSize(snapSize(rect.width, rect.height));

    return () => {
      observer.disconnect();
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [enabled, snapSize]);

  return { ref, size };
}
