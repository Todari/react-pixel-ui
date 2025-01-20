import { useEffect, useMemo, useState } from "react";

import { pixelate } from "./pixel";

import type { SerializedStyles } from "@emotion/react";


interface UsePixelatedCSSProps {
  prevCSS: SerializedStyles;
  ref: React.RefObject<HTMLElement>;
  unitPixel?: number;
}

export const usePixelatedCSS = ({prevCSS, ref, unitPixel = 4}: UsePixelatedCSSProps) => {
  const [isRefReady, setIsRefReady] = useState(false);

  useEffect(() => {
    if (ref.current) {
      setIsRefReady(true);
    }
  }, [ref]);

  const pixelatedCSS = useMemo(() => {
    if (!isRefReady) return prevCSS;
    return pixelate({prevCss: prevCSS, ref, unitPixel}); 
  }, [prevCSS, isRefReady, unitPixel, ref]);

  return {pixelatedCSS};
};
