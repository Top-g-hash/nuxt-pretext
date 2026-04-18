<script setup lang="ts">
import { ref, computed } from "vue";

const containerRef = ref<HTMLElement | null>(null);
const liveText = ref(
  "Resize me.\nPretext measures this\nbefore DOM touches it.",
);
const inputText = ref(
  "The quick brown fox jumps over the lazy dog. Pretext handles every language: 春天到了. بدأت الرحلة 🚀",
);
const inputWidth = ref(320);
const inputFont = ref("16px 'DM Mono'");
const inputLineHeight = ref(24);

const { measure } = usePretext();
const { result: resizeResult } = usePretextResize(containerRef, liveText, {
  font: "15px 'DM Mono'",
  lineHeight: 22,
});

const measured = computed(() =>
  measure(inputText.value, {
    width: inputWidth.value,
    font: inputFont.value,
    lineHeight: inputLineHeight.value,
  }),
);

const canvasText = ref("Canvas output.\nSharp at any DPR.");
</script>

<template>
  <div class="lab">
    <!-- grid background -->
    <div class="grid-bg" aria-hidden="true" />

    <header class="lab-header">
      <div class="logo-mark">PT</div>
      <div class="lab-title">
        <span class="label">nuxt-pretext</span>
        <span class="subtitle">measurement lab</span>
      </div>
      <div class="status-bar">
        <span class="dot green" />
        <span class="status-text">all systems nominal</span>
      </div>
    </header>

    <main class="lab-grid">
      <!-- ── 1. usePretext ── -->
      <section class="card span-2" data-index="01">
        <div class="card-header">
          <span class="card-tag">composable</span>
          <h2>usePretext()</h2>
        </div>
        <div class="card-body split">
          <div class="controls">
            <label class="field">
              <span>text input</span>
              <textarea v-model="inputText" rows="3" />
            </label>
            <div class="row-fields">
              <label class="field small">
                <span>width px</span>
                <input
                  v-model.number="inputWidth"
                  type="number"
                  min="80"
                  max="800"
                />
              </label>
              <label class="field small">
                <span>line height</span>
                <input
                  v-model.number="inputLineHeight"
                  type="number"
                  min="12"
                  max="60"
                />
              </label>
            </div>
            <label class="field">
              <span>font</span>
              <input v-model="inputFont" type="text" />
            </label>
          </div>
          <div class="output-panel">
            <div class="metric-row">
              <div class="metric">
                <span class="metric-val">{{ measured.height }}</span>
                <span class="metric-label">height px</span>
              </div>
              <div class="metric">
                <span class="metric-val">{{ measured.lineCount }}</span>
                <span class="metric-label">lines</span>
              </div>
              <div class="metric">
                <span class="metric-val">{{ inputWidth }}</span>
                <span class="metric-label">max width</span>
              </div>
            </div>
            <div
              class="line-preview"
              :style="{ width: inputWidth + 'px', maxWidth: '100%' }"
            >
              <div
                v-for="(line, i) in measured.lines"
                :key="i"
                class="line-item"
                :style="{
                  height: inputLineHeight + 'px',
                  lineHeight: inputLineHeight + 'px',
                }"
              >
                <span class="line-num">{{
                  String(i + 1).padStart(2, "0")
                }}</span>
                <span class="line-text">{{ line.text }}</span>
                <span class="line-width">{{ Math.round(line.width) }}px</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- ── 2. usePretextResize ── -->
      <section class="card" data-index="02">
        <div class="card-header">
          <span class="card-tag">composable</span>
          <h2>usePretextResize()</h2>
        </div>
        <div class="card-body">
          <label class="field">
            <span>live text</span>
            <textarea v-model="liveText" rows="3" />
          </label>
          <div class="resize-container" ref="containerRef">
            <div class="resize-hint">↔ drag edge to resize</div>
            <div class="resize-metrics">
              <span>{{ resizeResult.lineCount }} lines</span>
              <span>{{ resizeResult.height }}px tall</span>
            </div>
            <div
              v-for="(line, i) in resizeResult.lines"
              :key="i"
              class="resize-line"
            >
              {{ line.text }}
            </div>
          </div>
        </div>
      </section>

      <!-- ── 3. PretextText ── -->
      <section class="card" data-index="03">
        <div class="card-header">
          <span class="card-tag">component</span>
          <h2>&lt;PretextText /&gt;</h2>
        </div>
        <div class="card-body">
          <p class="desc">
            DOM lines. SSR placeholder holds space before hydration.
          </p>
          <div class="component-demo">
            <PretextText
              text="This paragraph is measured before DOM renders. Each line is a separate div — perfect for virtualization, animations, or per-line effects."
              :width="260"
              font="15px 'DM Mono'"
              :line-height="22"
              class="pretext-text-demo"
            />
            <div class="demo-ruler" :style="{ width: '260px' }">
              <span>260px</span>
            </div>
          </div>
        </div>
      </section>

      <!-- ── 4. PretextCanvas ── -->
      <section class="card" data-index="04">
        <div class="card-header">
          <span class="card-tag">component</span>
          <h2>&lt;PretextCanvas /&gt;</h2>
        </div>
        <div class="card-body">
          <label class="field">
            <span>canvas text</span>
            <textarea v-model="canvasText" rows="2" />
          </label>
          <div class="canvas-demo">
            <PretextCanvas
              :text="canvasText"
              :width="300"
              font="bold 15px 'DM Mono'"
              :line-height="24"
              color="#e2ff5d"
              class="canvas-el"
            />
          </div>
          <p class="desc">No DOM layout. No reflow. Pure canvas.</p>
        </div>
      </section>

      <!-- ── 5. v-pretext ── -->
      <section class="card span-2" data-index="05">
        <div class="card-header">
          <span class="card-tag">directive</span>
          <h2>v-pretext</h2>
        </div>
        <div class="card-body directive-demo">
          <div class="directive-col">
            <span class="col-label">with v-pretext</span>
            <div
              v-pretext="{ font: '15px DM Mono', lineHeight: 20 }"
              class="directive-box with"
            >
              This div's <code>min-height</code> is set before content renders —
              no layout shift on hydration.
            </div>
          </div>
          <div class="directive-col">
            <span class="col-label">without v-pretext</span>
            <div class="directive-box without">
              This div has no reserved height. On SSR it collapses to zero,
              causing a visible jump.
            </div>
          </div>
        </div>
      </section>
    </main>

    <footer class="lab-footer">
      <span>nuxt-pretext playground</span>
      <span>pretext measures before DOM</span>
    </footer>
  </div>
