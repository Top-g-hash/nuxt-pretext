import {
  defineNuxtModule,
  createResolver,
  addPlugin,
  addComponentsDir,
  addImportsDir,
} from "@nuxt/kit";

export default defineNuxtModule({
  meta: {
    name: "nuxt-pretext",
    configKey: "pretext",
  },

  defaults: {
    defaultFont: "16px Inter",
    defaultWidth: 300,
  },

  setup(options, nuxt) {
    const resolver = createResolver(import.meta.url);

    nuxt.options.runtimeConfig.public.pretext = {
      defaultFont: options.defaultFont ?? "16px Inter",
      defaultWidth: options.defaultWidth ?? 300,
    };

    addPlugin(resolver.resolve("./runtime/plugin"));

    addImportsDir(resolver.resolve("./runtime/composables"));

    addComponentsDir({
      path: resolver.resolve("./runtime/components"),
      prefix: "Pretext",
    });
  },
});
