import type { CollectionEntry } from "astro:content";

export type Post = CollectionEntry<"blog"> | CollectionEntry<"archive">;

export type Site = {
  NAME: string;
  NUM_POSTS_ON_HOMEPAGE: number;
};

export type Metadata = {
  TITLE: string;
  DESCRIPTION: string;
};

export type Socials = {
  NAME: string;
  HREF: string;
}[];