</template>

<style>
@import url("https://fonts.googleapis.com/css2?family=DM+Mono:ital,wght@0,300;0,400;0,500;1,400&family=Syne:wght@700;800&display=swap");

*,
*::before,
*::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

:root {
  --bg: #0b0c0e;
  --surface: #111316;
  --surface-2: #191c21;
  --border: #252830;
  --border-bright: #353a44;
  --accent: #e2ff5d;
  --accent-dim: rgba(226, 255, 93, 0.12);
  --text-1: #e8eaf0;
  --text-2: #7a8194;
  --text-3: #454c5e;
  --green: #4fffb0;
  --red: #ff4f6e;
  --mono: "DM Mono", monospace;
  --display: "Syne", sans-serif;
  --radius: 6px;
}

body {
  background: var(--bg);
  color: var(--text-1);
  font-family: var(--mono);
}

/* ── layout ── */
.lab {
  min-height: 100vh;
  position: relative;
  overflow-x: hidden;
}

.grid-bg {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 0;
  background-image:
    linear-gradient(var(--border) 1px, transparent 1px),
    linear-gradient(90deg, var(--border) 1px, transparent 1px);
  background-size: 40px 40px;
  mask-image: radial-gradient(
    ellipse 80% 80% at 50% 0%,
    black 40%,
    transparent 100%
  );
  opacity: 0.5;
}

.lab-header {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px 32px;
  border-bottom: 1px solid var(--border);
  background: rgba(11, 12, 14, 0.8);
  backdrop-filter: blur(12px);
  position: sticky;
  top: 0;
}

.logo-mark {
  width: 36px;
  height: 36px;
  background: var(--accent);
  color: var(--bg);
  font-family: var(--display);
  font-size: 13px;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  letter-spacing: -0.5px;
}

.lab-title {
  display: flex;
  flex-direction: column;
  gap: 1px;
}
.lab-title .label {
  font-family: var(--display);
  font-size: 16px;
  font-weight: 700;
  color: var(--text-1);
}
.lab-title .subtitle {
  font-size: 11px;
  color: var(--text-3);
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.status-bar {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 8px;
}
.dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
}
.dot.green {
  background: var(--green);
  box-shadow: 0 0 6px var(--green);
  animation: pulse 2s infinite;
}
.status-text {
  font-size: 11px;
  color: var(--text-3);
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.4;
  }
}

/* ── grid ── */
.lab-grid {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1px;
  background: var(--border);
  padding: 0;
}

/* ── cards ── */
.card {
  background: var(--surface);
  padding: 28px;
  transition: background 0.2s;
}
.card:hover {
  background: var(--surface-2);
}
.card.span-2 {
  grid-column: span 2;
}

.card-header {
  display: flex;
  align-items: baseline;
  gap: 12px;
  margin-bottom: 20px;
  padding-bottom: 14px;
  border-bottom: 1px solid var(--border);
}
.card-tag {
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--accent);
  background: var(--accent-dim);
  padding: 2px 8px;
  border-radius: 99px;
}
.card-header h2 {
  font-family: var(--display);
  font-size: 17px;
  font-weight: 700;
  color: var(--text-1);
  letter-spacing: -0.3px;
}

