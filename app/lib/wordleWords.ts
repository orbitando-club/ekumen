import type { Locale } from "@/app/lib/i18n/types";

/**
 * Palabras de 5 letras ligadas a los valores.
 * EN: value, start, trust, again, think, share, whole, solve, learn, guide.
 * ES: valor, abrir (empezar), creer (confianza), nueva (de nuevo),
 *     idear, hacer, todos, apoyo, guiar, norte.
 */
export const WORDLE_WORDS: Record<Locale, readonly string[]> = {
  en: ["VALUE", "START", "TRUST", "AGAIN", "THINK", "SHARE", "WHOLE", "SOLVE", "LEARN", "GUIDE"],
  es: ["VALOR", "ABRIR", "CREER", "NUEVA", "IDEAR", "HACER", "TODOS", "APOYO", "GUIAR", "NORTE"],
};

const storageKey = (locale: Locale) => `ekumen-wordle-${locale}`;

export function assignWordleWord(locale: Locale) {
  const list = WORDLE_WORDS[locale];
  if (typeof window === "undefined") return list[0];
  const saved = window.sessionStorage.getItem(storageKey(locale));
  if (saved && list.includes(saved)) return saved;
  const next = list[Math.floor(Math.random() * list.length)];
  window.sessionStorage.setItem(storageKey(locale), next);
  return next;
}

export function clearAssignedWords() {
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem(storageKey("es"));
  window.sessionStorage.removeItem(storageKey("en"));
}
