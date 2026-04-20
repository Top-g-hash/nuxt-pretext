import {
  defineNuxtModule,
  createResolver,
  addPlugin,
  addComponentsDir,
  addImportsDir,
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

    // ✅ THE FIX: alias pretext to a no-op stub in SSR
    // The real package uses canvas at import time — it must never load in Node
    nuxt.hook("vite:extendConfig", (config, { isServer }) => {
      if (!isServer) return;
      config.resolve ??= {};
      config.resolve.alias ??= {};
      (config.resolve.alias as Record<string, string>)["@chenglou/pretext"] =
        resolver.resolve("./runtime/shims/pretext.stub");
    });

    nuxt.options.runtimeConfig.public.pretext = {
      defaultFont: options.defaultFont,
      defaultWidth: options.defaultWidth,
      defaultLineHeight: options.defaultLineHeight,
    };

    addPlugin(resolver.resolve("./runtime/plugin"));
    addPlugin(resolver.resolve("./runtime/directivePlugin"));
    addImportsDir(resolver.resolve("./runtime/composables"));
    addComponentsDir({
      path: resolver.resolve("./runtime/components"),
      prefix: "Pretext",
    });
  },
});
