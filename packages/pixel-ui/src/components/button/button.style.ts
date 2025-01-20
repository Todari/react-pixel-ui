import { setDarker, setOnTextColor } from './../../util/color';
import { css } from "@emotion/react";
import { ButtonSize, ButtonStyleProps, ButtonVariant } from "./button.type";
import { TYPOGRAPHY } from "../token/typography";
import { setLighter } from "../../util";

export const buttonDefaultStyle = css`
  display: flex;
  justify-content: center;
  align-items: center;
  line-height: 1;
  transition: 0.2s;
  transition-timing-function: cubic-bezier(0.7, 0.62, 0.62, 1.16);
  white-space: nowrap;

  font-family: ${TYPOGRAPHY.fontFamily};
`;

export const buttonSizeStyle = {
  sm: css`
    padding: 0.75rem 1rem;
    border-radius: 0.75rem;
    font-size: ${TYPOGRAPHY.fontSize.label};
  `,
  md: css`
    padding: 1rem 1.25rem;
    border-radius: 1rem;
    font-size: ${TYPOGRAPHY.fontSize.body};
  `,
  lg: css`
    padding: 1.25rem 1.5rem;
    border-radius: 1.25rem;
    font-size: ${TYPOGRAPHY.fontSize.subtitle};
  `,
};

export const buttonVariantStyle = (color: string, hasGradient: boolean, hasBorder: boolean) => ({
  primary: css`
    background: ${hasGradient ? `linear-gradient(180deg, ${setLighter(color, 0.80)} 0%, ${setDarker(color, 0.08)} 100%)` : color};
    border: ${hasBorder ? `4px solid ${setDarker(color, 0.16)}` : 'none'};
    color: ${setOnTextColor(color, 0.16, '#000000', '#000000')};
  `,
  secondary: css`
    background: #FFFFFF;
    border: ${hasBorder ? `4px solid ${setDarker(color, 0.16)}` : 'none'};
    color: ${setDarker(color, 0.16)};
  `,
  tertiary: css`
    background: #FFFFFF;
    border: ${hasBorder ? `4px solid #000000` : 'none'};
    color: #000000;
  `,
}); 

export const buttonStyle = ({size, variant, bg, hasGradient, hasBorder}: ButtonStyleProps) => {
  const variantStyles = buttonVariantStyle(bg ?? '', hasGradient ?? true, hasBorder ?? true);
  return css([buttonDefaultStyle, buttonSizeStyle[size as ButtonSize], variantStyles[variant as ButtonVariant]]);
};
