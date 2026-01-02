---
title: "[두둥] 2. 선언적인 코드 작성하기"
description:
date: 03/30/2023
draft: false
tags:
  - 두둥
---
![](https://img1.daumcdn.net/thumb/R750x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdna%2FblUcye%2FbtsnxmzkW3Q%2FAAAAAAAAAAAAAAAAAAAAAFHhzyPrKQICRGcXKT-yYlXRPwnPHnFhqqOE0TBMxsXx%2Fimg.png%3Fcredential%3DyqXZFxpELC7KVnFOS48ylbz2pIh7yKj8%26expires%3D1761922799%26allow_ip%3D%26allow_referer%3D%26signature%3Dy0JFaHRog2nZerWhFcg%252Bs%252Fbw9Yc%253D)

개발을 할때 새로운 무언가를 맞닥뜨리는 경우가 줄어들어서 그런가, 코드를 이쁘게 짜는 것에 관심이 많아졌다. 두둥을 개발하면서 마주친 고민들을 공유해보려고 한다. 리액트로 개발하다보면 선언적인 코드에 대해서 고민하게 된다. 리액트 자체가 선언형이기 때문일수도.

### 선언적인 코드

명령형 프로그래밍과 선언형 프로그래밍에 대한 글들에선 흔히 'How'와 'What'의 차이로 설명한다.

```html
<ul id=”list”></ul>
<script>
var arr = [1, 2, 3, 4, 5]
var elem = document.querySelector("#list");

for(var i = 0; i < arr.length; i ++) {
  var child = document.createElement("li");
  child.innerHTML = arr[i];
  elem.appendChild(child);
}
</script>
```

반복문을 통해 배열의 원소를 순회하면서 html요소를 생성하고 보여주는 코드이다. 어떤 절차로 이루어지는지가 드러나 있다.

```typescript
const arr = [1, 2, 3, 4, 5];
return (
  <ul>
    {arr.map((elem) => (
      <li>{elem}</li>
    ))}
  </ul>
);
```

React에서 jsx 문법을 사용하면 이렇게 표현할 수 있다. 핵심 데이터만 외부에서 전달 받고 세부적인 구현은 `map`함수를 통해 숨겨져있다. 복잡한 작업을 추상화했다고 말할 수 있다.

한단계 더 추상화한다면

```ts
<NumberListItem data={arr}/>
```

해당 컴포넌트 내부에서 어떤 방식으로 돌아가는지는 신경쓰지 않고, **무엇을 보여줄지**만 전달했다. 더욱 빠르게 코드의 역할을 파악할 수 있게 되었다.

프론트엔드 개발을 할 때는 선언적인 코드를 "추상화 레벨이 높아진 코드"로 볼 수 있다. 하지만 **무조건 높다고 좋은 것은 아니다**. 여러군데에서 재활용되고 있는 컴포넌트를 사용하는 페이지에 약간의 수정이 필요할때 종종 문제가 생긴다. 기능을 추가하기 위해 조건을 걸고 prop을 더하다 보면, 오히려 책임이 많아지고 네이밍이 모호해지기도 한다. 때문에 추상화의 레벨을 적절히 선택해야 할 필요가 있다.

---

두둥에도 선언적인 코드가 자주 사용되고 있다. 이전 두번의 프로젝트를 이어오면서 많은 기능이 그대로 두둥으로 들어왔다. 그 때부터 염두에 두던 리팩토링을 하는 기분으로 개발을 할 수 있었다. 몇군데 소개해보도록 하겠다.

### 무한 스크롤

#### 리팩토링 이전

기존 고스락 티켓에서 응원톡은 무한스크롤로 보여진다. 이렇게 서버에서 데이터를 연속적으로 받아오고 적절한 방식으로 렌더링하는 동작을 추상화해서 사용하고 있다.

- [[고스락 티켓 2.0] React-Query 무한스크롤 (with useInfiniteQuery)](https://9yujin.tistory.com/61)

`React Query`의 `useInfiniteQuery`를 사용하고 있다. 무한스크롤 데이터들을 각 페이지 데이터들의 배열로 받아오도록 추상화되어있다. 해당 라이브러리 함수의 사용법 자체는 위 글에 정리되어있다.

```typescript
const TalkList = ({ talkList }: { talkList: ITalk[] }) => {
  return (
    <Wrapper>
      {talkList.map((talk) => (
        <TalkBubble
          nickName={talk.nickName}
          content={talk.content}
          createdAt={talk.createdAt}
          iComment={talk.iComment}
          key={talk.id}
        />
      ))}
    </Wrapper>
  );
};
```

```typescript
<TalkListWrapper isOpen={isOpen} ref={talkListRef}>
  {data?.pages.map((talkList) => (
    <TalkList talkList={talkList.talkList} key={talkList.lastId} />
  ))}
  <Observation />
</TalkListWrapper>
```

받아온 데이터들은 위와같이 두번의 `map`을 통해 렌더링된다. 각 페이지마다 한번, 그 안에서 한번. `useInfiniteQuery`와 `map`함수의 도움으로 이미 어느정도 추상화되어 있는 코드이다.

#### 리팩토링 이후

두둥에서는 응원톡 뿐만 아니라 공연, 호스트, 멤버 목록 등에서 무한스크롤을 사용해야 하는 상황이 많아졌다. 무한스크롤 페이지를 위해 매번 컴포넌트를 두개씩 만들어 쓰는건 불편하다. 한단계 더 추상화해본다면 아래와 같이 해볼 수 있을 것이다.

```typescript
const { infiniteListElement } = useInfiniteQueriesList<EventResponse>(
    ['events', keyword],
    ({ pageParam = 0 }) =>
      EventApi.GET_EVENTS_SEARCH({ keyword, pageParam, size: 12 }),
    EventLink,
  );
```

`useInifiniteQueriesList`라는 Hook이다. 쿼리키, api 호출 함수(QueryFn), 렌더링할 아이템(ListItem), 이렇게 3개의 핵심정보만 전달한다. 무한스크롤로 받아온 데이터와 ListItem을 이용해 `infiniteListElement`를 만들어 반환한다.

```ts
<EventList>{infiniteListElement}</EventList>
```

이렇게 사용할 수 있다.

전체 Hook의 코드이다. `observer`에서 스크롤의 끝을 찾으면 새로운 데이터를 패칭해오고, `map`으로 `ListItem` 컴포넌트를 반복하는 흐름이 숨겨져있다.

```typescript
export const useInfiniteQueriesList = <T,>(
  queryKey: QueryKey,
  apiFunction: (payload: any) => Promise<InfiniteResponse<T>>,
  ListItem: (props: any) => JSX.Element,
  options?: UseInfiniteQueryOptions<
    InfiniteResponse<T>,
    AxiosError,
    InfiniteResponse<T>,
    InfiniteResponse<T>,
    QueryKey
  >,
) => {
  const { data, fetchNextPage } = useInfiniteQuery<
    InfiniteResponse<T>,
    AxiosError
  >(queryKey, apiFunction, {
    getNextPageParam: (lastPage) => lastPage.page + 1,
    ...options,
  });         
  const [ref, inView] = useInView();
  /* observer 관련... */
  const observer = (
    <div className="observer" ref={ref} style={{ height: '1px' }} />
  );

  const listElement = data?.pages.map(({ content }) =>
    content.map((item, idx) => <ListItem {...item} key={`item-${idx}`} />),
  );

  const isEmpty = data?.pages[0].content.length === 0;

  return {
    infiniteListElement: (
      <>
        {listElement}
        {observer}
      </>
    ),
    isEmpty,
  };
};
```

해당 Hook을 이용해 다양한 페이지에서 무한스크롤을 사용할 수 있도록 제네릭을 이용하고 있다. QueryFnData의 타입으로 `InfiniteResponse<T>`를 넣어주고 있다.

```typescript
export interface InfiniteResponse<T> {
  content: T[];
  page: number;
  size: number;
  hasNext: boolean;
}
```

무한스크롤로 받아오는 데이터의 타입은 모두 위와 같이 통일되어 있다. content로 다양한 타입의 값이 들어올 수 있다. 쿼리 옵션도 옵셔널로 받고 있기 때문에 자유롭게 넣어 사용할 수 있다. 실제로 응원톡은 2초마다 pulling하도록 하는 옵션이 설정되어 있다.

### Overlay 컴포넌트

![Pasted image 20251016170814](https://obsidian-content-assets.s3.ap-southeast-2.amazonaws.com/2025/10/16/Pasted%20image%2020251016170814.png)

모달창 역시 고스락 티켓에서부터 계속 써오던 UI였다. 두둥을 개발하면서 모바일일 땐 화면 아래에서 올라오는게 더 자연스럽다고 생각해서 바텀시트로, PC에선 모달로 오버레이를 띄우도록 했다.

```typescript
const { isOpen, openOverlay, closeOverlay } = useOverlay();

<OverlayBox open={isOpen} onDismiss={closeOverlay}>
  <SelectTicket items={tickets?.ticketItems} eventName={detail.name} />
</OverlayBox>
```

### Popup 컴포넌트

![Pasted image 20251016170818](https://obsidian-content-assets.s3.ap-southeast-2.amazonaws.com/2025/10/16/Pasted%20image%2020251016170818.png)

어드민페이지에서 테이블 메뉴를 클릭했을 때 뜨는 팝업 메뉴 컴포넌트이다. 이 외에도 헤더의 프로필을 클릭했을 때, 검색 옵션을 변경할 때 팝업 컴포넌트를 사용한다.

```typescript
<Popup options={approveWaitingOptions}>
    <Icon name="threeDot" />
</Popup>;
```

그럴 때 `Popup` 컴포넌트를 사용하고 있다. `children`으로 팝업 버튼으로 사용할 컴포넌트를 넣어준다. 어떤 옵션을 보여줄지 `PopupOptions[]` 타입의 객체를 전달하기만 하면 끝이기 때문에 선언적인 코드로 볼 수 있다.

```typescript
const approveWaitingOptions: PopupOptions[] = [
  {
    text: '승인하기',
    onClick: () => {
      approveMutate({ eventId, order_uuid: data.orderUuid });
    },
  },
  {
    text: '자세히 보기',
    onClick: () => {
      openOverlay({
        content: 'tableViewDetail',
        props: { eventId, order_uuid: data.orderUuid },
      });
    },
  },
];
```

예를 들어, `approveWatingOptions`는 `text`와 `onClick`을 속성으로 갖는 객체의 배열이다. 승인 대기중인 주문의 정보를 확인하거나 주문을 승인할 때 사용한다. 위에서 작성했던 `useOverlay` Hook의 `openOverlay` 함수를 사용해 모달을 여는 옵션임을 알 수 있다!


참고
- [https://sangmin802.github.io/Study/Think/abstract%20painting/](https://sangmin802.github.io/Study/Think/abstract%20painting/)  
- [https://toss.tech/article/frontend-declarative-code](https://toss.tech/article/frontend-declarative-code)  
- [https://toss.im/slash-21/sessions/3-3](https://toss.im/slash-21/sessions/3-3)