/* ── data-index marker ── */
.card::before {
  content: attr(data-index);
  position: absolute;
  top: 28px;
  right: 28px;
  font-size: 11px;
  color: var(--text-3);
  font-family: var(--display);
}
.card {
  position: relative;
}

/* ── fields ── */
.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 11px;
  color: var(--text-3);
  text-transform: uppercase;
  letter-spacing: 0.07em;
}
.field textarea,
.field input {
  background: var(--bg);
  border: 1px solid var(--border-bright);
  color: var(--text-1);
  font-family: var(--mono);
  font-size: 13px;
  padding: 8px 10px;
  border-radius: var(--radius);
  outline: none;
  resize: vertical;
  transition: border-color 0.15s;
}
.field textarea:focus,
.field input:focus {
  border-color: var(--accent);
}
.field.small {
  flex: 1;
}
.row-fields {
  display: flex;
  gap: 12px;
}
.controls {
  display: flex;
  flex-direction: column;
  gap: 14px;
  min-width: 240px;
}

/* ── split layout for card 01 ── */
.split {
  display: flex;
  gap: 28px;
}

/* ── metrics ── */
.metric-row {
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
}
.metric {
  flex: 1;
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 12px 14px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.metric-val {
  font-family: var(--display);
  font-size: 26px;
  font-weight: 800;
  color: var(--accent);
  letter-spacing: -1px;
}
.metric-label {
  font-size: 10px;
  color: var(--text-3);
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

/* ── line preview ── */
.line-preview {
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  overflow: hidden;
}
.line-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 10px;
  border-bottom: 1px solid var(--border);
  font-size: 12px;
}
.line-item:last-child {
  border-bottom: none;
}
.line-num {
  color: var(--text-3);
  width: 20px;
  flex-shrink: 0;
}
.line-text {
  flex: 1;
  color: var(--text-1);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.line-width {
  color: var(--accent);
  font-size: 11px;
  flex-shrink: 0;
}

/* ── resize container ── */
.resize-container {
  background: var(--bg);
  border: 1px solid var(--border-bright);
  border-radius: var(--radius);
  padding: 14px;
  resize: horizontal;
  overflow: auto;
  min-width: 120px;
  max-width: 100%;
  width: 280px;
}
.resize-hint {
  font-size: 10px;
  color: var(--text-3);
  text-align: right;
  margin-bottom: 8px;
  text-transform: uppercase;
  letter-spacing: 0.07em;
}
.resize-metrics {
  display: flex;
  gap: 12px;
  margin-bottom: 10px;
  font-size: 11px;
  color: var(--accent);
}
.resize-line {
  font-size: 14px;
  color: var(--text-1);
  line-height: 22px;
  border-left: 2px solid var(--border);
  padding-left: 8px;
  margin-bottom: 2px;
}

/* ── PretextText demo ── */
.component-demo {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.pretext-text-demo {
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 12px;
  font-size: 15px;
  color: var(--text-1);
  line-height: 22px;
}
.demo-ruler {
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  border-top: 1px solid var(--accent);
  border-right: 1px solid var(--accent);
  border-left: 1px solid var(--accent);
  padding: 4px 4px 0;
  font-size: 10px;
  color: var(--accent);
  text-transform: uppercase;
}

/* ── Canvas demo ── */
.canvas-demo {
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 16px;
  margin-bottom: 10px;
}
.canvas-el {
  display: block;
}

/* ── directive demo ── */
.directive-demo {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}
.directive-col {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.col-label {
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--text-3);
}
.directive-box {
  border-radius: var(--radius);
  padding: 14px;
  font-size: 13px;
  line-height: 20px;
  color: var(--text-1);
}
.directive-box.with {
  background: var(--accent-dim);
  border: 1px solid rgba(226, 255, 93, 0.3);
}
.directive-box.without {
  background: var(--bg);
  border: 1px solid var(--border);
}
.directive-box code {
  color: var(--accent);
  font-family: var(--mono);
}

/* ── misc ── */
.desc {
  font-size: 12px;
  color: var(--text-3);
  margin-bottom: 12px;
  line-height: 1.6;
}
.card-body {
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.output-panel {
  flex: 1;
  min-width: 0;
}

.lab-footer {
  position: relative;
  z-index: 1;
  display: flex;
  justify-content: space-between;
  padding: 14px 32px;
  border-top: 1px solid var(--border);
  font-size: 11px;
  color: var(--text-3);
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

@media (max-width: 768px) {
  .lab-grid {
    grid-template-columns: 1fr;
  }
  .card.span-2 {
    grid-column: span 1;
  }
  .split {
    flex-direction: column;
  }
  .directive-demo {
    grid-template-columns: 1fr;
  }
}
</style>
