---
title: "[뱅키즈] 7. React transition group 라우팅 트랜지션 (2)"
description:
date: 11/2/2022
draft: false
---
![](assets/Pasted%20image%2020250929000844.png)

기존 프로젝트에 페이지 전환 애니메이션을 넣으면서 마주쳤던 쓸모없는 우당탕의 기록. 옛날 코드 보는데 그냥 아무생각없이 멍청하게 생각해서 나온 문제가 대부분이었다. 그래도.. 일기같은 느낌쓰로 적어내려가겠습니다. 기본적인 개념과 방법은 이전 글에 잘 정리해 놓았다.  
[[뱅키즈] 6. React transition group 라우팅 트랜지션 (1) - 도입하기](https://9yujin.tistory.com/73)

### 기존의 라우팅 구조 때문에 생겼던 문제
처음 트랜지션 그룹을 도입했을 때의 코드이다. 트랜지션 그룹 관련 로직을 따로 분리를 하지 않았었다. `App.tsx`에 그대로 삽입하면 코드가 너무 길어지는 듯한 느낌을 받았어서, 각각 라우팅 관련 컴포넌트에 개별적으로 트랜지션을 적용하려 했었다.

![](https://blog.kakaocdn.net/dna/BuW7l/btrQeB4aOZJ/AAAAAAAAAAAAAAAAAAAAAAbMqQHKEOLOVHhvlmHG_JGsf3Z1tlgMPUzCYiMgCeR_/img.png?credential=yqXZFxpELC7KVnFOS48ylbz2pIh7yKj8&expires=1759244399&allow_ip=&allow_referer=&signature=QcdPc%2FfjbUA4x27SOzbf9%2FxHZSs%3D)

그랬더니 이런 문제가 생겼음.

![](https://blog.kakaocdn.net/dna/oBaIj/btrQd7WM34l/AAAAAAAAAAAAAAAAAAAAAMArhF9RItfEnFOBFsWIxCiLRA_gaETQ9Hq2wDO84wnH/img.gif?credential=yqXZFxpELC7KVnFOS48ylbz2pIh7yKj8&expires=1759244399&allow_ip=&allow_referer=&signature=xGZ206qdPBqr%2FSdLQuNN5%2BBrNuo%3D)

'돈길 걷기'에서 걷고 있는 돈길이 없을 때 '돈길 계약하기'로 넘어갈 때 애니메이션이 적용되지 않았다. 되게 당연한거였다. 각각 라우터마다 트랜지션 그룹을 적용하려고 했고, '/walk'과 '/create'는 다른 라우터에 있었다.

#### ServiceRouter.tsx
```typescript
const ServiceRouter = () => {
  const location = useLocation();
  return (
    <Wrapper>
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
    </Wrapper>
  );
};
```

이렇게 서비스 관련 라우터를 따로 분리했고, 트랜지션 관련 컴포넌트를 따로 분리했다.

![](https://blog.kakaocdn.net/dna/o5EjR/btrQfJ8fyKx/AAAAAAAAAAAAAAAAAAAAAFeLjEiIOR3unXLODTvzxuSxkdKKWjKmZOAlv0bs4zRb/img.gif?credential=yqXZFxpELC7KVnFOS48ylbz2pIh7yKj8&expires=1759244399&allow_ip=&allow_referer=&signature=GhXHqkyxqSjIRSE5lt%2FJWa2rSDs%3D)

그러고 생긴 또다른 문제.

#### 페이지 순서에 따라 다른 애니메이션을 보여주기
탭바에 있는 세개의 메인 페이지를 왔다갔다 할때도 아까 적용했던 애니메이션이 나타났다. 어떤 위치에 있는 버튼을 누르든지 오른쪽에서 왼쪽으로 넘어가는 애니메이션으로 보인다. 지금 위치에서 왼쪽에 있는 버튼을 누르면 왼쪽으로 슬라이드하고, 오른쪽에 있는 버튼을 누르면 오른쪽으로 슬라이드하도록 해보자.

#### RouteTransition.tsx
```typescript
const pageOrder = ['/interest', '/', '/walk', '/mypage'];

const RouteTransition = ({ location, children }: RouteTransitionProps) => {
  const pathname = location.pathname;
  const state = location.state;

  return (
    <TransitionGroup
      className={'transition-wrapper'}
      childFactory={(child) => {
        if (!state?.prev) {
          return React.cloneElement(child, {
            classNames: location.state?.direction || 'navigate-push',
          });
        } else {
          if (pageOrder.indexOf(pathname) > pageOrder.indexOf(state.prev)) {
            return React.cloneElement(child, {
              classNames: 'slide-next',
            });
          } else {
            return React.cloneElement(child, {
              classNames: 'slide-prev',
            });
          }
        }
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

먼저 페이지의 순서를 배열로 지정해놓았다. 부모와 자녀일때 탭바의 구성이 조금 다르지만 다행히 겹치는 부분이 없어서 하나로 관리할 수 있었다. navigate시 `state`로 받은 값과 `pathname`의 페이지 순서를 비교해서 그에 맞는 클래스로 지정해주는 방식이다.

`ChildFactory`에 각각의 조건마다 다른 className을 넣어준 `cloneElement`를 반환하는 함수를 넣어주었다.

```xml
<NavLink to="/mypage" state={{ prev: pathname }}>
    <Mypage fill={pathname === '/mypage' ? active[1] : active[0]} />
</NavLink>
```

이런식으로 `Link` 컴포넌트에 state를 달아서 라우팅 시 넘겨줄 수 있다.

#### Transiton.css
```css
.slide-next-enter {
  transform: translateX(100%);
}

.slide-next-enter-active {
  transform: translateX(0);
  transition: transform 300ms ease-in-out;
}

.slide-next-exit {
  transform: translateX(0);
}

.slide-next-exit-active {
  transform: translateX(-100%);
  transition: transform 300ms ease-in-out;
}

.slide-prev-enter {
  transform: translateX(-100%);
}

.slide-prev-enter-active {
  transform: translateX(0);
  transition: transform 300ms ease-in-out;
}

.slide-prev-exit {
  transform: translateX(0);
}

.slide-prev-exit-active {
  transform: translateX(100%);
  transition: transform 300ms ease-in-out;
}
```

![](https://blog.kakaocdn.net/dna/vNB4Z/btrQfeOdh1p/AAAAAAAAAAAAAAAAAAAAAKbCP9WzUDpQQe57ojB0kd_h436EKDBd3X8thilUOdP2/img.gif?credential=yqXZFxpELC7KVnFOS48ylbz2pIh7yKj8&expires=1759244399&allow_ip=&allow_referer=&signature=EH8h0YUokj3OyrZYZ1efaKCAg24%3D)

근데 그냥 여기 애니메이션은 빼버렸다. 매번 애니메이션이 들어가니 무언가 번잡해지고, 양끝 사이에서 움직일때 가운데 페이지를 건너뛰고 바로 트랜지션이 되는게 조금 어색했음. 다른 많은 앱들을 보았을 때, 대부분의 경우 탭바 간 이동에는 애니메이션이 없기도 했다.

### 라우팅이 아닌, state 변경에 따른 애니메이션 넣기
돈길 계약하기 과정과 서비스 이용 방법 등에 사용한다. 페이지는 고정되고 그 안에서 내부 컴포넌트에 트랜지션을 주고 싶다. 말로 쓰니까 이해가 잘 안돼서, 결과 먼저.

![](https://blog.kakaocdn.net/dna/DytoR/btrQfdIyBOl/AAAAAAAAAAAAAAAAAAAAALzwdb4IPGURY1x5_oogOwRcXS1XyFJPxl9WaVQMNklA/img.gif?credential=yqXZFxpELC7KVnFOS48ylbz2pIh7yKj8&expires=1759244399&allow_ip=&allow_referer=&signature=s6jaxLoNzAQ%2Bd6bjF1t1A%2BsYSxc%3D)

꽤 이쁘다.

#### SlideTranstion.tsx
```typescript
const SlideTransition = ({
  keyValue,
  direction,
  children,
}: SlideTransitionProps) => {
  return (
    <TransitionGroup
      style={{ position: 'relative' }}
      childFactory={(child) => {
        return React.cloneElement(child, {
          classNames: `slide-${direction}`,
        });
      }}
    >
      <CSSTransition
        key={keyValue}
        timeout={300}
        classNames={`slide-${direction}`}
      >
        {children}
      </CSSTransition>
    </TransitionGroup>
  );
};

export default SlideTransition;
```

별로 다를 것 없다. direction과 key를 props로 받아서 넣어준다.

#### Create.tsx
```typescript
function Create() {
  const [step, setStep] = useState<TStep>(1);
  const [direction, setDirection] = useState<'next' | 'prev'>('next');

  const onPrevButtonClick = () => {
    setDirection('prev');
    setStep((step - 1) as TStep);
  };

  const onNextButtonClick = () => {
    setDirection('next');
    setStep((step + 1) as TStep);
  };

  return (
    <ForegroundTemplate
      label="돈길 계약하기"
      customEvent={step !== 1 ? onPrevButtonClick : undefined}
      to="/"
    >
      <Wrapper>
        <SlideTransition keyValue={step} direction={direction}>
          <ContentWrapper>
          // ...content
          </ContentWrapper>
        </SlideTransition>
      </Wrapper>
    </ForegroundTemplate>
  );
}

export default Create;
```

적당히 덜어서 가져왔다. '다음으로 가기' 또는 '이전' 버튼을 누를 때 step 상태와 함께 direction 상태를 바꿔준다. 각각 key와 direction props로 넘기면 된다. `TransitionGroup`에서 key 값이 바뀌는걸 감지하면 트랜지션을 만들어 주는 것.

step1일 때 뒤로가기를 누르면 슬라이드 애니메이션이 아니라 라우팅 애니메이션(navigate-pop)이 나와야 한다.

```typescript
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
```

앱바 뒤로가기버튼의 onClick에 들어가는 함수이다. `customEvent` props이 있으면 그걸 수행하고, 없을땐 navigate 애니메이션이 일어나도록 했다.

---

단순히 라이브러리만 적용하면 끝날줄 알았는데 생각보다 챙겨야 할게 많다.

그래도 이제, 감쪽같이 앱처럼 동작한다!!