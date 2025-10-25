export function setUtterances() {
  const script = document.createElement("script");
  const container = document.querySelector("#giscus");
  const currentTheme = localStorage.getItem("theme");

  Object.entries({
    src: "https://giscus.app/client.js",
    "data-repo": "9yujin/blog-astro",
    "data-repo-id": "R_kgDOP12xDw",
    "data-category": "comments",
    "data-category-id": "DIC_kwDOP12xD84CwMqo",
    "data-mapping": "pathname",
    "data-strict": "0",
    "data-reactions-enabled": "1",
    "data-emit-metadata": "0",
    "data-input-position": "bottom",
    "data-theme": currentTheme == "light" ? "light" : "dark",
    "data-lang": "ko",
    crossorigin: "anonymous",
    async: "true",
  }).forEach(([key, value]) => {
    script.setAttribute(key, value);
  });

  container?.appendChild(script);
}
