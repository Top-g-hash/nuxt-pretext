<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from "vue";

// ── shared text ──────────────────────────────────────────────
const demoText = ref(
  "Pretext measures text before it ever touches the DOM. This means no reflow, no layout thrash, and perfect height reservation on SSR.",
);
const demoWidth = ref(300);
const demoFont = ref("15px 'DM Mono'");
const demoLineH = ref(22);

const EMPTY_RESULT = {
  height: 0,
  lineCount: 0,
  lines: [],
};

// ── 1. usePretext vs getBoundingClientRect ───────────────────
const { measure } = usePretext();
// playground/pages/index.vue
const pretextResult = computed(() => {
  if (import.meta.server) return EMPTY_RESULT; // ← belt-and-suspenders
  return measure(demoText.value, {
    width: demoWidth.value,
    font: demoFont.value,
    lineHeight: demoLineH.value,
  });
});

const domRef = ref<HTMLElement | null>(null);
const domHeight = ref<number | null>(null);
const domLines = ref<number | null>(null);
const domMeasureMs = ref<number | null>(null);
const ptMeasureMs = ref<number | null>(null);

function measureDOM() {
  if (!domRef.value || demoLineH.value <= 0) return;
  if (!domRef.value) return;
  const t0 = performance.now();
  void domRef.value.getBoundingClientRect();
  domHeight.value = domRef.value.offsetHeight;
  domLines.value = Math.round(domRef.value.offsetHeight / demoLineH.value);
  domMeasureMs.value = +(performance.now() - t0).toFixed(3);
}

function measurePT() {
  const t0 = performance.now();
  measure(demoText.value, {
    width: demoWidth.value,
    font: demoFont.value,
    lineHeight: demoLineH.value,
  });
  ptMeasureMs.value = +(performance.now() - t0).toFixed(3);
}

onMounted(() =>
  nextTick(() => {
    measureDOM();
    measurePT();
  }),
);
watch([demoText, demoWidth, demoLineH], () => {
  if (demoWidth.value <= 0) return; // ← add this
  nextTick(() => {
    measureDOM();
    measurePT();
  });
});

// ── 2. usePretextResize vs ResizeObserver + offsetHeight ─────
const containerRef = ref<HTMLElement | null>(null);
const domResizeRef = ref<HTMLElement | null>(null);
const domResizeW = ref(0);
const domResizeH = ref(0);
const domResizeCount = ref(0);
const ptResizeCount = ref(0);

const { result: resizeResult } = usePretextResize(containerRef, demoText, {
  font: demoFont.value,
  lineHeight: demoLineH.value,
});
watch(resizeResult, () => {
  ptResizeCount.value++;
});

let domRO: ResizeObserver | null = null;
onMounted(() => {
  if (!domResizeRef.value) return;
  domRO = new ResizeObserver(([entry]) => {
    domResizeCount.value++;
    domResizeW.value = Math.round(entry.contentRect.width);
    domResizeH.value = domResizeRef.value?.offsetHeight ?? 0;
  });
  domRO.observe(domResizeRef.value);
});
onUnmounted(() => domRO?.disconnect());

// ── 4. SSR hydration jump simulation ─────────────────────────
const showHydrationJump = ref(false);
const jumpHappened = ref(false);

function simulateJump() {
  showHydrationJump.value = false;
  jumpHappened.value = false;
  setTimeout(() => {
    showHydrationJump.value = true;
    jumpHappened.value = true;
  }, 700);
}
onMounted(simulateJump);
</script>

<template>
  <div class="lab">
    <div class="grid-bg" aria-hidden="true" />

    <header class="lab-header">
      <div class="logo-mark">PT</div>
      <div class="lab-title">
        <span class="name">nuxt-pretext</span>
        <span class="sub">DOM vs Pretext · measurement lab</span>
      </div>
      <div class="status">
        <span class="dot" /><span>all systems nominal</span>
      </div>
    </header>

    <!-- global controls -->
    <div class="controls-bar">
      <label class="ctrl">
        <span>text input</span>
        <textarea v-model="demoText" rows="2" />
      </label>
      <label class="ctrl narrow">
        <span>width — {{ demoWidth }}px</span>
        <input v-model.number="demoWidth" type="range" min="120" max="520" />
      </label>
      <label class="ctrl narrow">
        <span>line-height — {{ demoLineH }}px</span>
        <input v-model.number="demoLineH" type="range" min="14" max="48" />
      </label>
    </div>

    <main class="lab-body">
      <!-- ═══ 01 usePretext vs getBoundingClientRect ═══ -->
      <section class="comparison">
        <div class="comp-header">
          <span class="comp-num">01</span>
          <div>
            <h2>usePretext() vs getBoundingClientRect</h2>
            <p>
              Can you know height <em>before</em> the element is in the DOM?
            </p>
          </div>
        </div>
        <div class="comp-grid">
          <div class="side">
            <div class="side-label bad">
              <svg width="8" height="8" viewBox="0 0 8 8">
                <circle cx="4" cy="4" r="4" fill="#ff4f6e" />
              </svg>
              Native DOM
            </div>
            <div class="code-block">
              <pre>
