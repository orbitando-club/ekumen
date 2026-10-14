import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost";
  href?: string;
  children: ReactNode;
};

const styles = {
  primary:
    "bg-[#02043E] text-white hover:bg-[#023D8F] border border-transparent",
  secondary:
    "bg-white text-[#02043E] border border-[#02043E]/15 hover:border-[#02043E]/40",
  ghost: "bg-transparent text-[#02043E] border border-transparent hover:bg-white",
};

export function Button({
  variant = "primary",
  href,
  children,
  className = "",
  ...props
}: ButtonProps) {
  const classes = `inline-flex items-center justify-center rounded-full px-6 py-3 text-[15px] font-medium transition-colors duration-200 ${styles[variant]} ${className}`;

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
}
