import { useEffect, useState, useRef, useCallback, useLayoutEffect } from "react";

import { pixelate } from "./pixel";

import type { SerializedStyles } from "@emotion/react";


interface UsePixelatedCSSProps {
  prevCSS: SerializedStyles;
  ref: React.RefObject<HTMLElement>;
  unitPixel?: number;
}

export const usePixelatedCSS = ({prevCSS, ref, unitPixel = 4}: UsePixelatedCSSProps) => {
  const [pixelatedCSS, setPixelatedCSS] = useState<SerializedStyles>(prevCSS);
  const isInitialized = useRef(false);
  const unitPixelRef = useRef(unitPixel);
  
  // prevCSS를 먼저 적용
  useLayoutEffect(() => {
    if (!ref.current) return;
    ref.current.setAttribute('style', prevCSS.styles);
  }, [prevCSS.styles, ref]);

  // prevCSS가 적용된 후 pixelate 실행
  useLayoutEffect(() => {
    if (!ref.current) return;
    
    requestAnimationFrame(() => {
      if (
        unitPixelRef.current !== unitPixel ||
        !isInitialized.current
      ) {
        unitPixelRef.current = unitPixel;
        isInitialized.current = true;
        setPixelatedCSS(pixelate({ref, unitPixel}));
      }
    });
  }, [prevCSS.styles, ref, unitPixel]);

  // ResizeObserver와 MutationObserver 설정
  useEffect(() => {
    if (!ref.current) return;

    const resizeObserver = new ResizeObserver((entries) => {
      requestAnimationFrame(() => {
        if (entries[0].contentRect) {
          setPixelatedCSS(pixelate({ref, unitPixel}));
        }
      });
    });

    const mutationObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (
          mutation.type === 'attributes' && 
          (mutation.attributeName === 'style' || mutation.attributeName === 'class')
        ) {
          requestAnimationFrame(() => {
            setPixelatedCSS(pixelate({ref, unitPixel}));
          });
        }
      });
    });

    resizeObserver.observe(ref.current);
    mutationObserver.observe(ref.current, {
      attributes: true,
      attributeFilter: ['style', 'class']
    });

    return () => {
      resizeObserver.disconnect();
      mutationObserver.disconnect();
    };
  }, [ref, unitPixel]);

  return pixelatedCSS;
};
