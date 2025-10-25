/*
 * 이미지 그룹 위아래 마진 관련
 */
export function groupConsecutiveImages() {
  const articles = document.querySelectorAll("article");

  articles.forEach((article) => {
    const children = Array.from(article.children);
    let consecutiveGroup: Element[] = [];

    children.forEach((child) => {
      if (child.classList.contains("rehype-figure-title-container")) {
        consecutiveGroup.push(child);
      } else {
        if (consecutiveGroup.length > 1) {
          markConsecutiveGroup(consecutiveGroup);
        }
        consecutiveGroup = [];
      }
    });
    if (consecutiveGroup.length > 1) {
      markConsecutiveGroup(consecutiveGroup);
    }
  });
}

function markConsecutiveGroup(group: Element[]) {
  group.forEach((element, index) => {
    if (index === 0) {
      element.classList.add("image-row-first");
    } else if (index === group.length - 1) {
      element.classList.add("image-row-last");
    } else {
      element.classList.add("image-row-middle");
    }
  });
}

/*
 * 연속된 이미지들을 1열로 배치 / 이미지 비율 관련
 */
export async function setImageRowFlex() {
  const containers = document.querySelectorAll(
    "article .rehype-figure-title-container"
  );

  for (const container of containers) {
    const figures = Array.from(
      container.querySelectorAll("figure")
    ) as HTMLElement[];
    const images = figures
      .map((fig) => fig.querySelector("img"))
      .filter((img): img is HTMLImageElement => img !== null);

    if (images.length === 0) continue;

    // 스켈레톤 생성 (컨테이너는 CSS로 이미 숨겨져 있음)
    const skeleton = createSkeleton(figures.length);
    container.parentElement?.insertBefore(skeleton, container);

    // 모든 이미지 로딩 대기
    await Promise.all(images.map(waitForImageLoad));

    // 비율 계산
    const ratios = images.map((img) => img.naturalWidth / img.naturalHeight);
    const sumRatio = ratios.reduce((sum, ratio) => sum + ratio, 0);

    // 합이 1보다 작으면 정규화
    const normalizedRatios =
      sumRatio < 1 ? ratios.map((r) => r / sumRatio) : ratios;

    // flex 적용
    figures.forEach((figure, i) => {
      figure.style.flex = normalizedRatios[i].toString();
    });

    // 스켈레톤 제거하고 실제 컨테이너 표시
    skeleton.remove();
    (container as HTMLElement).style.display = "flex";
  }
}

function createSkeleton(count: number): HTMLElement {
  const skeleton = document.createElement("div");
  skeleton.className = "skeleton-container";
  skeleton.style.cssText = `
    display: flex;
    align-items: flex-start;
    width: 100%;
    gap: 0.2rem;
    margin-top: 2rem;
    margin-bottom: 2rem;
    min-height: 300px;
  `;

  for (let i = 0; i < count; i++) {
    const skeletonItem = document.createElement("div");
    skeletonItem.className = "skeleton-item";
    skeletonItem.style.cssText = `
      flex: 1;
      height: 300px;
      background: #e5e7eb;
      border-radius: 12px;
    `;
    skeleton.appendChild(skeletonItem);
  }

  return skeleton;
}

function waitForImageLoad(img: HTMLImageElement): Promise<void> {
  if (img.complete && img.naturalWidth) return Promise.resolve();
  return new Promise((resolve) => {
    img.addEventListener("load", () => resolve());
    img.addEventListener("error", () => resolve());
  });
}
