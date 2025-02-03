import { useEffect, useState, useRef, useCallback, useLayoutEffect } from "react";

import { pixelate } from "./pixel";

import type { SerializedStyles } from "@emotion/react";


interface UsePixelatedCSSProps {
  prevCSS: SerializedStyles;
  ref: React.RefObject<HTMLElement>;
  unitPixel?: number;
}

export const usePixelatedCSS = ({prevCSS, ref, unitPixel = 16}: UsePixelatedCSSProps) => {
  const [pixelatedCSS, setPixelatedCSS] = useState<SerializedStyles>(prevCSS);
  
  const isInitialized = useRef(false);
  const prevCSSRef = useRef(prevCSS);
  const unitPixelRef = useRef(unitPixel);
  
  const updatePixelatedCSS = useCallback(() => {
    if (!ref.current) return;
    console.log(prevCSS)
    
    requestAnimationFrame(() => {
      if (
        prevCSSRef.current !== prevCSS || 
        unitPixelRef.current !== unitPixel ||
        !isInitialized.current
      ) {
        prevCSSRef.current = prevCSS;
        unitPixelRef.current = unitPixel;
        isInitialized.current = true;
        
        setPixelatedCSS(pixelate({ref, unitPixel}));
      }
    });
  }, [prevCSS.styles, ref, unitPixel]);

  useLayoutEffect(() => {
    if (ref.current) {
      updatePixelatedCSS();
    }
  }, [updatePixelatedCSS]);

  useEffect(() => {
    if (!ref.current) return;

    const resizeObserver = new ResizeObserver((entries) => {
      requestAnimationFrame(() => {
        if (entries[0].contentRect) {
          updatePixelatedCSS();
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
            updatePixelatedCSS();
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
  }, [updatePixelatedCSS]);

  return pixelatedCSS;
};
