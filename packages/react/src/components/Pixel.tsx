import React, {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  isValidElement,
  cloneElement,
} from 'react';
import { generatePixelArt, parseComputedStyles } from '@react-pixel-ui/core';
import type { PixelArtConfig, PixelArtStyles } from '@react-pixel-ui/core';
import { usePixelConfig } from '../context/PixelConfigProvider';

const useIsomorphicLayoutEffect =
  typeof window !== 'undefined' ? useLayoutEffect : useEffect;

export interface PixelProps {
  size?: number;
  enabled?: boolean;
  children: React.ReactElement;
}

interface ArtState {
  config: PixelArtConfig;
  width: number;
  height: number;
}

/**
 * Wrapper component that automatically pixelates its child element.
 *
 * Phase 1: Renders child as-is to measure computed styles.
 * Phase 2: Re-renders with pixel art styles applied via cloneElement.
 */
export function Pixel({
  size,
  enabled = true,
  children,
}: PixelProps) {
  const config = usePixelConfig();
  const pixelSize = size ?? config.pixelSize;

  const childRef = useRef<HTMLElement | null>(null);
  const warnedRef = useRef(false);
  const [artState, setArtState] = useState<ArtState | null>(null);

  // Derive a stable signature from child props so React-driven
  // style/className changes trigger re-measurement.
  const childPropsObj = isValidElement(children)
    ? ((children.props ?? null) as Record<string, unknown> | null)
    : null;
  const childClassName =
    typeof childPropsObj?.className === 'string'
      ? (childPropsObj.className as string)
      : '';
  const childStyleKey = (() => {
    const style = childPropsObj?.style;
    if (!style || typeof style !== 'object') return '';
    try {
      return JSON.stringify(style);
    } catch {
      return String(style);
    }
  })();

  // Reset artState whenever any input that affects measurement changes.
  // Runs in layout phase to avoid a visible flash between old pixel art
  // and the newly measured state.
  useIsomorphicLayoutEffect(() => {
    setArtState(null);
  }, [pixelSize, enabled, childClassName, childStyleKey]);

  // Observe ancestor theme-class toggles (e.g., Tailwind `dark:` on <html>)
  // without touching the child element itself — avoiding self-mutation loops.
  useEffect(() => {
    if (!enabled) return;
    if (typeof document === 'undefined') return;

    let rafId: number | null = null;
    const scheduleReset = () => {
      if (rafId !== null) return;
      rafId = requestAnimationFrame(() => {
        rafId = null;
        setArtState(null);
      });
    };

    const rootObserver = new MutationObserver(scheduleReset);
    rootObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class', 'data-theme'],
    });
    if (document.body) {
      rootObserver.observe(document.body, {
        attributes: true,
        attributeFilter: ['class', 'data-theme'],
      });
    }

    return () => {
      if (rafId !== null) cancelAnimationFrame(rafId);
      rootObserver.disconnect();
    };
  }, [enabled]);

  // Read computed styles when artState is null (before pixel art is applied)
  useIsomorphicLayoutEffect(() => {
    if (artState !== null) return; // already computed
    if (!enabled) return;

    const el = childRef.current;
    if (!el) {
      if (
        process.env.NODE_ENV !== 'production' &&
        !warnedRef.current &&
        isValidElement(children)
      ) {
        warnedRef.current = true;
        const childType = (children as { type?: unknown }).type;
        const typeName =
          typeof childType === 'string'
            ? childType
            : (childType as { displayName?: string; name?: string })
                ?.displayName ||
              (childType as { name?: string })?.name ||
              'Component';
        // eslint-disable-next-line no-console
        console.warn(
          `[react-pixel-ui] <Pixel>'s child <${typeName}> did not accept a ref. ` +
            `Pass an HTML element (e.g. <div>) directly, or wrap the component with React.forwardRef.`,
        );
      }
      return;
    }

    const computed = getComputedStyle(el);
    const artConfig = parseComputedStyles(computed, pixelSize);
    // Always measure the OUTER (border-box) dimensions. We preserve the
    // border width via `border-color: transparent` below, which keeps the
    // element's outer box unchanged regardless of box-sizing.
    const width = el.offsetWidth;
    const height = el.offsetHeight;

    if (width > 0 && height > 0) {
      setArtState({ config: artConfig, width, height });
    }
  }, [artState, pixelSize, enabled]);

  // Memoize the generated pixel art so parent re-renders don't regenerate
  // the composite BMP on every frame.
  const result: PixelArtStyles | null = useMemo(() => {
    if (!artState) return null;
    return generatePixelArt(artState.width, artState.height, artState.config);
  }, [artState]);

  if (!isValidElement(children) || !enabled) return children;

  // Read the child's existing ref in a React 18 + 19 compatible way:
  // - React 19: ref is part of props (element.props.ref)
  // - React 18: ref is a top-level property (element.ref) — accessing it
  //   via props is undefined, so we fall back to the legacy location.
  const readChildRef = (el: React.ReactElement): unknown => {
    const propsRef = (el.props as { ref?: unknown } | null)?.ref;
    if (propsRef !== undefined) return propsRef;
    return (el as unknown as { ref?: unknown }).ref;
  };

  // Merge ref with child's existing ref
  const mergedRef = (node: HTMLElement | null) => {
    childRef.current = node;
    const childRefProp = readChildRef(children);
    if (typeof childRefProp === 'function') {
      (childRefProp as (n: HTMLElement | null) => void)(node);
    } else if (childRefProp && typeof childRefProp === 'object') {
      (childRefProp as React.MutableRefObject<HTMLElement | null>).current = node;
    }
  };

  // Phase 1: no pixel art yet — render child as-is with ref to measure
  if (!artState || !result) {
    return cloneElement(children, { ref: mergedRef } as never);
  }

  // Phase 2: apply pixel art via style override.
  // Instead of `border: none` (which shrinks content-box elements and causes
  // layout shift), we set `border-color: transparent` to preserve the box,
  // and use `background-origin: border-box` so the composite image covers
  // the border area.
  const pixelStyle: React.CSSProperties = {
    background: 'none',
    borderColor: 'transparent',
    borderRadius: 0,
    boxShadow: 'none',
  };

  if (result.clipPath !== 'none') {
    pixelStyle.clipPath = result.clipPath;
  }

  // Use composite image (border + gradient baked into one PNG)
  if (result.compositeImage) {
    pixelStyle.backgroundImage = result.compositeImage;
    pixelStyle.backgroundSize = '100% 100%';
    pixelStyle.backgroundRepeat = 'no-repeat';
    pixelStyle.backgroundOrigin = 'border-box';
    pixelStyle.backgroundClip = 'border-box';
    pixelStyle.imageRendering = 'pixelated';
  } else if (result.contentStyle.background) {
    pixelStyle.background = result.contentStyle.background as string;
  }

  if (result.wrapperStyle.filter) {
    pixelStyle.filter = result.wrapperStyle.filter as string;
  } else if (result.contentStyle.filter) {
    pixelStyle.filter = result.contentStyle.filter as string;
  }

  const childProps = children.props as { style?: React.CSSProperties };

  // drop-shadow on the SAME element as clip-path gets clipped.
  // Move shadow to a wrapper div so it renders outside the clip.
  const shadowFilter = pixelStyle.filter;
  if (shadowFilter) {
    delete pixelStyle.filter;
    return (
      <div style={{ filter: shadowFilter as string, display: 'inline-block' }}>
        {cloneElement(children, {
          ref: mergedRef,
          style: { ...(childProps.style || {}), ...pixelStyle },
        } as never)}
      </div>
    );
  }

  return cloneElement(children, {
    ref: mergedRef,
    style: { ...(childProps.style || {}), ...pixelStyle },
  } as never);
}
