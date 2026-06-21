"use client";

import { useUserStore } from "@/store/userStore";
import vi from "./languages/vi";
import en from "./languages/en";
import zh from "./languages/zh";
import es from "./languages/es";
import fr from "./languages/fr";
import ar from "./languages/ar";
import pt from "./languages/pt";
import hi from "./languages/hi";
import ru from "./languages/ru";
import id from "./languages/id";
import ko from "./languages/ko";
import de from "./languages/de";
import it from "./languages/it";
import th from "./languages/th";

// Combine imported language dictionaries into a single object.
const dictionaries = {
  vi,
  en,
  zh,
  es,
  fr,
  ar,
  pt,
  hi,
  ru,
  id,
  ko,
  de,
  it,
  th,
};

export type Locale = keyof typeof dictionaries;

export function useTranslation() {
  const language = useUserStore((state) => state.language);
  return dictionaries[(language as Locale) in dictionaries ? (language as Locale) : "en"];
}
