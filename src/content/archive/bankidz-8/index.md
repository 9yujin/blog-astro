---
title: "[뱅키즈] 8. Applike한 UX를 위한 고민"
description:
date: 11/7/2022
draft: false
---
![Pasted image 20250928235440](https://obsidian-content-assets.s3.ap-southeast-2.amazonaws.com/2025/10/16/Pasted%20image%2020250928235440.png)

사용자가 서비스를 사용하며 느끼는 경험의 질은 디테일에서 나온다고 생각한다. 많은 동기들이 프론트앤드를 공부하다 백엔드로 떠난 것도 그 디테일을 챙기느라 지쳐서였다. 반면 나는 그 디테일에 관심이 있었다. 사용자 경험에 대해서 계속 고민하는게 재밌었다. 다행이라고 해야 하나. 덕분에 정말 재밌게 공부하고 있다. 요즘은 컨퍼런스 영상이나 아티클 따위의 컨텐츠를 보면서 상태나 컴포넌트 관리에 특히 관심을 갖고 있다. 중간고사만 끝나면 바로 이 프로젝트에도 도입해보고 싶은 것들이 많다!!

초장부터 말이 샜는데, 뱅키즈에서도 사용자 경험과 관련해 많은 고민을 했다. 앱이지만 대부분의 로직을 웹으로 구현하고 있다. 그렇기 때문에 프로젝트의 레이아웃을 잡을 때부터 최대한 '앱'스럽게 해보고자 했다.

이런 욕심은 뱅키즈를 시작하기 전 고스락 프로젝트를 할때도 마찬가지였다. 에브리타임과 카톡 등으로 홍보되고 공유되는 서비스 특성상 모바일로 이용하는 사용자들이 많다고 예상했기 때문에, 최대한 앱과 같은 느낌을 내보기 위해 노력해왔다. 나중에 알았지만 이런 고민을 했던 사람이 꽤 많았는지 'Applike' 라는 용어도 있었다.

이번 포스팅은 뱅키즈 서비스를 준비하면서 어떠한 고민을 했고, 어떤 기술로 해결했는지에 대한 기록이다.

### 1. 레이아웃 구성 (Foreground, Background)

프로젝트의 전체적인 레이아웃을 잡을 때부터 최대한 '앱'스럽게 해보고자 했다.

![Pasted image 20251007144710](https://obsidian-content-assets.s3.ap-southeast-2.amazonaws.com/2025/10/07/Pasted%20image%2020251007144710.png)


Background / Foreground

모든 페이지들은 두 부류로 나뉜다. 홈, 돈길 모아보기, 마이페이지 등의 메인화면들은 페이지 스택의 항상 아래에 있는 `Background`로. 그 메인화면들에 있는 버튼들을 클릭해 이동한 다른 화면들은 `Foreground`로 분류했다. Foreground는 Background 위에 스택처럼 쌓인다. 보통의 애플리케이션에서 작동하는 방식을 따라해보았다.

```ts
// 화면 상단에 'AppBar'를 함께 랜더링 하는 activity stack의 상위 UI template
function ForegroundTemplate({
  label,
  children,
  to,
  customEvent,
}: ForegroundTemplateProps) {
  return (
    <Wrapper>
      <AppBar label={label} to={to} customEvent={customEvent} />
      <Screen>{children}</Screen>
    </Wrapper>
  );
}

// 화면 하단에 'TapBar'를 함께 랜더링 하는 activity stack의 하위 UI template
function BackgroundTemplate({ children }: BackgroundTemplateProps) {
  return (
    <Wrapper>
      <TabBar />
      <Screen>{children}</Screen>
    </Wrapper>
  );
}
```

처음 전달받은 피그마 디자인을 보고 코드로 옮기며 많이 고민했다. 뭐 이런식이다. `BackgroundTemplate`에서는 항상 하단 탭바를 렌더링하고, `ForegroundTemplate`에서는 상단 앱바를 렌더링한다.

### 2. 라우팅 간 애니메이션

앱에서는 화면 간 이동시, 부드러운 애니메이션과 함께 나타난다. `React-transition-group` 라이브러리를 사용해서 구현했다.

[[뱅키즈] 6. React transition group 라우팅 트랜지션 (1) - 도입하기](https://9yujin.tistory.com/73)
[[뱅키즈] 7. React transition group 라우팅 애니메이션 (2) - 디테일 잡기](https://9yujin.tistory.com/81)

구글에 정보가 생각보다 별로 없었고, 내 경우처럼 완벽히 앱처럼 동작하는 트랜지션을 구현해본 기록을 보기 힘들었다. 그래서 더 세세히 기록을 하려고 노력했다. 위의 링크된 글에서 자세한 설명을 볼 수 있다.

![](https://obsidian-content-assets.s3.ap-southeast-2.amazonaws.com/2025/10/07/bankidz-8-1.gif)

바로 위에서 작성했던 `Foreground` 페이지와 `Background` 페이지 간의 트랜지션을 경험할 수 있다. 처음 프로젝트를 구성할 때부터 앱과 같은 UX를 고려한 덕분에 더 수월하게 작업할 수 있었다.

단순히 라이브러리만 도입하고 끝나는게 아니라 다양한 디테일을 고려했다.

- 뒤로가기 시에는 반대방향의 애니메이션이 나온다. (포개졌던 페이지가 다시 나가는 듯한)
- 위에 포개져있는 페이지가 이동할땐 더 많은 거리를 움직인다. (Parallax한 애니메이션)
- 페이지간 이동과 일반적인 step이 있는 UI의 애니메이션이 [다르다](https://9yujin.tistory.com/81?category=1048070#%EB%-D%BC%EC%-A%B-%ED%-C%--%EC%-D%B-%--%EC%--%--%EB%-B%-C%-C%--state%--%EB%B-%--%EA%B-%BD%EC%--%--%--%EB%--%B-%EB%A-%B-%--%EC%--%A-%EB%-B%--%EB%A-%--%EC%-D%B-%EC%--%--%--%EB%--%A-%EA%B-%B-).

페이지 이동 간 애니메이션 뿐만이 아니라 앱 내의 다양한 곳에서 적절히 애니메이션을 넣어 사용자 경험을 향상시키고자 노력했다.

### 3. 바텀시트 활용

앱에서 사용하는 대표적인 UI 컴포넌트이다. 뱅키즈 내에서도 굉장히 많은 상황에 바텀시트를 활용하고 있다. 사용자의 액션을 위해 화면 하단에서 올라오는 컴포넌트를 말한다.

![](https://obsidian-content-assets.s3.ap-southeast-2.amazonaws.com/2025/10/07/bankidz-8-2.gif)

트랜지션그룹과 바텀시트 애니메이션을 같이 보니 부드럽게 이어지는게 굉장히 마음에 든다.

`react-spring-bottomsheet` 라이브러리를 사용하고 있다. 외부 라이브러리 특성상 커스텀할 수 있도록 지정된 스타일 외에는 바꾸기 힘들었지만, 직접 css 요소를 `!important`로 강제해 바꾸어 쓰고 있다.

[돈길 계약하기 과정](https://9yujin.tistory.com/70)에서 사용하는 바텀시트 이외에 서비스 곳곳에서 사용하는 모든 바텀시트는 전역으로 관리되고 있다. 고스락 2차 프로젝트에서 모달 컴포넌트를 전역으로 관리하는 방식과 비슷하다. 때문에 따로 기록을 하진 않았음.

![Pasted image 20251007144952](https://obsidian-content-assets.s3.ap-southeast-2.amazonaws.com/2025/10/07/Pasted%20image%2020251007144952.png)

기획과 디자인이 계속 늘어나고 수정되면서 바텀시트들의 종류도 많아졌다. UI와 액션에 따라 컴포넌트를 적절히 분류하고 사용하고 있다.

특수한 경우 3개를 제외한 모든 바텀시트를 네가지 종류의 컴포넌트로 나누었다. type과 mainAction, subAction 등의 props들을 공통적으로 사용할 수 있다.

```typescript
// '링크가 만료되었어요' 바텀시트
const openExpiredNoticeSheet = (handler: () => void) => {
  setOpenBottomSheet({
    sheetContent: "Notice",
    contentProps: {
      type: "expired",
      onMainActionClick: handler,
    },
  });
};
```

바텀시트를 여는 함수는 이렇게 추상화해서 사용할 수 있다. `sheetContent`로는 위에서 분류한 네가지 컴포넌트 중 하나를, `contentProps`로는 그 컴포넌트에 들어갈 props를 작성한다. 간단하다!

### 4. 웹에서 Input 태그, 키패드 위 버튼 다루기

사용자가 최대한 귀찮음을 느끼지 않도록 하기 위해 불필요한 액션을 줄이도록 노력했다. 아래는 사용자에게 다양한 입력을 받아야 하는 온보딩과 돈길 계약하기 과정이다.


<table>
  <tr>
    <td align="center" width="50%">
      <img src="https://obsidian-content-assets.s3.ap-southeast-2.amazonaws.com/2025/10/07/bankidz-8-4.gif" />
    </td>
    <td align="center" width="50%">
      <img src="https://obsidian-content-assets.s3.ap-southeast-2.amazonaws.com/2025/10/07/bankidz-8-5.gif" />
    </td>
  </tr>
</table>

첫 페이지에 진입 시 입력창에 autoFocus되고, 각 입력이 완료되면 유효성 검사 후에 자동으로 다음 input으로 focus된다. 생년월일의 양식을 똑같이 맞추지 않아도 클라이언트 단에서 후가공 후에 통일된 형태로 서버로 전송하도록 한다.

돈길 계약하기에서는 특히 다양한 입력을 받아야 한다. 돈길 이름, 총 금액, 이자율, 매주 저금액 등이 있다. 각 입력마다 인터랙티브한 요소를 넣어 귀찮음 대신 재미 요소를 줄 수 있었다. 특히 숫자를 입력해야 하는 창은 계산기 형태의 버튼과 슬라이드 바를 이용해 사용자의 불편함을 해소했다.

#### **키패드와 뷰포트**

뱅키즈에서는 해당사항이 없었지만, 모바일 웹을 구현하면서 다들 한번쯤 만났을 문제가 있다. 키패드가 올라올때 안드로이드 브라우저와 사파리 브라우저는 다르게 작동한다. 하단 버튼을 fix 등으로 고정했을때는 뷰포트의 하단에 자리잡게 된다. 하지만 안드로이드 브라우저에서는 키패드가 올라올때, 뷰포트가 화면에서 키패드를 제외한 부분으로 바뀐다. 그렇기 때문에 하단에 고정한 버튼이 키패드 위로 올라오게 되는 것. 물론 토스 같은 서비스를 보면 키패드 위에 버튼이 올라오도록 의도된 디자인이 있지만, 그렇지 않은 경우에는 상당한 멘붕 포인트가 된다.

![](https://obsidian-content-assets.s3.ap-southeast-2.amazonaws.com/2025/10/07/bandkiz-8-3.jpeg)

고스락 2차 프로젝트에서 전화번호와 이름을 받는 페이지이다. 안드로이드는 IOS와 달리, 사진과 같이 하단 고정 버튼이 키패드 위로 올라온다. 이 때 버튼이 input Form 부분을 가리는 경우가 있다. 개발자 대부분이 아이폰을 사용했기 때문에 QA 이전에는 미처 알지 못했던 부분이었다. 뷰포트의 높이가 바뀌는걸 감지해서 일정 높이 이하일 때는 키패드가 올라왔다고 판단해 버튼을 보여주지 않는 것으로 해결했다. 버튼이 없더라도 정해진 글자수만큼 입력하면 자동으로 blur 되도록 처리했기 때문에 불편함은 전혀 없었다.

### 5. 토글 버튼 (로컬 스토리지 캐싱)

![](https://obsidian-content-assets.s3.ap-southeast-2.amazonaws.com/2025/10/07/bandkidz-8-3.gif)

푸쉬 알림 동의를 받는 설정 페이지이다. 앱과 같은 토글 디자인과 애니메이션을 구현했다.

알림 동의 여부 정보는 서버에서 가지고 있다. 알림 설정 페이지에 들어왔을 때 데이터를 패칭하기엔 사용자가 들어올때마다 매번 로딩을 기다리도록 하는게 마음에 들지 않았다. 알림 동의 여부는 자주 변하지 않는 값이므로 로컬 스토리지에 저장된 값을 우선적으로 보여주도록 했다. 그 이후 만약 사용자가 토글하면 서버로 Patch 요청을 하게 되고, 그 응답값으로 다시 서버 상태와 클라이언트 상태(로컬 스토리지)를 동기화한다.

```javascript
const [alert, setAlert] =
  useState < IOptInDTO > (getLocalStorage("alert") || {});

// 로컬 저장소에 값 없을 시 값 패칭해서 사용
const syncAlert = (data: IOptInDTO) => {
  setLocalStorage("alert", data);
  setAlert(data);
};
const { data } = useQuery(queryKeys.USER_OPTIN, userAPI.getUserOptIn, {
  enabled: isEmptyObject(alert),
  onSuccess: (res) => syncAlert(res),
});
```

### 6. highlight 잔상 제거

웹뷰에서 버튼을 터치했을 때 나오는 파란색 또는 회색의 잔상을 css 설정을 통해 제거할 수 있다. 감쪽같은 앱에 한발짝.

```css
noSelect {
  -webkit-tap-highlight-color: transparent;
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  -khtml-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
}
noSelect:focus {
  outline: none !important;
}
```
