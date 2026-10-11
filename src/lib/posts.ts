import { getCollection } from "astro:content";
import type { Post } from "@types";

/*
 * 공개된 글 전체 (blog + archive), 최신순
 */
export async function getPosts(): Promise<Post[]> {
  const [blog, archive] = await Promise.all([
    getCollection("blog"),
    getCollection("archive"),
  ]);

  return [...blog, ...archive]
    .filter((post) => !post.data.draft)
    .sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}
