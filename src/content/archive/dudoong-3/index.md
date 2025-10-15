---
title: "[두둥] 3. Next.js 웹 성능 최적화"
description:
date: 07/13/23
draft: false
---
![](https://img1.daumcdn.net/thumb/R750x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdna%2FnmPFO%2Fbtsnvwwusu7%2FAAAAAAAAAAAAAAAAAAAAAN_CPjs9lyhNg8gRMAwP84H-lsO1H-YeGnM8nF_Pjveo%2Fimg.png%3Fcredential%3DyqXZFxpELC7KVnFOS48ylbz2pIh7yKj8%26expires%3D1761922799%26allow_ip%3D%26allow_referer%3D%26signature%3DYuzAcEf4bvBSh%252Bi6XMbXolnjRks%253D)

한달에 삼만얼마 짜리 요금제를 쓰고 있다. 처음에 제공된 데이터 몇기가를 전부 소진하면 그 이후론 속도제한이 걸린 채 무제한으로 사용할 수 있다. 말이 무제한이지, 웹서핑과 음악 스트리밍을 동시에 못하는 대역폭. 그럴 때 휴대폰으로 두둥을 들어가면 로딩이 굉장히 느려 답답했다. 포스터 이미지를 많이 불러오는 홈화면은 특히 그랬다. 웹 성능 최적화를 해보기로 했다. 그리고 이번 글은 그에 대한 기록.

![Pasted image 20251016170846](https://obsidian-content-assets.s3.ap-southeast-2.amazonaws.com/2025/10/16/Pasted%20image%2020251016170846.png)

초기 lightHouse 점수이다. 다행히 막 크게 안좋은 점수는 아니었다.

---

### 1. 폰트 최적화

#### 웹폰트가 로드되는 동안 텍스트가 계속 표시되는지 확인하기

웹폰트를 렌더링하는 방식에는 두가지가 있다. 
- 대체 글꼴이 새 글꼴로 바뀜 (FOUT - 스타일이 지정되지 않은 텍스트 플래시).
- "보이지 않는" 텍스트는 새 글꼴이 렌더링될 때까지 표시됨 (FOIT - 보이지 않는 텍스트 플래시).

![Pasted image 20251016170849](https://obsidian-content-assets.s3.ap-southeast-2.amazonaws.com/2025/10/16/Pasted%20image%2020251016170849.png)

현재는 폰트가 불러와지기 전까지는 아무런 텍스트도 나타나지 않고 있다가 폰트가 로드된 후에 텍스트가 뙇 나타난다. 크롬 브라우저는 기본적으로 FOIT방식을 사용하고 있다 (사파리에서는 궁서체로 보이다가 바뀌더라 - FOUT 방식) .

```scss
font-display :swap;
```

`@font-face`의 옵션을 통해 렌더링 방식을 바꿀 수 있다. `swap`은 글자를 차단하는 시간을 줄이고 글자가 불러와지면 교체(swap)하는 방식이다. `optional`과 `fallback` 옵션을 통해, 비슷하게 동작하지만 글꼴 차단 기간 또는 swap을 대기하는 (글꼴 교체) 기간을 조절할 수 있다.

 [글꼴 로드 중 보이지 않는 텍스트 방지](https://web.dev/avoid-invisible-text/)

#### 웹폰트 미리 로드

FOUT를 방지 하기 위해 즉시 필요한 웹폰트를 미리 로드할 수 있다. html head에 이 애플리케이션에 대한 Link 요소를 추가한다.

```html
<head>
  <!-- ... -->
  <link
    rel="preload"
    as="style"
    crossOrigin="anonymous"
    href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.6/dist/web/static/pretendard.css"
  />
</head>
```

`preload`를 통해 리소스를 요청할때에 우선순위를 당겨 미리 로드할 수 있도록 한다. 실제로 적용한 후에 새로 빌드해 확인해보니 글꼴이 깜빡이는 현상이 사라진것을 확인해볼 수 있었다.


![Pasted image 20251016170856](https://obsidian-content-assets.s3.ap-southeast-2.amazonaws.com/2025/10/16/Pasted%20image%2020251016170856.png)


하지만 Safari (또는 모바일 브라우저)에서는 적용이 되지 않았다. 죄다 기본 글꼴로 깨져서 나타났다. 스택오버플로우에도 비슷한 질문들이 많았음.

```xml
<head>
  <!-- ... -->
  <link
    rel="preload"
    as="style"
    href="https://asset.dudoong.com/common/fonts/dudoong-fonts.css"
    crossOrigin="anonymous"
  />
</head>
```

두둥 웹의 Origin과 현재 사용하고 있는 웹폰트 CDN의 Origin이 달라서 cross-origin 문제가 생긴다고 생각했다. `@font-face` css파일을 두둥 인프라에서 사용하고 있는 CDN에 띄워서 직접 제공해보려고 했다. 그래도 결과는 똑같았다.

![Pasted image 20251016170905](https://obsidian-content-assets.s3.ap-southeast-2.amazonaws.com/2025/10/16/Pasted%20image%2020251016170905.png)

글꼴을 요청할때는 CORS요청으로 전송된다. 그래서 도메인이 다를땐 요청이 되지 않던것이었는데, 서브 도메인도 똑같이 cross-origin으로 분류되기 때문이었다. CDN 설정에서 Allow-Origin을 모두 열어주었음에도 불구하고 제대로 요청이 되지 않았다. [이 글](https://blog.banksalad.com/tech/font-preload-on-safari/)을 보면 모종의 이유로 safari에서 cdn에 대한 preload 요청이 안되는것으로 보였다.

#### 웹폰트 크기 줄이기

뭐 이런것들이 있을 수 있다.
- WOFF2와 같은 용량이 작은 압축된 파일을 사용하기
- @font-face를 통해 글꼴 모음을 정의하기
- 서브셋, 다이나믹 서브셋 등을 통해 글꼴의 용량을 줄이기

1번과 2번같은 경우엔 이미 적용이 되어 있었고, 3번을 통해 웹폰트 리소스의 용량을 줄여보았다.

![Pasted image 20251016170908](https://obsidian-content-assets.s3.ap-southeast-2.amazonaws.com/2025/10/16/Pasted%20image%2020251016170908.png)


**서브셋 폰트**는 폰트 파일에서 불필요한 글자를 제거하고 사용할 글자만 남겨둔 폰트다. 보통은 '뷁'과 같은 글자는 쓰지 않으니까. 26개의 알파벳과 달리 한글 조합은 만개 언저리나 되는데, 서브셋 폰트로 만들어 사용하면 2300개 정도의 글자만 남겨둘 수 있다. 덕분에 용량이 훨신 작아진다. 서브셋 폰트 메이커라는 도구를 통해 변환할 수 있다. 근데 웹에서 쓰이는 웬만한 폰트는 이미 있는듯.

하지만 그래도 여전히 많다. 그 중에서도 안쓰는 폰트가 정말 많은데. **다이나믹 서브셋**은 CSS의 `unicode-range` 속성을 통해, 해당 유니코드 영역의 문자가 사용될 때 브라우저가 폰트 파일를 요청한다.

```css
/* [0] */
@font-face {
    font-family: 'Pretendard';
    font-style: normal;
    font-display: swap;
    font-weight: 100;
    src: url(../../../packages/pretendard/dist/web/static/woff2-dynamic-subset/Pretendard-Thin.subset.0.woff2) format('woff2'), url(../../../packages/pretendard/dist/web/static/woff-dynamic-subset/Pretendard-Thin.subset.0.woff) format('woff');
    unicode-range: U+f9ca-fa0b, U+ff03-ff05, U+ff07, U+ff0a-ff0b, U+ff0d-ff19, U+ff1b, U+ff1d, U+ff20-ff5b, U+ff5d, U+ffe0-ffe3, U+ffe5-ffe6;
}
/* [1] */
@font-face {
    font-family: 'Pretendard';
    font-style: normal;
    font-display: swap;
    font-weight: 100;
    src: url(../../../packages/pretendard/dist/web/static/woff2-dynamic-subset/Pretendard-Thin.subset.1.woff2) format('woff2'), url(../../../packages/pretendard/dist/web/static/woff-dynamic-subset/Pretendard-Thin.subset.1.woff) format('woff');
    unicode-range: U+d723-d728, U+d72a-d733, U+d735-d748, U+d74a-d74f, U+d752-d753, U+d755-d757, U+d75a-d75f, U+d762-d764, U+d766-d768, U+d76a-d76b, U+d76d-d76f, U+d771-d787, U+d789-d78b, U+d78d-d78f, U+d791-d797, U+d79a, U+d79c, U+d79e-d7a3, U+f900-f909, U+f90b-f92e;
}
/* https://github.com/orioncactus/pretendard */
```

실제 프리텐다드 다이나믹 서브셋 폰트 파일의 내용이다. 한글은 매우 자주 사용하는 문자들 조금과, 비교적 적게 사용되는 문자들 다수로 이루어져 있다고 한다. 그걸 구글께서 어쩌구저쩌구 해서 최적의 unicode-range로 나누었다고 한다. [https://www.googblogs.com/tag/korean/](https://www.googblogs.com/tag/korean/)

![Pasted image 20251016170918](https://obsidian-content-assets.s3.ap-southeast-2.amazonaws.com/2025/10/16/Pasted%20image%2020251016170918.png)

가벼운 프리텐다드와 0.6메가 지마켓산즈

보통 Header의 폰트로 사용하는 Gmarket Sans를 다이나믹 서브셋 파일로 변경만 해도 기존 1.3mb에서 408kb까지 용량을 줄일 수 있었다. 프리텐다드는 `@font-face`의 src에서 local을 통해 로컬 폰트파일을 사용하도록 되어있었기 때문에, 기존 용량이 얼마나 되는지 따로 알아보긴 귀찮아서 패스. 대부분 아이폰에 프리텐다드가 설치되어 있을 일은 별로 없다보니 프리텐다드 역시 다이나믹 서브셋 폰트로 바꾸어 주었다.

(처음부터 next/font를 적용해볼걸 하는 생각이 든다. 처음엔 구글폰트가 아닌 웹폰트를 사용했기 때문에 라이브러리 사용을 고려하지 않았다. 근데 로컬로 다운받아서 서브셋 폰트 만들고, 내 CDN에 올리고 등의 여러 시도를 하면서.. 이럴바엔 그냥 로컬폰트로 next/font를 적용하는게 맞지 않나? 하는 생각.)

### 2. 이미지 최적화

폰트보다 더 큰 문제는 이미지에 있었다. 두둥의 메인페이지는 호스트가 올린 포스터 이미지를 그대로 저장했다가 보여주고 있었다. 용량이 매우 많은 이미지로 업로드해놓으면 그런대로 로딩이 느려지는 상황이었음.

![Pasted image 20251016170924](https://obsidian-content-assets.s3.ap-southeast-2.amazonaws.com/2025/10/16/Pasted%20image%2020251016170924.png)

기본적으로 이미지 최적화를 위해서 이런 것들을 한다.
- 이미지 사이즈를 보여줄 크기 또는 뷰포트에 맞게 변환해서 제공한다.
- 용량이 작게 압축된 파일 확장자(WEBP)를 이용한다.
- 처음에 모든 이미지를 로드하지 않고, 뷰포트에 보여질 것들만 lazy loading 한다.
- 이미지의 너비와 높이를 지정해 Cumulative Layout Shift를 방지한다.

이를 위해 `Next/Image`를 도입했다. 위의 것들을 구현하기 위해선 `intersection-observer` 등을 통해 직접 뷰포트에 보이는지를 캐치해 lazy loading을 적용해야 하고(크롬은 된대), 이미지를 업로드할 때 별도의 이미지 압축 라이브러리를 통해 리사이징과 압축을 한 후에 스토리지에 업로드하는 방식이 필요하다.

~~내가 모르는거 있으면 말좀~~

근데 `Next/Image`는 이런 기능들을 다 제공해준다.

```tsx
<Image
  src={img}
  fill={true}
  sizes="(max-width: 768px) 50vw, 25vw"
  alt={props.name}
  priority
/>
```

현재 메인 페이지에 적용된 `Image` 컴포넌트이다. 인터넷에 많이 있는 자료들은 레거시인 경우가 많아서, 공식문서를 보고 컴포넌트를 사용하는게 좋다.

#### fill

레이아웃 시프트를 없애기 위해 `width`와 `height`를 사용한다 했는데, 대신 `fill` 속성을 사용했다. `fill`을 통해 이미지가 상위 요소를 채우도록 할 수 있다.

```scss
position: relative;
padding-top: 141.4%;
overflow: hidden;
```

Image 컴포넌트의 상위 요소에는 위와 같이 `relative`와 `overflow: hidden` 속성을 주고, 141.4%(A사이즈 용지)의 비율로 유지되도록 했다.

#### sizes

이미지가 반응형일때 `next-images`는 기본적으로 이미지의 크기를 100vw로 생각하고 내려준다. `sizes` 속성을 사용하면 실제 이미지의 사이즈가 100vw보다 작을거라고 브라우저에게 알릴 수 있다. 모바일 화면일땐 1열에 포스터가 두개, 아닐 땐 네개씩 들어가기 때문에 (max-width: 768px) 50vw, 25vw로 설정해주었다. `sizes`속성을 사용하지 않았을때보다 16배 작은 이미지를 받아올 수 있다.

추가로 이미지의 우선순위를 높이고 preload하기 위해 `priority` 속성을 줄 수 있고, 이미지가 로딩되기까지 보여줄 placeholder 또는 blur 이미지를 설정할 수도 있다. 스크롤 없이 볼 수 있는 이미지가 지연 로드되면 페이지 수명 주기 후반에 렌더링되므로 preload 속성을 주는 것이 좋다. 이렇게 `Next/Image` 컴포넌트로 대체하면서 두둥 메인 페이지의 초기 이미지 크기를 1800kb에서 444kb로 줄일 수 있었다. 이미지만으로도 확실히 로딩 속도가 빨라짐을 체감할 수 있었다. 제일 대문짝만하긴 해서.

### 3. 번들 사이즈 최적화

보편적으로 쉽게 번들의 사이즈를 최적화하는 방법으로는 코드 스플리팅이 있다. Next는 기본적으로 pages내의 파일들을 빌드 과정에서 분할해 코드 스플리팅을 자동적으로 지원해준다. 그 외에 바로 가져올 필요가 없는 코드들은 dynamic import를 통해 필요한때에 불러올 수 있다.

두둥의 경우엔 모달(혹은 바텀시트)를 글로벌로 제어하기 위해, 상위 컴포넌트에 위치해놓고 전역상태를 통해 관리하고 있다. 해당 컴포넌트를 필요한 경우에만 불러올 수 있도록 했다.

```tsx
const GlobalOverlay = dynamic(
  () => import('@components/shared/overlay/GlobalOverlay'),
  { ssr: false },
);
```

이 외에도 MdViewer, QRcode 등의 외부 라이브러리들을 `next/dynamic`을 통해 동적으로 불러오고 있다.

사용된 외부 라이브러리들이 많은 용량을 차지하는 경우가 많기 때문에 트리셰이킹을 하곤 한다. `next/bundle-analyzer`를 통해 Next 프로젝트를 빌드할 때 어떤 모듈이 얼마나 많은 용량을 차지하는지 시각적으로 볼 수 있다.

[https://www.npmjs.com/package/@next/bundle-analyzer](https://www.npmjs.com/package/@next/bundle-analyzer)

![Pasted image 20251016170931](https://obsidian-content-assets.s3.ap-southeast-2.amazonaws.com/2025/10/16/Pasted%20image%2020251016170931.png)

사실 크게 눈에 띄는 부분은 없다. 다만 디자이너가 랜딩페이지의 일러스트로 만들어준 이미지들을 그대로 svg로 넣었는데, 지금 생각해보니 미친 짓이었음. 어차피 랜딩페이지 리뉴얼 작업중이라 나중에 싹 바꿀 예정이기 때문에 지금 당장은 건들 생각이 없다. 페이지 맨 위 섹션 외의 아래 나오는 섹션들은 다이나믹 임포트를 통해 레이지하게 로딩되도록 수정해주었다.

![Pasted image 20251016170936](https://obsidian-content-assets.s3.ap-southeast-2.amazonaws.com/2025/10/16/Pasted%20image%2020251016170936.png)

수정 전후 `pages/index.js` 모듈의 analyzer 결과이다. 빌드 파일에 무거운 svg들이 제거된것을 시각적으로 볼 수 있다.

![Pasted image 20251016170940](https://obsidian-content-assets.s3.ap-southeast-2.amazonaws.com/2025/10/16/Pasted%20image%2020251016170940.png)

최적화 작업 전 후로 빌드된 JS파일의 크기가 눈에 보이게 줄어들었다.

---

![Pasted image 20251016170944](https://obsidian-content-assets.s3.ap-southeast-2.amazonaws.com/2025/10/16/Pasted%20image%2020251016170944.png)

메인 페이지는 89점, 공연 상세페이지는 98점까지 올릴 수 있게 되었다. 아맞다 접근성.