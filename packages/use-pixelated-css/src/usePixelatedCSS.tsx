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
  }, [prevCSS.styles, ref, unitPixel]);

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
