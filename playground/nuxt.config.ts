export default defineNuxtConfig({
  modules: ["nuxt-pretext"],
  devtools: { enabled: true },
  compatibilityDate: "latest",
  pretext: {
    defaultFont: "16px Inter",
    defaultWidth: 400,
  },
});
