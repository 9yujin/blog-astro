import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import tailwind from "@astrojs/tailwind";
import rehypeFigureTitle from "rehype-figure-title";

export default defineConfig({
  site: "https://9yu.netlify.app",
  integrations: [mdx(), sitemap(), tailwind()],
  markdown: {
    rehypePlugins: [rehypeFigureTitle],
  },
});
