import { prepare, layout } from "pretext";

export function usePretext() {
  function measure(text: string, options: any = {}) {
    const prepared = prepare({
      text,
      ...options,
    });

    return layout(prepared);
  }

  return {
    measure,
  };
}
