---
title: "[뱅키즈] 2. 시작하기"
description:
date: 07/26/2022
draft: false
---
![Pasted image 20250928235440](https://obsidian-content-assets.s3.ap-southeast-2.amazonaws.com/2025/10/16/Pasted%20image%2020250928235440.png)

다른 팀에 비해 볼륨은 배로 큰 상황이었지만 제일 천천히 진도를 나갔다. 할 수 있는 고민은 다 하고 시작하지만, 그래도 개발을 하다보면 어긋나는게 생긴다. 이번 글은 뱅키즈 프로젝트의 초기 세팅에 대한 기록. 팀 프로젝트 직전에 마지막으로 했던 팀 협동 스터디에서 사용했던 코드와, 이전에 고티켓 플젝에서 사용했던 스택들이 많은 도움이 되었다. 여기서 세팅하면서 배운 것들은 이제 막 시작한 두번째 고티켓 프로젝트에서 또 요긴히 사용할 예정.

다음은 이 글에서 언급할 내용들이다.

- 리덕스 툴킷
- 디렉토리 구조
- 깃허브 액션과 도커를 이용한 자동 배포 세팅

### 1. 리덕스 툴킷

상태관리를 위해 어떤 라이브러리를 사용할지에 대한 이야기가 많았다. 리덕스 떵크, 리코일 등등 고려했지만 RTK를 사용하기로 결정. 사실 몇주전 유튜브에서 본 우아한 유튜브 어쩌구에서 리코일과 리액트 쿼리를 이용해 서버 상태와 클라이언트 상태를 분리한다는 영상을 보고 나서, 리코일을 한번 써보고 싶었다. 실제로 매주 진행하는 동아리 스터디 과제에 리코일을 도입해서 사용해보았다. 문서보고 기초적으로 따라하는 정도에 그쳤지만 꽤 편했다. 하지만 팀원과 이야기한 결과, 아직 현업에서 더 많이 사용하는 RTK를 사용하기로 했다. RTK는 처음 사용해보지만 예시 코드를 보니 원래 쓰던 리덕스와 달리 꽤 간결해지고 직관적이어서 좋았다.

#### createSlice

```typescript
export const challengePayloadSlice = createSlice({
  name: "challengePayload",
  initialState,
  reducers: {
    dispatchParent(state, action: PayloadAction<boolean>) {
      state.challenge.isMom = action.payload;
    },
    /* ...생략 */
  },
  extraReducers: (builder) => {
    builder
      .addCase(postChallenge.pending, (state) => {
        state.status = "loading";
      })
      .addCase(postChallenge.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.response = action.payload;
      })
      .addCase(postChallenge.rejected, (state, action) => {
        state.status = "failed";
        console.log(action.payload);
      });
  },
});
```

RTK의 핵심이다. 기존에 그냥 리덕스만을 사용할 땐 액션의 type, 생성 함수, 리듀서 등을 직접 작성해야 했는데, `createSlice`를 이용해 이를 한방에 해결할 수 있다. (내가 봐도 요상한 네이밍은 곧 수정할 예정..) 단순히 상태를 변경하는 리듀서 함수들은 slice 내부의 reducers에서 생성할 수 있다. extraReducers는 밑에서 쳐다보겠음.

```typescript
export const {
  dispatchParent,
  dispatchItemName,
  ...

} = challengePayloadSlice.actions;
```

이렇게 export 하면 외부 컴포넌트에서 `dispatch(dispatchParent);` 와 같이 사용해 액션을 실행 할 수 있다.

#### createAsyncThunk

기본적으로 redux thunk를 내장하고 있다.

```typescript
// POST: 프로필 정보가 없는 회원에 대해 입력받은 프로필 정보 전송
export const postChallenge = createAsyncThunk(
  "challengePayload/postChallenge",
  async (axiosPrivate: AxiosInstance, { getState, rejectWithValue }) => {
    try {
      const { challengePayload } = getState() as RootState;
      const response = await axiosPrivate.post(
        "/challenge",
        challengePayload.challenge
      );
      return response.data;
    } catch (err) {
      if (axios.isAxiosError(err)) {
        return rejectWithValue(err);
      }
    }
  }
);
```

예시로, 챌린지를 등록하는 내용의 코드이다. rtk에서 제공하는 `createAsyncThunk`를 통해 비동기 액션을 만들고 리듀서에 등록할 수 있다. **액션 타입 문자열과 프로미스를 반환하는 콜백 함수를 인자로 받아서 주어진 액션 타입을 접두어로 사용하는 프로미스 생명 주기 기반의 액션 타입을 생성합니다.** 라고 함.

아까 위에서 slice의 코드를 보면 **extraReducers** 부분이 있다. 프로미스가 반환하는 pending, fulfilled, rejected에 따른 액션을 등록할 수 있다. 여기서 중요한것. Thunk 안에서 try-catch로 에러를 바로 잡아버리면 액션은 무조건 fulfilled로 넘어간다. (라고 경험했는데, 문서에는 **실패한 요청이나 thunk 오류는 rejected 프로미스를 반환하지 않는다. dispatch의 result를 사용하지 않을 때 uncaught 되는 것을 방지하기 위해서** 라고 써있음. 조금 더 공부가 필요하다).

그렇기 때문에 `rejectWithValue` 를 이용하거나, 아니면 `.unwrap()`를 이용하거나. 두가지 경우에 대해서 보겠다.

프로미스를 반환하는 콜백함수에 두번째 인자로 라이브러리가 제공하는 thunkApi가 들어간다. `thunkApi.rejectWithValue`를 이용하면 에러를 잡아서 정상적으로 rejected로 보낸다. 컴포넌트에서는 스토어에서 status를 받아와 상태에 따라 렌더링을 다르게 한다든지 등의 처리를 할 수 있다. [문서](https://redux-toolkit.js.org/api/createAsyncThunk#handling-thunk-errors)

두번째론 에러를 잡지 않고 보낸 후에 `.unwrap()`를 사용하는 방법이 있다. 반환되는 프로미스를 직접 까주는건가봄. [문서](https://redux-toolkit.js.org/api/createAsyncThunk#unwrapping-result-actions)

```typescript
useEffect(() => {
  async function processLogin() {
    try {
      await dispatch(login({ code })).unwrap();
      navigate("/");
    } catch (error: any) {
      console.error(error.message);
    }
  }
  processLogin();
}, []);
```

이런 식으로 dispatch 이후에 바로 에러를 확인한다. 그걸 캐치해서 처리할 수 있음. 문서에는 unwrap은 thunk의 결과를 핸들링, rejectWithValue는 에러를 핸들링한다고 쓰여있음. 둘 중에 어떤게 더 좋은 방법인지는 조금 더 고민해 보고 사용할 필요가 있겠다.

### 2. 디렉토리 구조

초기에 세팅했던 구조는 다음과 같다.

```crystal
├── .github # PR탬플릿, 액션 워크플로우 관련
├── .storybook # 스토리북 세팅
├── public
├── src
│   ├── assets # 아이콘, 이미지, 폰트 파일 등
│   ├── components # 컴포넌트 관련 파일
│   │   ├── common
│   │   └── [...]
│   ├── hooks # 커스텀 훅
│   │   ├── api
│   │   ├── common
│   │   └── [...]
│   ├── lib
│   │   ├── api # axios 설정
│   │   ├── constants # 도메인, 키 등의 상수
│   │   ├── styles # GlobalStyle, ThemeProvider 관련
│   │   ├── types # type, interface 관련
│   │   └── utils # 유틸 함수 관련
│   ├── pages # 페이지 관련 파일
│   ├── store
│   │   ├── app # store 세팅
│   │   └── slices # RTK slice 파일 작성
│   ├── App.tsx
│   └── index.tsx
└── 각종 세팅 파일들과 리드미 파일
```

크게 구성할땐 어렵지 않았지만, 하위 디렉토리 구성이 어려웠다. assets들은 어떻게 분류할지, 컴포넌트들.. 타입들은 어떻게 관리할지 등등. 개발을 하는 중간에도 수번씩 바꿨던 경험이 있다. 정리는 필요하지만 뎁스가 너무 깊어지는걸 별로 안좋아해서 머리가 아팠다. 그래도 꽤 보기좋게 정리 된 것 같다.

### 3. 도커 자동 배포 세팅

이전까지 데브옵스에 관해선 완전히 문외한이었다. 다른 누군가가 세팅해준대로 쓰거나, 매번 직접 배포를 하거나. 이번엔 직접 CICD 세팅을 해보고 싶은 욕심이 있었다. 개발 자체에 시간도 부족한데 매번 배포와 테스트를 위해 시간을 쓰는것도 아낄 수 있도록.

[\[React\] Docker + Nginx + Github Actions (1)](https://9yujin.tistory.com/47)

리액트 프로젝트를 깃허브 액션을 통해 도커 허브에 푸쉬하는 과정이다. **Docker**, **Nginx**, **Github Actions**를 이용했다.

[\[React\] Docker + Nginx + Github Actions 배포하기(2)](https://9yujin.tistory.com/49)


deploy 레포지토리에 액션이 트리거되면 도커 컴포즈를 이용해 백엔드, 클라이언트, nginx 세개의 이미지를 받아와 실행한다.

자세한 기록은 위의 기록으로.

![Pasted image 20251016164104](https://obsidian-content-assets.s3.ap-southeast-2.amazonaws.com/2025/10/16/Pasted%20image%2020251016164104.png "장장 10트만에 성공")


### 4. 절대 경로 설정

프로젝트가 규모가 커지고 뎁스가 깊어지면서 파일을 import 해올때마다 번거로워졌다. 타입스크립트 리액트 환경에서 절대경로를 사용할 수 있도록 세팅을 해보았다.

[[React] 절대경로 설정하기 with TS, Storybook, CRA, Craco](https://9yujin.tistory.com/50)

Craco를 통해 webpack config를 건드릴 수 있다.


**추가 삽질**

craco를 사용하면서 npm이 아닌 yarn을 이용해 빌드를 해야했는데 자꾸만 빌드 에러가 났다.

Package.lock.json 대신 yarn.lock를 가져오고,  
`npm ci` 대신 `yarn install --frozen-lockfile`을 실행한다.  
그 이전에 `npm install yarn --global --force`로 yarn을 설치해줌.

자꾸 yarn을 설치하는데에서 오류가 났다. 이미 yarn이 깔려있는데 overwrite됐다고 함. 근데 그렇다고 안깔면 커맨드 실행안됐다구 어쩌구... 베이스로 가져오는 node의 버전이 문제였다. 14버전이었는데 16으로 올려주니까 해결. 참고했던 파일에서 실행하는 커맨드들은 수정할 생각은 했는데, 맨 윗줄을 건드릴 생각은 못했다. 멍충멍충. 질문했던 친구에게 "너 정도 경험이면 이정도는 할줄 알아야 한다.. 너도 이제 독립해야 될 때다.." 라는 쓴소리 들었다.
