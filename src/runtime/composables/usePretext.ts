import { prepareWithSegments, layoutWithLines } from "@chenglou/pretext";

type MeasureOptions = { width?: number; font?: string; lineHeight?: number };
const EMPTY = {
  lines: [] as { text: string; width: number }[],
  height: 0,
  lineCount: 0,
};
const cache = new Map();

export function usePretext() {
  function measure(text: string, options: MeasureOptions = {}) {
    const { width = 300, font = "16px Inter", lineHeight = 20 } = options;
    if (!width || width <= 0) return EMPTY;

    const key = JSON.stringify({ text, font, width, lineHeight });
    if (cache.has(key)) return cache.get(key);

    try {
      const prepared = prepareWithSegments(text, font);
      if (!prepared) return EMPTY; // stub returns null on server
      const result = layoutWithLines(prepared, width, lineHeight);
      cache.set(key, result);
      return result;
    } catch {
      return EMPTY;
    }
  }
  return { measure };
}
