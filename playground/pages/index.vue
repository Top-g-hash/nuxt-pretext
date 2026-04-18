<!-- playground/pages/index.vue -->
<script setup lang="ts">
import { ref } from "vue";

const containerRef = ref<HTMLElement | null>(null);
const dynamicText = ref("Resize the window to see this reflow responsively.");

const { result: resizeResult } = usePretextResize(containerRef, dynamicText, {
  font: "16px Inter",
  lineHeight: 22,
});

const { measure } = usePretext();
const measured = measure("Hello from usePretext()", {
  width: 260,
  font: "16px Inter",
  lineHeight: 20,
});
</script>

<template>
  <div style="padding: 40px; font-family: Inter, sans-serif; max-width: 600px">
    <h1>nuxt-pretext verification</h1>

    <!-- 1. usePretext -->
    <section>
      <h2>1. usePretext()</h2>
      <pre>{{ measured }}</pre>
    </section>

    <!-- 2. usePretextResize -->
    <section>
      <h2>2. usePretextResize()</h2>
      <div ref="containerRef" style="border: 1px dashed #ccc; padding: 8px">
        <p>
          Lines: {{ resizeResult.lineCount }} | Height:
          {{ resizeResult.height }}px
        </p>
        <div v-for="(line, i) in resizeResult.lines" :key="i">
          {{ line.text }}
        </div>
      </div>
    </section>

    <!-- 3. PretextText -->
    <section>
      <h2>3. &lt;PretextText /&gt;</h2>
      <PretextText
        text="This is rendered via PretextText component with DOM lines."
        :width="400"
        font="16px Inter"
        :line-height="22"
        style="border: 1px dashed #ccc; padding: 8px"
      />
    </section>

    <!-- 4. PretextCanvas -->
    <section>
      <h2>4. &lt;PretextCanvas /&gt;</h2>
      <PretextCanvas
        text="Canvas rendered text — crisp & sharp."
        :width="400"
        font="bold 16px Inter"
        :line-height="24"
        color="#1a1a2e"
        style="border: 1px dashed #ccc"
      />
    </section>

    <!-- 5. v-pretext directive -->
    <section>
      <h2>5. v-pretext directive</h2>
      <div
        v-pretext="{ font: '16px Inter', lineHeight: 20 }"
        style="border: 1px dashed #ccc; padding: 8px; background: #f9f9f9"
      >
        This div has min-height set by v-pretext before any content renders.
      </div>
    </section>
  </div>
</template>