// must be mounted first
const h = el.getBoundingClientRect().height
// ↑ triggers layout reflow</pre
              >
            </div>
            <div class="live-box dom-box">
              <div
                ref="domRef"
                :style="{
                  width: demoWidth + 'px',
                  lineHeight: demoLineH + 'px',
                  fontFamily: `'DM Mono',monospace`,
                  fontSize: '15px',
                }"
              >
                {{ demoText }}
              </div>
            </div>
            <div class="pills">
              <div class="pill bad">
                <span class="pv">{{ domHeight ?? "—" }}<small>px</small></span
                ><span class="pl">height (post-reflow)</span>
              </div>
              <div class="pill bad">
                <span class="pv">{{ domLines ?? "—" }}</span
                ><span class="pl">est. lines</span>
              </div>
              <div class="pill bad timing">
                <span class="pv"
                  >{{ domMeasureMs ?? "—" }}<small>ms</small></span
                ><span class="pl">reflow cost</span>
              </div>
            </div>
            <div class="tag bad-tag">
              ⚠ needs mounted element · blocks render · causes layout shift
            </div>
          </div>

          <div class="vs"><span>VS</span></div>

          <div class="side">
            <div class="side-label good">
              <svg width="8" height="8" viewBox="0 0 8 8">
                <circle cx="4" cy="4" r="4" fill="#4fffb0" />
              </svg>
              usePretext()
            </div>
            <div class="code-block">
              <pre>
// works before mounting
const { measure } = usePretext()
const { height, lineCount, lines }
  = measure(text, { width, font, lineHeight })</pre
              >
            </div>
            <div class="live-box pt-box" :style="{ width: demoWidth + 'px' }">
              <div
                v-for="(line, i) in pretextResult.lines"
                :key="i"
                class="ptl"
                :style="{
                  height: demoLineH + 'px',
                  lineHeight: demoLineH + 'px',
                }"
              >
                <span class="ptl-n">{{ i + 1 }}</span>
                <span class="ptl-t">{{ line.text }}</span>
                <span class="ptl-w">{{ Math.round(line.width) }}px</span>
              </div>
            </div>
            <div class="pills">
              <div class="pill good">
                <span class="pv"
                  >{{ pretextResult.height }}<small>px</small></span
                ><span class="pl">height (no DOM)</span>
              </div>
              <div class="pill good">
                <span class="pv">{{ pretextResult.lineCount }}</span
                ><span class="pl">exact lines</span>
              </div>
              <div class="pill good timing">
                <span class="pv">{{ ptMeasureMs ?? "—" }}<small>ms</small></span
                ><span class="pl">layout() cost</span>
              </div>
            </div>
            <div class="tag good-tag">
              ✓ runs in setup() · SSR safe · exact line strings
            </div>
          </div>
        </div>
      </section>

      <!-- ═══ 02 usePretextResize vs ResizeObserver ═══ -->
      <section class="comparison">
        <div class="comp-header">
          <span class="comp-num">02</span>
          <div>
            <h2>usePretextResize() vs ResizeObserver</h2>
            <p>
              Drag the <em>right edge</em> of each box and watch what each
              approach knows.
            </p>
          </div>
        </div>
        <div class="comp-grid">
          <div class="side">
            <div class="side-label bad">
              <svg width="8" height="8" viewBox="0 0 8 8">
                <circle cx="4" cy="4" r="4" fill="#ff4f6e" />
              </svg>
              ResizeObserver + offsetHeight
            </div>
            <div class="code-block">
              <pre>
