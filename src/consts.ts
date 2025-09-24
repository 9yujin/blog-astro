import type { Site, Metadata, Socials } from "@types";

export const SITE: Site = {
  NAME: "9yujin",
  EMAIL: "david0218@naver.com",
  NUM_POSTS_ON_HOMEPAGE: 5,
  NUM_WORKS_ON_HOMEPAGE: 2,
  NUM_PROJECTS_ON_HOMEPAGE: 3,
};

export const HOME: Metadata = {
  TITLE: "Home",
  DESCRIPTION: "Astro Nano is a minimal and lightweight blog and portfolio.",
};

export const BLOG: Metadata = {
  TITLE: "Blog",
  DESCRIPTION: "A collection of articles on topics I am passionate about.",
};

export const RESUME: Metadata = {
  TITLE: "Resume",
  DESCRIPTION:
    "A collection of my resume, with links to repositories and demos.",
};

export const DEV: Metadata = {
  TITLE: "Dev",
  DESCRIPTION:
    "A collection of my projects, with links to repositories and demos.",
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
