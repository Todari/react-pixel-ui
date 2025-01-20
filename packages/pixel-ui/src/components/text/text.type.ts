export interface TextProps extends React.HTMLAttributes<HTMLParagraphElement>, TextStyleProps {
  useHtag?: boolean;
}

export type TextStyleProps = {
  size: TextSize;
};

export type TextSize = "heading" | "title" | "subtitle" | "body" | "caption" | "label" | "tiny";