new ResizeObserver(([e]) => {
  const w = e.contentRect.width // ✓
  const h = el.offsetHeight     // reflow!
  // line count? impossible ✗
})</pre
              >
            </div>
            <div
              ref="domResizeRef"
              class="rbox dom-rbox"
              :style="{
                fontFamily: `'DM Mono',monospace`,
                fontSize: '14px',
                lineHeight: demoLineH + 'px',
              }"
            >
              {{ demoText }}
            </div>
            <div class="pills">
              <div class="pill bad">
                <span class="pv">{{ domResizeW }}<small>px</small></span
                ><span class="pl">width</span>
              </div>
              <div class="pill bad">
                <span class="pv">{{ domResizeH }}<small>px</small></span
                ><span class="pl">height (reflow)</span>
              </div>
              <div class="pill bad">
                <span class="pv">?</span><span class="pl">line count</span>
              </div>
            </div>
            <div class="counter bad-counter">
              {{ domResizeCount }} reflows triggered
            </div>
          </div>

          <div class="vs"><span>VS</span></div>

          <div class="side">
            <div class="side-label good">
              <svg width="8" height="8" viewBox="0 0 8 8">
                <circle cx="4" cy="4" r="4" fill="#4fffb0" />
              </svg>
              usePretextResize()
            </div>
            <div class="code-block">
              <pre>
const { result } = usePretextResize(
  ref, text, { font, lineHeight }
)
// result.lines · result.height · result.lineCount</pre
              >
            </div>
            <div ref="containerRef" class="rbox pt-rbox">
              <div class="rbox-meta">
                <span>{{ resizeResult.lineCount }} lines</span>
                <span>{{ resizeResult.height }}px</span>
                <span class="drag-h">drag edge →</span>
              </div>
              <div
                v-for="(line, i) in resizeResult.lines"
                :key="i"
                class="rline"
                :style="{ lineHeight: demoLineH + 'px' }"
              >
                <span
                  class="rbar"
                  :style="{
                    width: (line.width / (demoWidth || 1)) * 100 + '%',
                  }"
                />
                <span class="rtxt">{{ line.text }}</span>
              </div>
            </div>
            <div class="pills">
              <div class="pill good">
                <span class="pv">{{ resizeResult.lineCount }}</span
                ><span class="pl">exact lines</span>
              </div>
              <div class="pill good">
                <span class="pv"
                  >{{ resizeResult.height }}<small>px</small></span
                ><span class="pl">exact height</span>
              </div>
              <div class="pill good">
                <span class="pv">✓</span><span class="pl">line strings</span>
              </div>
            </div>
            <div class="counter good-counter">
              {{ ptResizeCount }} pretext recalculations
            </div>
          </div>
        </div>
      </section>

      <!-- ═══ 03 PretextText vs plain <p> ═══ -->
      <section class="comparison">
        <div class="comp-header">
          <span class="comp-num">03</span>
          <div>
            <h2>&lt;PretextText&gt; vs &lt;p&gt;</h2>
            <p>
              Visually identical — the difference is what data you get
              <em>before</em> paint.
            </p>
          </div>
        </div>
        <div class="comp-grid">
          <div class="side">
            <div class="side-label bad">
              <svg width="8" height="8" viewBox="0 0 8 8">
                <circle cx="4" cy="4" r="4" fill="#ff4f6e" />
              </svg>
              Plain &lt;p&gt; tag
            </div>
            <div class="code-block">
              <pre>
&lt;p :style="{ width: '300px' }"&gt;
  {{ "{{ text }}" }}
&lt;/p&gt;</pre
              >
            </div>
            <div class="text-wrap dom-text-wrap">
              <p
                class="dom-p"
                :style="{
                  width: demoWidth + 'px',
                  lineHeight: demoLineH + 'px',
                }"
              >
                {{ demoText }}
              </p>
            </div>
            <div class="data-panel bad-data">
              <div class="dp-row">
                <span class="dpk">lines</span
                ><span class="dpv red">unknown until painted</span>
              </div>
              <div class="dp-row">
                <span class="dpk">height</span
                ><span class="dpv red">unknown until painted</span>
              </div>
              <div class="dp-row">
                <span class="dpk">line[0].text</span
                ><span class="dpv red">unknown until painted</span>
              </div>
              <div class="dp-row">
                <span class="dpk">per-line widths</span
                ><span class="dpv red">impossible without JS</span>
              </div>
            </div>
          </div>

          <div class="vs"><span>VS</span></div>

          <div class="side">
            <div class="side-label good">
              <svg width="8" height="8" viewBox="0 0 8 8">
                <circle cx="4" cy="4" r="4" fill="#4fffb0" />
              </svg>
              &lt;PretextText&gt;
            </div>
            <div class="code-block">
              <pre>
