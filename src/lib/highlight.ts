import { codeToHtml } from "shiki";

export const shikiThemes = { light: "rose-pine-dawn", dark: "rose-pine" } as const;

export async function highlight(code: string, lang: string) {
  "use cache";
  return codeToHtml(code.trim(), { lang, themes: shikiThemes, defaultColor: false });
}
