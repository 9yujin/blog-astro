import type { Site, Metadata, Socials } from "@types";

export const SITE: Site = {
  NAME: "9yu*",
  NUM_POSTS_ON_HOMEPAGE: 5,
};

export const HOME: Metadata = {
  TITLE: "Home",
  DESCRIPTION: "글을 쓰고 공간을 단장합니다. 웹 개발을 도구로 멋진 제품을 만듭니다.",
};

export const RESUME: Metadata = {
  TITLE: "Resume",
  DESCRIPTION:
    "A collection of my resume, with links to repositories and demos.",
};

export const SOCIALS: Socials = [
  {
    NAME: "github",
    HREF: "https://github.com/9yujin",
  },
  {
    NAME: "linkedin",
    HREF: "https://www.linkedin.com/in/9yujin",
  },
];
