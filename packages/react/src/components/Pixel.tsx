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
  // Bumped to force a re-measure even when artState is already null
  // (e.g. the child was zero-sized at mount and just became visible).
  const [measureToken, setMeasureToken] = useState(0);
  // Once a shadow wrapper has been rendered, keep the wrapper in the tree
  // (display: contents when inactive) so the child DOM node is never
  // remounted by a structure change — remounts wipe input state and focus.
  const hadShadowWrapperRef = useRef(false);

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

  // Re-measure when the child's size changes (responsive layouts, font
  // loads, content edits) or when it first becomes non-zero (mounted
  // inside display:none). The generated clip-path uses absolute px
  // coordinates, so stale art would be visibly wrong after a resize.
  useEffect(() => {
    if (!enabled) return;
    if (typeof ResizeObserver === 'undefined') return;
    const el = childRef.current;
    if (!el) return;

    let rafId: number | null = null;
    const observer = new ResizeObserver(() => {
      if (rafId !== null) return;
      rafId = requestAnimationFrame(() => {
        rafId = null;
        const node = childRef.current;
        if (!node) return;
        const w = node.offsetWidth;
        const h = node.offsetHeight;
        if (artState) {
          if (w !== artState.width || h !== artState.height) {
            setArtState(null);
            setMeasureToken((t) => t + 1);
          }
        } else if (w > 0 && h > 0) {
          setMeasureToken((t) => t + 1);
        }
      });
    });
    observer.observe(el);

    return () => {
      if (rafId !== null) cancelAnimationFrame(rafId);
      observer.disconnect();
    };
  }, [enabled, artState]);

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

    // Always measure the OUTER (border-box) dimensions. We preserve the
    // border width via `border-color: transparent` below, which keeps the
    // element's outer box unchanged regardless of box-sizing.
    const width = el.offsetWidth;
    const height = el.offsetHeight;

    const computed = getComputedStyle(el);
    const artConfig = parseComputedStyles(computed, pixelSize, {
      width,
      height,
    });

    if (width > 0 && height > 0) {
      setArtState({ config: artConfig, width, height });
    }
  }, [artState, measureToken, pixelSize, enabled]);

  // Memoize the generated pixel art so parent re-renders don't regenerate
  // the composite PNG on every frame.
  const result: PixelArtStyles | null = useMemo(() => {
    if (!artState) return null;
    return generatePixelArt(artState.width, artState.height, artState.config, {
      want: 'composite',
    });
  }, [artState]);

  // Derive the shadow filter before any early return so the
  // wrapper-stickiness effect below can observe it.
  const shadowFilter: string | undefined = result
    ? ((result.wrapperStyle.filter ?? result.contentStyle.filter) as
        | string
        | undefined)
    : undefined;

  useEffect(() => {
    if (shadowFilter) hadShadowWrapperRef.current = true;
  }, [shadowFilter]);

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

  // Keep the wrapper div in the tree once it has appeared so the child
  // keeps its position (and DOM node) across phase changes.
  const keepWrapper = hadShadowWrapperRef.current;
  const passthroughWrap = (node: React.ReactElement) =>
    keepWrapper ? <div style={{ display: 'contents' }}>{node}</div> : node;

  // Phase 1: no pixel art yet — render child as-is with ref to measure
  if (!artState || !result) {
    return passthroughWrap(cloneElement(children, { ref: mergedRef } as never));
  }

  // Phase 2: apply pixel art via style override.
  // Instead of `border: none` (which shrinks content-box elements and causes
  // layout shift), we set `border-color: transparent` to preserve the box,
  // and use `background-origin: border-box` so the composite image covers
  // the border area.
  const pixelStyle: React.CSSProperties = {};

  if (result.clipPath !== 'none') {
    pixelStyle.clipPath = result.clipPath;
  }

  if (result.compositeImage) {
    // Composite PNG bakes background + border into one image.
    pixelStyle.background = 'none';
    pixelStyle.borderColor = 'transparent';
    pixelStyle.borderRadius = 0;
    pixelStyle.backgroundImage = result.compositeImage;
    pixelStyle.backgroundSize = '100% 100%';
    pixelStyle.backgroundRepeat = 'no-repeat';
    pixelStyle.backgroundOrigin = 'border-box';
    pixelStyle.backgroundClip = 'border-box';
    pixelStyle.imageRendering = 'pixelated';
  } else if (result.contentStyle.background) {
    // No composite means the background couldn't be pixelated (url()
    // image, conic-gradient, ...) — keep the original background and
    // border so the element degrades gracefully instead of vanishing.
    pixelStyle.borderRadius = 0;
  }

  if (shadowFilter) {
    // The author box-shadow is replaced by a pixelated drop-shadow filter.
    pixelStyle.boxShadow = 'none';
  }

  const childProps = children.props as { style?: React.CSSProperties };

  // drop-shadow on the SAME element as clip-path gets clipped.
  // Move shadow to a wrapper div so it renders outside the clip.
  //
  // The wrapper uses `display: inline-block` so it shrink-wraps to the
  // child, but we ALSO give it the child's measured width/height. Without
  // explicit dimensions, a child that uses `width: min(Xpx, 100%)` enters
  // a circular size-resolution with its shrink-to-fit parent (the `100%`
  // resolves to 0 in some browsers → the element collapses). Pinning the
  // wrapper to the measured dimensions breaks the cycle while still
  // allowing `max-width: 100%` to cap at the containing block.
  if (shadowFilter) {
    return (
      <div
        style={{
          filter: shadowFilter,
          display: 'inline-block',
          width: artState.width,
          height: artState.height,
          maxWidth: '100%',
        }}
      >
        {cloneElement(children, {
          ref: mergedRef,
          style: { ...(childProps.style || {}), ...pixelStyle },
        } as never)}
      </div>
    );
  }

  return passthroughWrap(
    cloneElement(children, {
      ref: mergedRef,
      style: { ...(childProps.style || {}), ...pixelStyle },
    } as never),
  );
}
