import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import tailwind from "@astrojs/tailwind";
import rehypeFigureTitle from "rehype-figure-title";
import rehypeLazyImages from "./src/lib/rehype-lazy-images.mjs";

export default defineConfig({
  site: "https://antifreeze.kr",
  integrations: [mdx(), sitemap(), tailwind()],
  build: {
    inlineStylesheets: "always",
  },
  markdown: {
    rehypePlugins: [rehypeFigureTitle, rehypeLazyImages],
  },
});
