import rss from "@astrojs/rss";
import { HOME, SITE } from "@consts";
import { getPosts } from "@lib/posts";
import { excerpt } from "@lib/utils";

type Context = {
  site: string;
};

export async function GET(context: Context) {
  const posts = await getPosts();

  return rss({
    title: SITE.NAME,
    description: HOME.DESCRIPTION,
    site: context.site,
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description || excerpt(post.body),
      pubDate: post.data.date,
      link: `/articles/${post.slug}/`,
    })),
  });
}