&lt;PretextText :text="text"
  :width="300" font="15px DM Mono"
  :line-height="22" /&gt;</pre
              >
            </div>
            <div class="text-wrap pt-text-wrap">
              <PretextText
                :text="demoText"
                :width="demoWidth"
                :font="demoFont"
                :line-height="demoLineH"
                class="pttext"
                :style="{ lineHeight: demoLineH + 'px' }"
              />
            </div>
            <div class="data-panel good-data">
              <div class="dp-row">
                <span class="dpk">lines</span
                ><span class="dpv green">{{ pretextResult.lineCount }}</span>
              </div>
              <div class="dp-row">
                <span class="dpk">height</span
                ><span class="dpv green">{{ pretextResult.height }}px</span>
              </div>
              <div class="dp-row">
                <span class="dpk">line[0].text</span
                ><span class="dpv green"
                  >"{{ pretextResult.lines[0]?.text?.slice(0, 28) }}…"</span
                >
              </div>
              <div class="dp-row">
                <span class="dpk">line[0].width</span
                ><span class="dpv green"
                  >{{ Math.round(pretextResult.lines[0]?.width ?? 0) }}px</span
                >
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- ═══ 04 SSR hydration jump ═══ -->
      <section class="comparison">
        <div class="comp-header">
          <span class="comp-num">04</span>
          <div>
            <h2>SSR hydration jump · v-pretext</h2>
            <p>
              Content below the text block shifts when height isn't reserved in
              advance.
            </p>
          </div>
          <button class="replay" @click="simulateJump">↺ replay</button>
        </div>
        <div class="comp-grid">
          <div class="side">
            <div class="side-label bad">
              <svg width="8" height="8" viewBox="0 0 8 8">
                <circle cx="4" cy="4" r="4" fill="#ff4f6e" />
              </svg>
              No height reservation
            </div>
            <div class="browser-mock">
              <div class="brow-bar" />
              <div class="brow-body">
                <div
                  class="sk"
                  style="height: 10px; width: 55%; margin-bottom: 8px"
                />
                <div
                  class="sk"
                  style="height: 10px; width: 85%; margin-bottom: 8px"
                />
                <div
                  class="ssr-text no-res"
                  :class="{ loaded: showHydrationJump }"
                  :style="{ lineHeight: '18px' }"
                >
                  <template v-if="showHydrationJump"
                    >{{ demoText.slice(0, 100) }}...</template
                  >
                </div>
                <div
                  class="sk below"
                  :class="{ jumped: jumpHappened && showHydrationJump }"
                  style="height: 10px; width: 70%; margin-top: 6px"
                >
                  <span v-if="jumpHappened && showHydrationJump" class="jlabel"
                    >↑ layout shift!</span
                  >
                </div>
                <div
                  class="sk"
                  style="height: 10px; width: 45%; margin-top: 6px"
                />
              </div>
            </div>
            <div class="tag bad-tag">
              text loads → height expands → content below jumps
            </div>
          </div>

          <div class="vs"><span>VS</span></div>

          <div class="side">
            <div class="side-label good">
              <svg width="8" height="8" viewBox="0 0 8 8">
                <circle cx="4" cy="4" r="4" fill="#4fffb0" />
              </svg>
              v-pretext · height reserved
            </div>
            <div class="browser-mock">
              <div class="brow-bar" />
              <div class="brow-body">
                <div
                  class="sk"
                  style="height: 10px; width: 55%; margin-bottom: 8px"
                />
                <div
                  class="sk"
                  style="height: 10px; width: 85%; margin-bottom: 8px"
                />
                <div
                  class="ssr-text with-res"
                  :class="{ loaded: showHydrationJump }"
                  :style="{
                    minHeight: pretextResult.height + 'px',
                    lineHeight: '18px',
                  }"
                  v-pretext="{ font: demoFont, lineHeight: demoLineH }"
                >
                  <template v-if="showHydrationJump"
                    >{{ demoText.slice(0, 100) }}...</template
                  >
                </div>
                <div
                  class="sk stable"
                  style="height: 10px; width: 70%; margin-top: 6px"
                >
                  <span class="slabel">✓ stayed in place</span>
                </div>
                <div
                  class="sk"
                  style="height: 10px; width: 45%; margin-top: 6px"
                />
              </div>
            </div>
            <div class="tag good-tag">
              height reserved → no shift → smooth hydration
            </div>
          </div>
        </div>
      </section>

      <!-- ═══ 05 PretextCanvas vs DOM text ═══ -->
      <section class="comparison">
        <div class="comp-header">
          <span class="comp-num">05</span>
          <div>
            <h2>&lt;PretextCanvas&gt; vs DOM text</h2>
            <p>
              Same output — one triggers the full layout pipeline, one goes
              <em>straight to paint</em>.
            </p>
          </div>
        </div>
        <div class="comp-grid">
          <div class="side">
            <div class="side-label bad">
              <svg width="8" height="8" viewBox="0 0 8 8">
                <circle cx="4" cy="4" r="4" fill="#ff4f6e" />
              </svg>
              DOM text
            </div>
            <div class="code-block">
              <pre>
