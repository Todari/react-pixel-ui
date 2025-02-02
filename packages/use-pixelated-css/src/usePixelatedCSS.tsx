import { useEffect, useState, useRef, useCallback, useLayoutEffect } from "react";

import { pixelate } from "./pixel";

import type { SerializedStyles } from "@emotion/react";


interface UsePixelatedCSSProps {
  prevCSS: SerializedStyles;
  ref: React.RefObject<HTMLElement>;
  unitPixel?: number;
}

export const usePixelatedCSS = ({prevCSS, ref, unitPixel = 4}: UsePixelatedCSSProps) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [pixelatedCSS, setPixelatedCSS] = useState<SerializedStyles>(prevCSS);
  
  const prevCSSRef = useRef(prevCSS);
  const unitPixelRef = useRef(unitPixel);
  
  const updatePixelatedCSS = useCallback(() => {
    if (!ref.current) return;
    
    if (
      prevCSSRef.current !== prevCSS || 
      unitPixelRef.current !== unitPixel ||
      !isInitialized
    ) {
      prevCSSRef.current = prevCSS;
      unitPixelRef.current = unitPixel;
      setIsInitialized(true);
      
      setPixelatedCSS(pixelate({prevCss: prevCSS, ref, unitPixel}));
    }
  }, [prevCSS, unitPixel, ref, isInitialized]);

  useLayoutEffect(() => {
    requestAnimationFrame(() => {
      if (ref.current) {
        updatePixelatedCSS();
      }
    });
  }, [updatePixelatedCSS]);

  useEffect(() => {
    if (!ref.current) return;

    const resizeObserver = new ResizeObserver(updatePixelatedCSS);
    resizeObserver.observe(ref.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, [updatePixelatedCSS]);

  return pixelatedCSS;
};
