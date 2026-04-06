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

// Properties managed by the hook — stripped before reading, set after generating
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
  // Cache the last generated result for re-application on no-change diff
  const cachedResultRef = useRef<ReturnType<typeof generatePixelArt> | null>(null);
  const cachedBorderColorRef = useRef<string>('');

  const applyPixelArt = useCallback(() => {
    const el = elementRef.current;
    if (!el || !enabled) return;

    if (isApplyingRef.current) return;
    isApplyingRef.current = true;

    try {
      // 1. Strip ALL managed styles to reveal original CSS
      for (const prop of MANAGED_PROPS) {
        el.style[prop as any] = '';
      }
      // Also clear pseudo-element rule temporarily
      if (uidRef.current) removeRule(uidRef.current);

      // 2. Read ORIGINAL computed styles (with our styles stripped)
      const computed = getComputedStyle(el);
      const artConfig = parseComputedStyles(computed, pixelSize);
      const width = el.offsetWidth;
      const height = el.offsetHeight;
      if (width === 0 || height === 0) return;

      // 3. Diff check on original config
      const configKey = JSON.stringify(artConfig) + `|${width}x${height}`;
      if (configKey === prevConfigRef.current && cachedResultRef.current) {
        // Same config — re-apply cached result
        applyResult(el, cachedResultRef.current, cachedBorderColorRef.current);
        return;
      }
      prevConfigRef.current = configKey;

      // 4. Generate pixel art from original styles
      const result = generatePixelArt(width, height, artConfig);
      cachedResultRef.current = result;
      cachedBorderColorRef.current = artConfig.borderColor || '';

      // 5. Apply result to element
      applyResult(el, result, artConfig.borderColor || '');
    } finally {
      Promise.resolve().then(() => {
        isApplyingRef.current = false;
      });
    }
  }, [pixelSize, enabled]);

  /** Apply a pixel art result to the DOM element */
  const applyResult = useCallback(
    (
      el: HTMLElement,
      result: ReturnType<typeof generatePixelArt>,
      borderColor: string,
    ) => {
      if (result.needsWrapper) {
        // Border mode: element = border layer, ::before = content layer
        const uid = uidRef.current!;
        el.style.position = 'relative';
        el.style.backgroundColor = borderColor;
        el.style.border = 'none';
        el.style.borderRadius = '0';
        el.style.boxShadow = 'none';
        if (result.clipPath !== 'none') {
          el.style.clipPath = result.clipPath;
        }
        if (result.wrapperStyle.filter) {
          el.style.filter = result.wrapperStyle.filter as string;
        }

        // Inject ::before pseudo-element for content background
        const cs = result.contentStyle;
        const cssProps: string[] = [
          `content: ''`,
          `position: absolute`,
          `inset: ${cs.inset}`,
          `pointer-events: none`,
          `z-index: 0`,
        ];
        if (result.innerClipPath && result.innerClipPath !== 'none') {
          cssProps.push(`clip-path: ${result.innerClipPath}`);
        }
        if (cs.backgroundImage) {
          cssProps.push(`background-image: ${cs.backgroundImage}`);
          cssProps.push(`background-size: 100% 100%`);
          cssProps.push(`background-repeat: no-repeat`);
          cssProps.push(`image-rendering: pixelated`);
          cssProps.push(`image-rendering: crisp-edges`);
        } else if (cs.background) {
          cssProps.push(`background: ${cs.background}`);
        }

        setRule(
          uid,
          `[data-pixel-uid="${uid}"]::before { ${cssProps.join('; ')} }`,
        );
      } else {
        // No border: apply directly to element
        el.style.border = 'none';
        el.style.borderRadius = '0';
        el.style.boxShadow = 'none';
        if (result.clipPath !== 'none') {
          el.style.clipPath = result.clipPath;
        }
        if (result.contentStyle.backgroundImage) {
          el.style.backgroundImage = result.contentStyle
            .backgroundImage as string;
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
    },
    [],
  );

  useEffect(() => {
    return () => {
      observerRef.current?.disconnect();
      if (uidRef.current) removeRule(uidRef.current);
    };
  }, []);

  useEffect(() => {
    applyPixelArt();
  }, [applyPixelArt]);

  return useCallback(
    (node: T | null) => {
      observerRef.current?.disconnect();
      if (elementRef.current && uidRef.current) {
        elementRef.current.removeAttribute('data-pixel-uid');
        removeRule(uidRef.current);
      }

      elementRef.current = node;

      if (!node || !enabled) return;

      if (!uidRef.current) uidRef.current = allocateId();
      node.setAttribute('data-pixel-uid', uidRef.current);

      applyPixelArt();

      observerRef.current = createStyleObserver(node, {
        onUpdate: applyPixelArt,
        hover: options.observeHover ?? true,
        focus: options.observeFocus ?? true,
        active: options.observeActive ?? true,
      });
    },
    [
      applyPixelArt,
      enabled,
      options.observeHover,
      options.observeFocus,
      options.observeActive,
    ],
  );
}