&lt;p&gt;text&lt;/p&gt;
// pipeline: style → layout → paint
// layout runs on every change</pre
              >
            </div>
            <div class="canvas-wrap dom-canvas-wrap">
              <p
                class="dom-canvas-p"
                :style="{
                  width: demoWidth + 'px',
                  lineHeight: demoLineH + 'px',
                  fontFamily: `'DM Mono',monospace`,
                  fontSize: '15px',
                }"
              >
                {{ demoText }}
              </p>
            </div>
            <div class="pipeline">
              <span class="pipe-step active">Style</span>
              <span class="pipe-arrow">→</span>
              <span class="pipe-step active">Layout ⚠</span>
              <span class="pipe-arrow">→</span>
              <span class="pipe-step active">Paint</span>
            </div>
          </div>

          <div class="vs"><span>VS</span></div>

          <div class="side">
            <div class="side-label good">
              <svg width="8" height="8" viewBox="0 0 8 8">
                <circle cx="4" cy="4" r="4" fill="#4fffb0" />
              </svg>
              &lt;PretextCanvas&gt;
            </div>
            <div class="code-block">
              <pre>
&lt;PretextCanvas :text="text"
  :width="300" color="#e2ff5d" /&gt;
// skips layout entirely</pre
              >
            </div>
            <div class="canvas-wrap pt-canvas-wrap">
              <PretextCanvas
                :text="demoText"
                :width="demoWidth"
                :font="demoFont"
                :line-height="demoLineH"
                color="#e2ff5d"
              />
            </div>
            <div class="pipeline">
              <span class="pipe-step dim">Style</span>
              <span class="pipe-arrow dim">→</span>
              <span class="pipe-step dim">Layout <s>skipped</s></span>
              <span class="pipe-arrow">→</span>
              <span class="pipe-step active">Paint ✓</span>
            </div>
          </div>
        </div>
      </section>
    </main>

    <footer class="lab-footer">
      <span>nuxt-pretext playground</span>
      <span>pretext knows before DOM does</span>
    </footer>
  </div>
</template>

<style>
@import url("https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=Syne:wght@700;800&display=swap");

*,
*::before,
*::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

:root {
  --bg: #0b0c0e;
  --s1: #0f1115;
  --s2: #161a20;
  --b1: #1f2228;
  --b2: #2d3340;
  --acc: #e2ff5d;
  --grn: #4fffb0;
  --red: #ff4f6e;
  --t1: #dde0eb;
  --t2: #6b7385;
  --t3: #3a3f4d;
  --mono: "DM Mono", monospace;
  --disp: "Syne", sans-serif;
  --r: 6px;
}

body {
  background: var(--bg);
  color: var(--t1);
  font-family: var(--mono);
  font-size: 14px;
}

.grid-bg {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 0;
  background-image:
    linear-gradient(var(--b1) 1px, transparent 1px),
    linear-gradient(90deg, var(--b1) 1px, transparent 1px);
  background-size: 36px 36px;
  mask-image: radial-gradient(ellipse 90% 60% at 50% 0, black, transparent);
  opacity: 0.6;
}

