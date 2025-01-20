import { css } from "@emotion/react";
import { TextStyleProps } from "./text.type";
import { TYPOGRAPHY } from "../token/typography";

export const textStyle = ({size}: TextStyleProps) => css`
  font-family: ${TYPOGRAPHY.fontFamily};
  font-size: ${TYPOGRAPHY.fontSize[size]};
`;
