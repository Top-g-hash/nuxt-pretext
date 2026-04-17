import {
  defineNuxtModule,
  createResolver,
  addPlugin,
  addComponentsDir,
  addImportsDir,
} from "@nuxt/kit";

export interface ModuleOptions {
  defaultFont?: string;
  defaultWidth?: number;
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: "nuxt-pretext",
    configKey: "pretext",
  },

  defaults: {
    defaultFont: "16px Inter",
    defaultWidth: 300,
  },

  setup(options) {
    const resolver = createResolver(import.meta.url);

    addPlugin(resolver.resolve("./runtime/plugin"));

    addImportsDir(resolver.resolve("./runtime/composables"));

    addComponentsDir({
      path: resolver.resolve("./runtime/components"),
      prefix: "Pretext",
    });
  },
});