/* header */
.lab-header {
  position: sticky;
  top: 0;
  z-index: 10;
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px 32px;
  border-bottom: 1px solid var(--b1);
  background: rgba(11, 12, 14, 0.9);
  backdrop-filter: blur(16px);
}
.logo-mark {
  width: 34px;
  height: 34px;
  border-radius: 4px;
  background: var(--acc);
  color: #0b0c0e;
  font-family: var(--disp);
  font-size: 12px;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
}
.lab-title {
  display: flex;
  flex-direction: column;
  gap: 1px;
}
.lab-title .name {
  font-family: var(--disp);
  font-size: 15px;
  font-weight: 700;
}
.lab-title .sub {
  font-size: 10px;
  color: var(--t2);
  text-transform: uppercase;
  letter-spacing: 0.08em;
}
.status {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 7px;
  font-size: 10px;
  color: var(--t2);
  text-transform: uppercase;
  letter-spacing: 0.08em;
}
.dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--grn);
  box-shadow: 0 0 6px var(--grn);
  animation: blink 2s infinite;
}
@keyframes blink {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.3;
  }
}

/* controls */
.controls-bar {
  position: relative;
  z-index: 1;
  display: flex;
  gap: 16px;
  align-items: flex-end;
  padding: 14px 32px;
  background: var(--s1);
  border-bottom: 1px solid var(--b1);
}
.ctrl {
  display: flex;
  flex-direction: column;
  gap: 5px;
  font-size: 10px;
  color: var(--t2);
  text-transform: uppercase;
  letter-spacing: 0.07em;
  flex: 1;
}
.ctrl.narrow {
  flex: 0 0 180px;
}
.ctrl textarea,
.ctrl input[type="text"] {
  background: var(--bg);
  border: 1px solid var(--b2);
  color: var(--t1);
  font-family: var(--mono);
  font-size: 12px;
  padding: 7px 9px;
  border-radius: var(--r);
  outline: none;
  resize: none;
}
.ctrl textarea:focus {
  border-color: var(--acc);
}
.ctrl input[type="range"] {
  accent-color: var(--acc);
  width: 100%;
}

/* body */
.lab-body {
  position: relative;
  z-index: 1;
  padding: 0 32px 48px;
  display: flex;
  flex-direction: column;
  gap: 1px;
  background: var(--b1);
}

/* comparison */
.comparison {
  background: var(--s1);
  padding: 28px;
}
.comp-header {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 22px;
}
.comp-num {
  font-family: var(--disp);
  font-size: 30px;
  font-weight: 800;
  color: var(--t3);
  line-height: 1;
  flex-shrink: 0;
  padding-top: 2px;
}
.comp-header h2 {
  font-family: var(--disp);
  font-size: 17px;
  font-weight: 700;
  margin-bottom: 3px;
}
.comp-header p {
  font-size: 12px;
  color: var(--t2);
}
.comp-header p em {
  color: var(--acc);
  font-style: normal;
}
.replay {
  margin-left: auto;
  background: var(--s2);
  border: 1px solid var(--b2);
  color: var(--t1);
  font-family: var(--mono);
  font-size: 12px;
  padding: 6px 14px;
  border-radius: var(--r);
  cursor: pointer;
  flex-shrink: 0;
}
.replay:hover {
  border-color: var(--acc);
  color: var(--acc);
}

/* two col */
.comp-grid {
  display: grid;
  grid-template-columns: 1fr 36px 1fr;
  gap: 0;
  align-items: start;
}
.vs {
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: 32px;
}
.vs span {
  font-family: var(--disp);
  font-size: 11px;
  font-weight: 800;
  color: var(--t3);
  writing-mode: vertical-rl;
  letter-spacing: 0.1em;
}
.side {
  display: flex;
  flex-direction: column;
  gap: 11px;
}

.side-label {
  display: flex;
  align-items: center;
  gap: 7px;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  padding: 5px 10px;
  border-radius: var(--r);
}
.side-label.bad {
  color: var(--red);
  background: rgba(255, 79, 110, 0.08);
  border: 1px solid rgba(255, 79, 110, 0.2);
}
.side-label.good {
  color: var(--grn);
  background: rgba(79, 255, 176, 0.08);
  border: 1px solid rgba(79, 255, 176, 0.2);
}

.code-block {
  background: var(--bg);
  border: 1px solid var(--b2);
  border-radius: var(--r);
}
.code-block pre {
  padding: 11px 13px;
  font-size: 11.5px;
  line-height: 1.7;
  color: var(--t2);
  white-space: pre-wrap;
  font-family: var(--mono);
}

