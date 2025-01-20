import { textStyle } from "./text.style";
import { TextProps } from "./text.type";

export function Text({children, size, useHtag, ...rest}: TextProps) {
  const Txt = useHtag ? size === 'heading' ? 'h1' : size === 'title' ? 'h2' : size === 'subtitle' ? 'h3' : 'p' : 'p';
  
  return (
    <Txt css={textStyle({size})} {...rest}>
      {children === '' ? '\u00A0' : children}
    </Txt>
  );
};
