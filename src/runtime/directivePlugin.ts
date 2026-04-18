// src/runtime/directivePlugin.ts
import { defineNuxtPlugin } from "#app";
import { vPretext } from "./directives/pretext";

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.directive("pretext", vPretext);
});
