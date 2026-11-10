import type { ElementType, HTMLAttributes } from "react";

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
} & Omit<HTMLAttributes<HTMLElement>, "dangerouslySetInnerHTML" | "children" | "className">;

export function RichText({ html, as: Tag = "span", className, ...rest }: Props) {
  return (
    <Tag
      className={className}
      dangerouslySetInnerHTML={{ __html: sanitizeRichText(html) }}
      {...rest}
    />
  );
}
