import type { Post } from "@types";
import type { ImageMetadata } from "astro";
import { getImage } from "astro:assets";

const localImages = import.meta.glob<{ default: ImageMetadata }>(
  "/src/content/**/*.{png,jpg,jpeg,webp,gif}"
);

const FIRST_IMAGE = /!\[[^\]]*\]\(\s*<?([^)\s>]+)|<img[^>]*\ssrc="([^"]+)"/;

/*
 * 글 본문의 첫 번째 이미지를 공유 썸네일로 사용 (없으면 undefined)
 */
export async function getOgImage(entry: Post): Promise<string | undefined> {
  const match = entry.body.match(FIRST_IMAGE);
  const src = match?.[1] ?? match?.[2];
  if (!src) return undefined;
  if (/^https?:\/\//.test(src)) return src;

  const dir = entry.id.split("/").slice(0, -1).join("/");
  const path = new URL(src, `file:///src/content/${entry.collection}/${dir}/`).pathname;
  const load = localImages[decodeURIComponent(path)];
  if (!load) return undefined;

  const image = await getImage({ src: (await load()).default, width: 1200, format: "jpg" });
  return image.src;
}
