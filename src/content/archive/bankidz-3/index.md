---
title: "[뱅키즈] 3. 디자인 시스템 (ThemeProvider, Storybook)"
description:
date: 09/28/2025
draft: true
---
디자이너가 프로젝트에 함께 한다는건 축복이다. 디자인이나 기획에 시간을 쏟지 않고 개발에만 집중할 수 있다는 것 외에도 얻어가는 것이 꽤 있다. 디자인 팀에서 넘겨 받은 피그마 화면을 차근차근 뜯어보면서 많이 배웠다. 디자이너들은 어떤 방식으로 작업하는지, 피그마의 이 기능은 어떻게 활용하는지, 협업은 어떻게 하는지.  
  
이전 프로젝트에서 디자인을 맡아서 할 땐 작업을 효율적으로 하는 방법을 전혀 몰랐다. 제목과 서브 텍스트의 간격은 항상 24픽셀로 해야지, 이 컴포넌트는 항상 화면 너비에 채워지도록 해야지, 하는 나름의 기준들을 나 혼자서만 생각하고 있으니까 같이 개발하는 팀원들과 소통이 안돼서 일을 두번씩 하는 경우도 여러번 생겼다. 각 페이지에서 통일해야 하는 디자인들도 여러명이서 작업을 하다보니 신경써야 할 것도 많았다. 역시 머리가 나쁘면 몸이 고생을!!  
  
앱 UI의 전반적인 일관성이 중요함을 정말 잘 알고 있기 때문에, 디자이너가 구상한 스타일 가이드를 개발 단계로 그대로 끌고오고자 했다. styled-components의 **ThemeProvider**와 **Storybook**으로 디자인시스템을 완성도 있게 구축할 수 있게 되었다.

### 1. ThemeProvider

