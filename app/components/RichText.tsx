import type { CSSProperties, ElementType, HTMLAttributes } from "react";

const ALLOWED = new Set(["b", "i", "em", "strong", "br", "span", "u"]);

/** Escapa HTML y rehidrata solo tags inline permitidos desde el copy de i18n. */
export function sanitizeRichText(input: string) {
  const escaped = input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

  return escaped.replace(
    /&lt;(\/?)([a-zA-Z0-9]+)([^&]*?)&gt;/g,
    (full, slash: string, rawTag: string, rawAttrs: string) => {
      const tag = rawTag.toLowerCase();
      if (!ALLOWED.has(tag)) return full;
      if (tag === "br") return slash ? "" : "<br />";
      if (slash) return `</${tag}>`;
      // Sin atributos para evitar onclick/style maliciosos
      void rawAttrs;
      return `<${tag}>`;
    },
  );
}

type Props = {
  html: string;
  as?: ElementType;
  className?: string;
  /** Si se pasa, <b>/<strong> toman este color (p. ej. acento del cluster). */
  accent?: string;
  style?: CSSProperties;
} & Omit<
  HTMLAttributes<HTMLElement>,
  "dangerouslySetInnerHTML" | "children" | "className" | "style"
>;

export function RichText({ html, as: Tag = "span", className, accent, style, ...rest }: Props) {
  const accentStyle = accent
    ? ({ ...(style ?? {}), ["--rich-accent"]: accent } as CSSProperties)
    : style;
  const accentClass = accent ? "rich-accent" : "";
  const merged = [accentClass, className].filter(Boolean).join(" ") || undefined;

  return (
    <Tag
      className={merged}
      style={accentStyle}
      dangerouslySetInnerHTML={{ __html: sanitizeRichText(html) }}
      {...rest}
    />
  );
}
