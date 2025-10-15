---
title: "[뱅키즈] 6. React transition group (1)"
description:
date: 10/15/2022
draft: false
---
![Pasted image 20250928235440](https://obsidian-content-assets.s3.ap-southeast-2.amazonaws.com/2025/10/16/Pasted%20image%2020250928235440.png)

라우팅 트랜지션을 적용하면서 공식문서도 찾아보고 여러 글들을 참고했는데, 무언가 실무에 쓸 수 있을 정도로 시원하게 해법을 제시한 곳이 없었다. 덕분에 고민을 많이 하게 되었던 경험이었다. 그래서 이번 포스팅을 할땐 react-transition-group을 도입하려는 사람의 궁금증을 제대로 해소해줄 수 있도록 평소보다 조금 더 친절하게 적어나갔다. 이 글을 읽은 누구라도 내 고민에 공감하고 해결방안을 찾아갈 수 있는 글이 되기를!!  
  
이 글에서 공유하고 있는 내용
- react-transition-group을 이용해 라우트간 애니메이션 넣기
- 뒤로가기 버튼 지원 (양방향 슬라이드)

연결된 다른 페이지로 이동할 때에는 오른쪽에서 새로운 페이지가 들어오면서 스택이 쌓이는 듯한 느낌을 주고, 다시 메인화면을 향해 뒤로 돌아갈 때는 위에 쌓였던 페이지가 다시 오른쪽으로 나가는 애니메이션을 구현하고 싶었다. 즉, 라우팅을 할때 트랜지션을 준다.

`react-transition-group` 이라는 공식 라이브러리를 사용했다.

---

### 1. react-transition-group 도입하기
[문서](https://reactcommunity.org/react-transition-group/)를 쓱 본다. 그리 친절하지는 않다. `CSSTransition` 이라는 컴포넌트를 통해 애니메이션을 줄 수 있다. 여러 자식요소에 동시에 애니메이션을 주고 싶다면 CSSTransition 컴포넌트를 TransitionGroup 컴포넌트로 한번 감싼다.

#### RouteTransition.tsx
```typescript
const RouteTransition = ({ location, children }: RouteTransitionProps) => {
  const pathname = location.pathname;

  return (
    <TransitionGroup className={'transition-wrapper'}>
      <CSSTransition
        key={pathname}
        timeout={300}
        classNames={'navigate-push'}
      >
        {children}
      </CSSTransition>
    </TransitionGroup>
  );
};

export default RouteTransition;
```

CSSTransiton 컴포넌트의 props으로 아래의 값들을 준다.
- TransitionGroup 내에서 사용할때 map 함수에서 쓰이는 **key**처럼 쓰인다. 구분용.
- 애니메이션이 나타나는 시간을 **timeout**으로 설정해준다.
- **classNames**을 지정해준다. 아래에서 다시 자세히 보겠다.

![bankidz 6 1](https://obsidian-content-assets.s3.ap-southeast-2.amazonaws.com/2025/10/16/bankidz-6-1.gif)

CSSTransition은 자식 요소들의 클래스를 상태에 따라 바꿔주는 역할을 한다.

- 새로 들어오는 페이지에는 `{classNames}-enter`, 나가는 페이지에는 `{classNames}-exit`
- 트랜지션이 진행중일때는 각각 `enter-active`, `exit-active`
- 완료되면 `enter-done`, `exit-done`의 이름으로 붙는다.

#### Transiton.css
```css
.navigate-push-enter {
  transform: translateX(100%);
}

.navigate-push-enter-active {
  z-index: 1;
  transform: translateX(0);
  transition: transform 300ms ease-in-out;

  box-shadow: -5px 0px 25px rgba(0, 0, 0, 0.05);
}

.navigate-push-exit {
  transform: translateX(0);
}

.navigate-push-exit-active {
  transform: translateX(-20%);
  transition: transform 300ms ease-in-out;
}

.transition-wrapper {
  position: relative;
  width: 100vw;
}
```

클래스마다 css 스타일을 직접 작성했다. 새로 들어오는 페이지는 스택이 쌓이든 오른쪽에서 들어오기 때문에 z-index를 추가로 주었다. 다른 실제 애플리케이션들과 거의 비슷하게 보인다. 결국 라이브러리는 상황에 맞게 자식들의 클래스 이름을 바꿔주는게 전부이고, 그에 맞는 애니메이션은 css를 통해 직접 스타일을 주어야 하는 것.

TransitionGroup 컴포넌트에 `position : relative;` 속성을 주었다. 그리고 ForegroundTemplate과 BackgroundTemplate 컴포넌트의 Wrapper에 `position : absolute;` 속성을 준다.. 해당 탬플릿 레이아웃을 사용하지 않더라고 각 페이지의 최상위 컴포넌트에 모두 `absolute` 속성을 주어야 한다. 그래야 애니메이션이 정상적으로 작동한다.

  
CSSTransiton의 자식으로는 컴포넌트 하나만 들어올 수 있다. 트랜지션 관련 로직을 따로 분리했고 라우팅 컴포넌트를 children으로 받아와 사용한다.  
  

#### ServiceRouter.tsx
```typescript
// ServiceRouter.tsx
const ServiceRouter = () => {
  const location = useLocation();
  return (
    <Wrapper>
      <TabBar />
      <Screen>
        <RouteTransition location={location}>
          <Routes location={location}>
            <Route path="/*" element={<HomeRouter location={location} />} />
            <Route path="/walk/*" element={<WalkRouter />} />
            <Route
              path="/mypage/*"
              element={<MypageRouter location={location} />}
            />
            <Route path="/interest/*" element={<InterestRouter />} />
          </Routes>
        </RouteTransition>
      </Screen>
    </Wrapper>
  );
};

export default ServiceRouter;
```

트랜지션을 적용할 Routes 바깥을 아까 만든 RouteTransition 컴포넌트로 감싸주었다.  
  
사실 위에서 설명하지 않고 넘어간 부분이 있다. 여기서 중요한건 **Routes에 location 객체를 넘겨준다는 것**. 이 작업이 없으면, Routes 아래의 모든 Route들은 항상 현재 상태의 location 객체를 갖는다.

![bankidz 6 2](https://obsidian-content-assets.s3.ap-southeast-2.amazonaws.com/2025/10/16/bankidz-6-2.gif "location 객체를 Routes로 넘기지 않는 경우")


그렇게 되면 이런 대참사가 일어난다. enter하는 페이지와 exit하는 페이지, 이렇게 두개랍시고 보여주긴 한다. 하지만 같은 페이지 두개가 보여진다. 아까 CSSTransition 컴포넌트의 key props로 `location.pathname`을 넣어주었고, 같은 location 객체이기 때문에 같은 key값을 갖는다.

  
매번 Route로 location 객체를 넘겨준다면, 모든 Route는 현재의 location 정보가 아닌 **각자 자신이 받았던 location 정보를 가질 수 있게 된다**.  
  
생각보다 간단하다. 하지만 문제는 이게 끝이 아니다. 바로 위 움짤을 다시 보자. 알림 내역 페이지에서 뒤로가기 버튼을 눌렀을 때가 상당히 어색하다. '뒤로가기'이면 반대 방향의 애니메이션을 따로 줄 수 있어야 한다.  
  

#### 2. 양방향으로 트랜지션 주기 (뒤로가기 버튼)
모든 애니메이션은 클래스명에 따라 지정해둔 스타일대로 일어난다. path가 달라질 때 그게 '뒤로가기'임을 알아내면 클래스 이름을 다르게 줌으로서 애니메이션을 다르게 넣어줄 수 있겠다.

**AppBar.tsx**

```typescript
interface AppBarProps {
  // 이전 페이지명
  label?: string;
  // 이전 페이지 링크
  to?: string;
  // 커스텀 이벤트
  customEvent?: () => void;
}

function AppBar({ label, to, customEvent }: AppBarProps) {
  const navigate = useNavigate();
  const onClickAppBar = () => {
    if (customEvent) {
      customEvent();
    } else {
      to
        ? navigate(to, {
            state: { direction: 'navigate-pop' },
          })
        : navigate(-1);
    }
  };

  return (
    <Wrapper>
      <div onClick={onClickAppBar}>
        <Arrow />
      </div>
      <p>{label}</p>
    </Wrapper>
  );
}

export default AppBar;
```

간략하게 추려낸 상단 앱바 컴포넌트 코드이다. customEvent는 다음편에 언급할 예정이므로 잠깐 무시해준다. **뒤로가기 버튼을 눌렀을 때 location의 state에 direction이라는 객체를 전해준다**. navigate-pop이라는 문자열을 담았음.

![Pasted image 20251016164659](https://obsidian-content-assets.s3.ap-southeast-2.amazonaws.com/2025/10/16/Pasted%20image%2020251016164659.png "hooks.d.ts")


이전에는 그냥 `navigate(-1)`로 히스토리에서 pop을 해주는 식이었지만 위 사진대로 navigate 함수에 옵션을 넣을 수 없다. 그래서 일일이 뒤로갈 주소를 적어주어야 하는 점이 아쉬웠다. 새로 바뀐 코드에서는 외부에서 돌아갈 주소(`to`)를 인자로 받을 수 있고, 라우팅 시에 state를 담을 수 있도록 했다.

```typescript
<TransitionGroup className={'transition-wrapper'}>
  <CSSTransition
    key={pathname}
    timeout={300}
    classNames={location.state?.direction || 'navigate-push'}
  >
    {children}
  </CSSTransition>
</TransitionGroup>;
```

CSSTransiton에서 classNames를 코드와 같이 작성했다. direction state가 있으면 아까 적어준대로 'navigate-pop'을, 없다면 'navigate-push'를. Transition.css에 -pop에 해당되는 스타일도 추가해주었다. translate 방향과 그림자의 방향을 반대로 잘 조절해준다. 야심차게 실행해보자.

![bankidz 6 3 1](https://obsidian-content-assets.s3.ap-southeast-2.amazonaws.com/2025/10/16/bankidz-6-3%201.gif)

세상에 이게 무슨일이야. 문제는 각 라우트에 남겨놓았던 각자 자신의 location객체의 state 때문이었다. 알림내역 페이지에서 갖고 있는 `location.state`는 `null`이다. 반면 뒤로가기 버튼을 통해 라우팅된 메인 페이지의 `location.state`에는 direction 객체가 있다. 그로 인해서 두 페이지의 className이 -pop과 -push로 다르게 들어가게 되는 것.

  
두 요소가 똑같은 className을 받아야 할 필요가 있다. 이 때, TransitionGroup에 **childFactory** props가 등장한다. childFactory는 exiting 하는 자녀 요소를 업데이트할 때 사용할 수 있다 (라고 문서에서 그럼).  
  

**개선된 RouteTransiton.tsx**

```typescript
const RouteTransition = ({ location, children }: RouteTransitionProps) => {
  const pathname = location.pathname;
  const state = location.state;

  return (
    <TransitionGroup
      className={'transition-wrapper'}
      childFactory={(child) => {
        return React.cloneElement(child, {
          classNames: location.state?.direction || 'navigate-push',
        });
      }}
    >
      <CSSTransition exact key={pathname} timeout={300}>
        {children}
      </CSSTransition>
    </TransitionGroup>
  );
};

export default RouteTransition;
```

  
[React.cloneElement](https://ko.reactjs.org/docs/react-api.html#cloneelement)는 인자로 받은 원래 element를 기준으로 새로운 element를 복사하고 반환한다. 반한될때는 원래 요소가 갖고있던 props가 새로운 props와 얕게 합쳐진다고 한다. 각각의 child마다 classNames을 일괄적으로 다시 정해 리턴했다. 이렇게 하면 **이동할 라우트의** **location.state를 모든 자녀가 공통으로 클래스명으로 사용**할 수 있다.

![bankidz 6 3](https://obsidian-content-assets.s3.ap-southeast-2.amazonaws.com/2025/10/16/bankidz-6-3.gif)

'뒤로가기'를 통해 페이지가 바뀔 때는 enter와 exit 두 요소의 클래스명이 모두 'navigate-pop'으로 적용된 것을 확인할 수 있다.

---

![bankidz 6 4](https://obsidian-content-assets.s3.ap-southeast-2.amazonaws.com/2025/10/16/bankidz-6-4.gif)

꽤 만족스러운 결과물이다. 하지만 현실은 그만큼 녹록치 않다. 더욱 완벽한 경험을 위해선 아래의 문제를 해결해야 했다.
- 기존의 라우팅 구조 때문에 생겼던 문제
- 페이지 순서에 따라 다른 애니메이션을 보여주기
- 라우팅이 아닌, state 변경에 따른 애니메이션 넣기
  
[참고1](https://13akstjq.github.io/react/2019/11/08/React-Transition-Group-%EC%99%84%EB%B2%BD-%EC%A0%95%EB%A6%AC%ED%95%98%EA%B8%B0.html)  
[참고2](https://devnm.tistory.com/10?category=1258200)