/* pills */
.pills {
  display: flex;
  gap: 7px;
}
.pill {
  flex: 1;
  border-radius: var(--r);
  padding: 9px 11px;
  display: flex;
  flex-direction: column;
  gap: 3px;
  border: 1px solid;
}
.pill.bad {
  background: rgba(255, 79, 110, 0.05);
  border-color: rgba(255, 79, 110, 0.15);
}
.pill.good {
  background: rgba(79, 255, 176, 0.05);
  border-color: rgba(79, 255, 176, 0.15);
}
.pill.timing {
  flex: 0 0 auto;
  min-width: 100px;
}
.pv {
  font-family: var(--disp);
  font-size: 19px;
  font-weight: 800;
  line-height: 1;
}
.pv small {
  font-size: 10px;
  margin-left: 1px;
  opacity: 0.6;
}
.pill.bad .pv {
  color: var(--red);
}
.pill.good .pv {
  color: var(--grn);
}
.pl {
  font-size: 9px;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  color: var(--t2);
}

.tag {
  font-size: 11px;
  padding: 6px 10px;
  border-radius: var(--r);
}
.bad-tag {
  color: var(--red);
  background: rgba(255, 79, 110, 0.06);
}
.good-tag {
  color: var(--grn);
  background: rgba(79, 255, 176, 0.06);
}