![](https://blog.kakaocdn.net/dna/bBcXcd/btrIfRMPX0x/AAAAAAAAAAAAAAAAAAAAAHNM2zTfwAcJJiJSGrjoYIQvtBMD6X46tYKeg-mXSTAN/img.png?credential=yqXZFxpELC7KVnFOS48ylbz2pIh7yKj8&expires=1759244399&allow_ip=&allow_referer=&signature=6qP1o0Ip00HhI2ry%2B1ZylYHqPvQ%3D)

![](https://blog.kakaocdn.net/dna/cMGC7i/btrH49VUgFF/AAAAAAAAAAAAAAAAAAAAAMpbrWvL1yZ8H_JetL_A81dpMJ6-xcqBqp0C1VUkO3VM/img.png?credential=yqXZFxpELC7KVnFOS48ylbz2pIh7yKj8&expires=1759244399&allow_ip=&allow_referer=&signature=Vzr%2B0DDkw3GQcPBLhxZYaIe6u7s%3D)

디자이너 선생님들이 넘겨준 색 팔레트와 타이포이다. 디자인에 사용된 모든 색상들은 피그마 내에서 지정된 이름으로 볼 수 있다. 타이포도 동일. 디자이너가 폰트, 굵기, 크기가 똑같은 스타일이어도 쓰이는 용도에 따라 따로 분리를 해주어서 좀 더 편하게 사용할 수 있었다.  
  

![](https://blog.kakaocdn.net/dna/nrSAD/btrIkpbYPcP/AAAAAAAAAAAAAAAAAAAAABdeHGITBfvPsjXj9arnuVRGQ3CFUROdo8m7-yQcjAWP/img.png?credential=yqXZFxpELC7KVnFOS48ylbz2pIh7yKj8&expires=1759244399&allow_ip=&allow_referer=&signature=HWLepPD9lcCfsAAWcenbub7mauc%3D)

context를 기본으로 하는 themeProvider를 통해 전역으로 theme을 불러와서 사용할 수 있다. 미리 세팅한 색들이 자동완성으로 바로 뜬다.

![](https://blog.kakaocdn.net/dna/bIkNIf/btrImccau6f/AAAAAAAAAAAAAAAAAAAAAEQe70ArBLbBePoU2p1fn7KVum_31Dt2EoyOGhXQnWgM/img.png?credential=yqXZFxpELC7KVnFOS48ylbz2pIh7yKj8&expires=1759244399&allow_ip=&allow_referer=&signature=l0O8TskDISxEsi2P3cjWsAX96kc%3D)

타이포의 경우도 마찬가지. 글꼴, 굵기, 크기, 줄 높이를 설정해두었다. 자동완성을 통해 손쉽게 한번에 네가지 속성을 불러올 수 있다.

그 외에도 미디어쿼리, 모서리 둥글기 등을 불러와 사용한다.

#### theme.tsx

```typescript
import { DefaultTheme } from 'styled-components';

// div 내부에 svg를 삽입하여 위치시키는 경우 내부 svg의 width를
// % 단위로 계산하기 위한 함수, 소수점 아래는 버림
export const calcRatio = (innerPx: number, OuterPx: number) =>
  `${Math.floor((innerPx * 100) / OuterPx)}%`;
export const calcRem = (px: number) => `${px / 16}rem`;

const customMediaQuery = (maxWidth: number): string =>
  `@media (max-width: ${maxWidth}px)`;
export const media = {
  custom: customMediaQuery,
  pc: customMediaQuery(1440),
  tablet: customMediaQuery(768),
  mobile: customMediaQuery(576),
};

export const theme: DefaultTheme = {
  palette: {
    main: {
      yellow100: '#FFF6D2',
      yellow200: '#FFEEA6',
      yellow300: '#FFDA40',
      yellow400: '#FFC52F',
    },
    greyScale: {
      white: '#FFFFFF',
      grey100: '#FAFAFC',
      grey200: '#EAEAEC',
      grey300: '#DBDEE1',
      grey400: '#CFCFCF',
      grey500: '#A6A9AD',
      grey600: '#828489',
      grey700: '#525354',
      black: '#2E3234',
    },
    // ...생략
  },
  radius: {
    small: '8px',
    medium: '12px',
    large: '24px',
  },
  typo: {
    fixed: {
      Navbar_T_17_EB: `font-family: 'TmoneyRoundWind';font-size: ${calcRem(
        17,
      )};line-height: 100%;font-weight: 800;`,
      TabName_T_21_EB: `font-family: 'TmoneyRoundWind';font-size: ${calcRem(
        21,
      )};line-height: 100%;font-weight: 800;`,
      HomeTitle_T_24_EB: `font-family: 'TmoneyRoundWind';font-size: ${calcRem(
        24,
      )};line-height: 100%;font-weight: 800;`,
      HomeSubtitle_T_16_EB: `font-family: 'TmoneyRoundWind';font-size: ${calcRem(
        16,
      )};line-height: 100%;font-weight: 800;`,
      GraphNum_T_21_EB: `font-family: 'TmoneyRoundWind';font-size: ${calcRem(
        21,
      )};line-height: 100%;font-weight: 800;`,
      GraphSub_S_12_M: `font-family: 'Spoqa Han Sans Neo';font-size: ${calcRem(
        12,
      )};line-height: 100%;font-weight: 500;`,
      EmptyText_S_16_M: `font-family: 'Spoqa Han Sans Neo';font-size: ${calcRem(
        16,
      )};line-height: 100%;font-weight: 500;`,
    },

    input: {
      Title_T_24_EB: `font-family: 'TmoneyRoundWind';font-size: ${calcRem(
        24,
      )};line-height: 100%;font-weight: 800;`,
      TextField_T_16_EB: `font-family: 'TmoneyRoundWind';font-size: ${calcRem(
        16,
      )};line-height: 100%;font-weight: 800;`,
      TextField_Num_T_21_EB: `font-family: 'TmoneyRoundWind';font-size: ${calcRem(
        21,
      )};line-height: 100%;font-weight: 800;`,
      TextMessage_S_12_M: `font-family: 'Spoqa Han Sans Neo';font-size: ${calcRem(
        12,
      )};line-height: 100%;font-weight: 500;`,
    },
    // ...생략
    
  },
};
```

### 2. Storybook

디자인시스템에는 타이포와 팔레트 뿐만 아니라 그리드시스템, 버튼, 탭바, 인풋 박스 등의 공통으로 쓰이는 컴포넌트들도 정의가 되어있다. 이전에 사용해본 경험이 있던 스토리북을 이번 프로젝트에도 도입하기로 했다. 가이드가 잘 되어 있으니 더욱 효율적으로 사용할 수 있을 것이라 기대했다.

![](https://blog.kakaocdn.net/dna/cYf0Oo/btrIjLsQHtq/AAAAAAAAAAAAAAAAAAAAAGAWnJSsfRZqUO23vXW1DQtuBUSbkKxssLaSHxkuCE0h/img.png?credential=yqXZFxpELC7KVnFOS48ylbz2pIh7yKj8&expires=1759244399&allow_ip=&allow_referer=&signature=RxIHdDMaTl9%2FmR%2BZdfCp9clwORo%3D)

피그마에서 하나의 컴포넌트에 properties를 다양하게 줄 수 가 있다. 디자이너가 작업하는 방식 그대로 리액트스럽게 코드에 반영할 수 있다. props를 다르게 넣어주면서 하나의 컴포넌트의 다양한 variants를 테스트할 수 있게 되었다. 

![](https://blog.kakaocdn.net/dna/n8VgR/btrImP9qthD/AAAAAAAAAAAAAAAAAAAAAPODyydDwrL1eUJ2ylXwalNU0Tymmj4-S_g3523RXJu3/img.png?credential=yqXZFxpELC7KVnFOS48ylbz2pIh7yKj8&expires=1759244399&allow_ip=&allow_referer=&signature=FcJD4oZNywH2yVUuuZmrINIfvso%3D)

버튼 컴포넌트 스토리북 페이지

[**[React] Storybook 설정 및 Github Actions 배포 자동화**](https://9yujin.tistory.com/46?category=1013884)

스토리북 페이지는 dev 브랜치에 push가 있고, 컴포넌트 디렉토리에 변경이 있을 때에만 액션이 트리거 되면서 자동으로 배포되도록 설정했다. 그 과정은 위 소제목에 걸어둔 링크에 정리해두었다.

**[[티켓 예매 프로젝트] 2. CDD, Storybook](https://9yujin.tistory.com/25?category=1025360)**

스토리북을 통한 컴포넌트 주도 개발에 대한 이야기는 이전 프로젝트를 하면서 정리해두었다. 역시 위 소제목에 걸어둔 링크에서 볼 수 있다.  타입스크립트를 쓰지 않았을 때도 PropTypes를 이용해 컴포넌트 prop에 들어가는 속성들과 타입을 지정해놓았는데, 이런 경험 덕분에 타입스크립트를 처음 공부할때도 익숙한 느낌을 받을 수 있었다.