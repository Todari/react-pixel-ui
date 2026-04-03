import { useCallback, useEffect, useRef } from 'react';
import { generatePixelArt, parseComputedStyles } from '@react-pixel-ui/core';
import { usePixelConfig } from '../context/PixelConfigProvider';
import { allocateId, setRule, removeRule } from '../utils/style-manager';
import { createStyleObserver } from '../utils/style-observer';

export interface UsePixelRefOptions {
  /** Pixel block size (default: from PixelConfigProvider or 4) */
  pixelSize?: number;
  /** Enable/disable pixelation (default: true) */
  enabled?: boolean;
  /** Re-compute on hover state change (default: true) */
  observeHover?: boolean;
  /** Re-compute on focus state change (default: true) */
  observeFocus?: boolean;
  /** Re-compute on active state change (default: true) */
  observeActive?: boolean;
}

// Properties managed by the hook — will be cleared on each update
const MANAGED_PROPS = [
  'clipPath',
  'background',
  'backgroundColor',
  'backgroundImage',
  'backgroundSize',
  'backgroundRepeat',
  'imageRendering',
  'filter',
  'border',
  'borderRadius',
  'borderColor',
  'borderWidth',
  'borderStyle',
  'position',
  'boxShadow',
] as const;

/**
 * Hook that automatically pixelates any HTML element.
 * Reads computed styles and applies pixel art transformations.
 *
 * @example
 * ```tsx
 * const pixelRef = usePixelRef({ pixelSize: 4 });
 * <div ref={pixelRef} className="bg-red-500 rounded-xl border-2 border-black">
 *   Content
 * </div>
 * ```
 */
export function usePixelRef<T extends HTMLElement = HTMLDivElement>(
  options: UsePixelRefOptions = {},
): React.RefCallback<T> {
  const config = usePixelConfig();
  const pixelSize = options.pixelSize ?? config.pixelSize;
  const enabled = options.enabled ?? true;

  const elementRef = useRef<T | null>(null);
  const uidRef = useRef<string | null>(null);
  const observerRef = useRef<{ disconnect: () => void } | null>(null);
  const prevConfigRef = useRef<string>('');
  const isApplyingRef = useRef(false);

  const applyPixelArt = useCallback(() => {
    const el = elementRef.current;
    if (!el || !enabled) return;

    // Prevent self-triggered mutations
    if (isApplyingRef.current) return;
    isApplyingRef.current = true;

    try {
      const computed = getComputedStyle(el);
      const artConfig = parseComputedStyles(computed, pixelSize);

      // Diff check — skip if nothing changed
      const configKey = JSON.stringify(artConfig) + `|${el.offsetWidth}x${el.offsetHeight}`;
      if (configKey === prevConfigRef.current) return;
      prevConfigRef.current = configKey;

      const width = el.offsetWidth;
      const height = el.offsetHeight;
      if (width === 0 || height === 0) return;

      const result = generatePixelArt(width, height, artConfig);

      // Clear previously managed properties
      for (const prop of MANAGED_PROPS) {
        el.style[prop as any] = '';
      }

      if (result.needsWrapper) {
        // Border mode: element = border layer, ::before = content layer
        const uid = uidRef.current!;
        el.style.position = 'relative';
        el.style.backgroundColor = artConfig.borderColor || '';
        el.style.border = 'none';
        el.style.borderRadius = '0';
        el.style.boxShadow = 'none';
        if (result.clipPath !== 'none') {
          el.style.clipPath = result.clipPath;
        }
        if (result.wrapperStyle.filter) {
          el.style.filter = result.wrapperStyle.filter as string;
        }

        // Inject ::before pseudo-element rule for content background
        const contentStyle = result.contentStyle;
        const cssProps: string[] = [
          `content: ''`,
          `position: absolute`,
          `inset: ${contentStyle.inset}`,
          `pointer-events: none`,
          `z-index: 0`,
        ];
        if (result.innerClipPath && result.innerClipPath !== 'none') {
          cssProps.push(`clip-path: ${result.innerClipPath}`);
        }
        if (contentStyle.backgroundImage) {
          cssProps.push(`background-image: ${contentStyle.backgroundImage}`);
          cssProps.push(`background-size: 100% 100%`);
          cssProps.push(`background-repeat: no-repeat`);
          cssProps.push(`image-rendering: pixelated`);
          cssProps.push(`image-rendering: crisp-edges`);
        } else if (contentStyle.background) {
          cssProps.push(`background: ${contentStyle.background}`);
        }

        setRule(uid, `[data-pixel-uid="${uid}"]::before { ${cssProps.join('; ')} }`);
      } else {
        // No border: apply everything directly to element
        el.style.border = 'none';
        el.style.borderRadius = '0';
        el.style.boxShadow = 'none';
        if (result.clipPath !== 'none') {
          el.style.clipPath = result.clipPath;
        }
        if (result.contentStyle.backgroundImage) {
          el.style.backgroundImage = result.contentStyle.backgroundImage as string;
          el.style.backgroundSize = '100% 100%';
          el.style.backgroundRepeat = 'no-repeat';
          el.style.imageRendering = 'pixelated';
        } else if (result.contentStyle.background) {
          el.style.background = result.contentStyle.background as string;
        }
        if (result.contentStyle.filter) {
          el.style.filter = result.contentStyle.filter as string;
        }

        // Clear any pseudo-element rule
        if (uidRef.current) removeRule(uidRef.current);
      }
    } finally {
      // Defer flag reset to next microtask so MutationObserver ignores our changes
      Promise.resolve().then(() => {
        isApplyingRef.current = false;
      });
    }
  }, [pixelSize, enabled]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      observerRef.current?.disconnect();
      if (uidRef.current) removeRule(uidRef.current);
    };
  }, []);

  // Re-apply when options change
  useEffect(() => {
    applyPixelArt();
  }, [applyPixelArt]);

  // Callback ref
  return useCallback(
    (node: T | null) => {
      // Cleanup previous
      observerRef.current?.disconnect();
      if (elementRef.current && uidRef.current) {
        elementRef.current.removeAttribute('data-pixel-uid');
        removeRule(uidRef.current);
      }

      elementRef.current = node;

      if (!node || !enabled) return;

      // Assign unique ID
      if (!uidRef.current) uidRef.current = allocateId();
      node.setAttribute('data-pixel-uid', uidRef.current);

      // Initial apply
      applyPixelArt();

      // Set up observers
      observerRef.current = createStyleObserver(node, {
        onUpdate: applyPixelArt,
        hover: options.observeHover ?? true,
        focus: options.observeFocus ?? true,
        active: options.observeActive ?? true,
      });
    },
    [applyPixelArt, enabled, options.observeHover, options.observeFocus, options.observeActive],
  );
}