/* live boxes */
.live-box {
  background: var(--bg);
  border: 1px solid var(--b2);
  border-radius: var(--r);
}
.dom-box {
  padding: 12px;
  color: var(--t1);
}
.pt-box {
  overflow: hidden;
}
.ptl {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 10px;
  border-bottom: 1px solid var(--b1);
  font-size: 12px;
}
.ptl:last-child {
  border-bottom: none;
}
.ptl-n {
  color: var(--t3);
  width: 14px;
  flex-shrink: 0;
  font-size: 10px;
}
.ptl-t {
  flex: 1;
  color: var(--t1);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.ptl-w {
  color: var(--acc);
  font-size: 10px;
  flex-shrink: 0;
}

/* resize boxes */
.rbox {
  border-radius: var(--r);
  padding: 12px;
  min-width: 120px;
  overflow: auto;
  min-height: 60px;
  resize: horizontal;
}
.dom-rbox {
  background: var(--bg);
  border: 1px solid rgba(255, 79, 110, 0.25);
  color: var(--t1);
}
.pt-rbox {
  background: var(--bg);
  border: 1px solid rgba(79, 255, 176, 0.25);
  width: 260px;
}
.rbox-meta {
  display: flex;
  gap: 10px;
  font-size: 10px;
  color: var(--acc);
  margin-bottom: 8px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}
.drag-h {
  margin-left: auto;
  color: var(--t3);
}
.rline {
  position: relative;
  font-size: 13px;
  color: var(--t1);
  padding-left: 4px;
}
.rbar {
  position: absolute;
  left: 0;
  top: 3px;
  bottom: 3px;
  background: rgba(79, 255, 176, 0.1);
  border-radius: 2px;
  z-index: 0;
}
.rtxt {
  position: relative;
  z-index: 1;
}
.counter {
  font-size: 11px;
  padding: 6px 10px;
  border-radius: var(--r);
}
.bad-counter {
  color: var(--red);
  background: rgba(255, 79, 110, 0.06);
}
.good-counter {
  color: var(--grn);
  background: rgba(79, 255, 176, 0.06);
}

/* comp 3 text comparison */
.text-wrap {
  border-radius: var(--r);
  padding: 12px;
}
.dom-text-wrap {
  background: var(--bg);
  border: 1px solid rgba(255, 79, 110, 0.2);
}
.pt-text-wrap {
  background: var(--bg);
  border: 1px solid rgba(79, 255, 176, 0.2);
}
.dom-p {
  color: var(--t1);
  font-family: var(--mono);
  font-size: 15px;
}
.pttext {
  color: var(--t1);
  font-family: var(--mono);
  font-size: 15px;
}
.data-panel {
  background: var(--bg);
  border: 1px solid var(--b2);
  border-radius: var(--r);
  padding: 10px 12px;
  display: flex;
  flex-direction: column;
  gap: 5px;
}
.bad-data {
  border-color: rgba(255, 79, 110, 0.2);
}
.good-data {
  border-color: rgba(79, 255, 176, 0.2);
}
.dp-row {
  display: flex;
  align-items: baseline;
  gap: 8px;
  font-size: 11px;
}
.dpk {
  color: var(--t2);
  flex-shrink: 0;
  min-width: 100px;
}
.dpv {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.dpv.red {
  color: var(--red);
  font-style: italic;
}
.dpv.green {
  color: var(--acc);
}

/* comp 4 browser mock */
.browser-mock {
  background: var(--bg);
  border: 1px solid var(--b2);
  border-radius: var(--r);
  overflow: hidden;
}
.brow-bar {
  height: 26px;
  background: #131519;
  border-bottom: 1px solid var(--b1);
}
.brow-bar::before {
  content: "● ● ●";
  font-size: 8px;
  color: var(--t3);
  display: flex;
  align-items: center;
  padding: 0 10px;
  height: 100%;
  letter-spacing: 3px;
}
.brow-body {
  padding: 14px;
  display: flex;
  flex-direction: column;
}
.sk {
  background: var(--b2);
  border-radius: 3px;
  animation: shim 1.5s infinite;
}
@keyframes shim {
  0%,
  100% {
    opacity: 0.3;
  }
  50% {
    opacity: 0.6;
  }
}
.ssr-text {
  font-size: 12px;
  font-family: var(--mono);
  color: var(--t1);
  padding: 6px 8px;
  border-radius: 3px;
  margin: 8px 0;
  transition: background 0.3s;
  min-height: 18px;
}
.no-res {
  background: transparent;
  border: 1px dashed rgba(255, 79, 110, 0.3);
}
.no-res.loaded {
  background: rgba(255, 79, 110, 0.06);
}
.with-res {
  background: rgba(79, 255, 176, 0.04);
  border: 1px dashed rgba(79, 255, 176, 0.3);
}
.with-res.loaded {
  background: rgba(79, 255, 176, 0.08);
}
.below {
  transition: background 0.3s;
}
.below.jumped {
  background: rgba(255, 79, 110, 0.35) !important;
  animation: jmp 0.4s ease;
}
@keyframes jmp {
  0% {
    transform: translateY(0);
  }
  35% {
    transform: translateY(20px);
  }
  100% {
    transform: translateY(0);
  }
}
.jlabel {
  font-size: 9px;
  color: var(--red);
  padding-left: 4px;
  line-height: 10px;
}
.stable {
  background: rgba(79, 255, 176, 0.15) !important;
}
.slabel {
  font-size: 9px;
  color: var(--grn);
  padding-left: 4px;
  line-height: 10px;
}

/* comp 5 canvas */
.canvas-wrap {
  background: var(--bg);
  border: 1px solid var(--b2);
  border-radius: var(--r);
  padding: 14px;
}
.dom-canvas-wrap {
  border-color: rgba(255, 79, 110, 0.2);
}
.pt-canvas-wrap {
  border-color: rgba(79, 255, 176, 0.2);
}
.dom-canvas-p {
  color: var(--t1);
}
.pipeline {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  padding: 7px 10px;
  border-radius: var(--r);
  background: var(--bg);
  border: 1px solid var(--b2);
}
.pipe-step {
  padding: 3px 8px;
  border-radius: 3px;
  background: var(--b2);
  color: var(--t1);
}
.pipe-step.active {
  background: rgba(79, 255, 176, 0.15);
  color: var(--grn);
  border: 1px solid rgba(79, 255, 176, 0.3);
}
.pipe-step.dim {
  opacity: 0.3;
}
.pipe-arrow {
  color: var(--t3);
}
.pipe-arrow.dim {
  opacity: 0.2;
}
.pipe-step s {
  text-decoration-color: var(--red);
}

/* footer */
.lab-footer {
  position: relative;
  z-index: 1;
  display: flex;
  justify-content: space-between;
  padding: 12px 32px;
  border-top: 1px solid var(--b1);
  font-size: 10px;
  color: var(--t3);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  background: var(--s1);
}

@media (max-width: 760px) {
  .comp-grid {
    grid-template-columns: 1fr;
  }
  .vs {
    display: none;
  }
  .controls-bar {
    flex-direction: column;
  }
  .ctrl.narrow {
    flex: 1;
    width: 100%;
  }
  .lab-header,
  .lab-body,
  .controls-bar {
    padding-left: 16px;
    padding-right: 16px;
  }
}
</style>
