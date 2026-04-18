// src/module.ts
import {
  defineNuxtModule,
  createResolver,
  addPlugin,
  addComponentsDir,
  addImportsDir,
  addPluginTemplate,
} from "@nuxt/kit";

export default defineNuxtModule({
  meta: { name: "nuxt-pretext", configKey: "pretext" },
  defaults: {
    defaultFont: "16px Inter",
    defaultWidth: 300,
    defaultLineHeight: 20,
  },
  setup(options, nuxt) {
    const resolver = createResolver(import.meta.url);

    // Pass defaults to runtime via runtimeConfig
    nuxt.options.runtimeConfig.public.pretext = {
      defaultFont: options.defaultFont,
      defaultWidth: options.defaultWidth,
      defaultLineHeight: options.defaultLineHeight,
    };

    addPlugin(resolver.resolve("./runtime/plugin"));
    addImportsDir(resolver.resolve("./runtime/composable"));
    addComponentsDir({
      path: resolver.resolve("./runtime/components"),
      prefix: "Pretext",
    });

    // Register directive via plugin
    addPlugin(resolver.resolve("./runtime/directivePlugin"));
  },
});
