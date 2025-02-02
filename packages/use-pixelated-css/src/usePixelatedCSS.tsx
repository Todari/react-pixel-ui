import { useEffect, useState, useRef } from "react";

import { pixelate } from "./pixel";

import type { SerializedStyles } from "@emotion/react";


interface UsePixelatedCSSProps {
  prevCSS: SerializedStyles;
  ref: React.RefObject<HTMLElement>;
  unitPixel?: number;
}

export const usePixelatedCSS = ({prevCSS, ref, unitPixel = 4}: UsePixelatedCSSProps) => {
  const [pixelatedCSS, setPixelatedCSS] = useState<SerializedStyles>(prevCSS);
  const prevUnitPixel = useRef(unitPixel);
  
  useEffect(() => {
    if (!ref.current) return;

    if (prevUnitPixel.current !== unitPixel) {
      prevUnitPixel.current = unitPixel;
    }

    const updatePixelatedCSS = () => {
      setPixelatedCSS(pixelate({prevCss: prevCSS, ref, unitPixel}));
    };

    updatePixelatedCSS();

    const resizeObserver = new ResizeObserver(updatePixelatedCSS);
    resizeObserver.observe(ref.current);

    return () => resizeObserver.disconnect();
  }, [prevCSS, unitPixel, ref]);

  return pixelatedCSS;
};
