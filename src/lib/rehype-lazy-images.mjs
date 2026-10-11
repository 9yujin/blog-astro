import { visit } from "unist-util-visit";

const hasClass = (node, name) => {
  const className = node.properties?.className;
  return Array.isArray(className) && className.includes(name);
};

/*
 * 본문 이미지 지연 로딩
 * - 첫 번째 이미지는 화면 상단에 보이므로 제외
 * - rehype-figure-title 컨테이너 안의 이미지는 로드 완료 후 표시되므로 제외
 */
export default function rehypeLazyImages() {
  return (tree) => {
    const inFigureContainer = new Set();
    visit(tree, "element", (node) => {
      if (hasClass(node, "rehype-figure-title-container")) {
        visit(node, "element", (child) => {
          if (child.tagName === "img") inFigureContainer.add(child);
        });
      }
    });

    let isFirstImage = true;
    visit(tree, "element", (node) => {
      if (node.tagName !== "img") return;

      node.properties.decoding ??= "async";
      if (isFirstImage) {
        isFirstImage = false;
        return;
      }
      if (!inFigureContainer.has(node)) {
        node.properties.loading ??= "lazy";
      }
    });
  };
}
