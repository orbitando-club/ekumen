import Link from "next/link";
import type { ButtonHTMLAttributes, CSSProperties, ReactNode } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost";
  href?: string;
  /** Color de fondo para primary (p. ej. acento del cluster). */
  accent?: string;
  children: ReactNode;
};

const styles = {
  primary:
    "bg-[#02043E] text-white hover:bg-[#023D8F] border border-transparent",
  secondary:
    "bg-white text-[#02043E] border border-[#02043E]/20 hover:border-[#02043E]/45",
  ghost: "bg-transparent text-[#02043E] border border-transparent hover:bg-white",
};

export function Button({
  variant = "primary",
  href,
  accent,
  children,
  className = "",
  style,
  ...props
}: ButtonProps) {
  const accentStyle: CSSProperties | undefined =
    variant === "primary" && accent
      ? {
          ...(style ?? {}),
          backgroundColor: accent,
          borderColor: accent,
        }
      : style;

  const accentHover =
    variant === "primary" && accent ? "hover:brightness-110 hover:opacity-95" : "";

  const classes = `inline-flex cursor-pointer items-center justify-center rounded-sm px-6 py-3 text-[0.9375rem] font-medium transition-[colors,filter,opacity] duration-200 ${
    accent && variant === "primary" ? "text-white border border-transparent" : styles[variant]
  } ${accentHover} ${className}`;

  if (href) {
    return (
      <Link href={href} className={classes} style={accentStyle}>
        {children}
      </Link>
    );
  }

  return (
    <button className={classes} style={accentStyle} {...props}>
      {children}
    </button>
  );
}
