export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    ButtonStyleProps {
  children: React.ReactNode;
}

export type ButtonStyleProps = {
  size?: ButtonSize;
  variant?: ButtonVariant;
  bg?: string;
  hasGradient?: boolean;
  hasBorder?: boolean;
  ref?: React.Ref<HTMLButtonElement>;
};

export type ButtonSize = "sm" | "md" | "lg";
export type ButtonVariant = "primary" | "secondary" | "tertiary";
