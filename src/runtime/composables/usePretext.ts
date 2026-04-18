import { prepare, layout } from "pretext";

type MeasureOptions = {
  width?: number;
  font?: string;
  lineHeight?: number;
};

const cache = new Map();

export function usePretext() {
  function measure(text: string, options: MeasureOptions = {}) {
    const key = JSON.stringify({ text, options });

    if (cache.has(key)) return cache.get(key);

    const prepared = prepare({
      text,
      ...options,
    });

    const result = layout(prepared);

    cache.set(key, result);

    return result;
  }

  return {
    measure,
  };
}
