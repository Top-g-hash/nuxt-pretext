// src/runtime/composable/usePretextResize.ts
import { ref, onMounted, onUnmounted, type Ref } from "vue";
import { usePretext } from "./usePretext";

type ResizeOptions = {
  font?: string;
  lineHeight?: number;
};

export function usePretextResize(
  containerRef: Ref<HTMLElement | null>,
  text: Ref<string> | string,
  options: ResizeOptions = {},
) {
  const { measure } = usePretext();
  const result = ref<{ lines: any[]; height: number; lineCount: number }>({
    lines: [],
    height: 0,
    lineCount: 0,
  });

  let observer: ResizeObserver | null = null;

  function recalculate(width: number) {
    const t = typeof text === "string" ? text : text.value;
    result.value = measure(t, { width, ...options });
  }

  onMounted(() => {
    if (!containerRef.value) return;
    observer = new ResizeObserver(([entry]) => {
      recalculate(entry.contentRect.width);
    });
    observer.observe(containerRef.value);
    recalculate(containerRef.value.offsetWidth);
  });

  onUnmounted(() => observer?.disconnect());

  return { result };
}
