import { usePixelatedCSS } from "@react-pixel-ui/use-pixelated-css";
import { buttonStyle } from "./button.style";
import { ButtonProps } from "./button.type";
import { forwardRef, useImperativeHandle, useRef } from "react";

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button({ children, size="md", variant="primary", bg="#FFDCFF", hasGradient=true, hasBorder=true, ...rest }, ref) {

    const buttonRef = useRef<HTMLButtonElement>(null);

    useImperativeHandle(ref, () => buttonRef.current!);
    
    const vectorStyle = buttonStyle({size, variant, bg, hasGradient, hasBorder});
    const pixelatedCSS = usePixelatedCSS({prevCSS: vectorStyle, ref: buttonRef});
    
    return (
        <button ref={buttonRef} type="button" css={pixelatedCSS} {...rest}>
        {children}
      </button>
    );
  }   
);
