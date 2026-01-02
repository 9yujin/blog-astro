---
title: "[뱅키즈] 5. React Query 마이그레이션"
description:
date: 10/13/2022
draft: false
tags:
  - 뱅키즈
---
![Pasted image 20250928235440](https://obsidian-content-assets.s3.ap-southeast-2.amazonaws.com/2025/10/16/Pasted%20image%2020250928235440.png)

이전에 쓴 포스팅들을 보면 알겠지만 유튜브나 블로그들에서 리액트 쿼리에 대한 컨텐츠들을 접했고 고스락 프로젝트에 도입을 했었다. 서버에서 받아온 데이터를 캐싱하거나, 에러 핸들링이 편하게 된다는 점이 너무너무 좋았다.

[My구독의 React Query 전환기](https://tech.kakao.com/2022/06/13/react-query/)
[React Query와 상태관리](https://www.youtube.com/watch?v=MArE6Hy371c)

카카오와 우아한에서 일하시는 분들의 기록이다. 둘 다 비슷한 문제를 겪고 고민했던 내용을 담고 있다. 리덕스에서 비동기 통신을 하고 서버 상태를 관리하기 시작하면서 관리하기 힘들어지고 소스도 비대해지는 문제였다. 정말 신기한건, 뱅키즈에서도 이와 똑같은 문제를 느꼈다.

---

### 1. 리액트 쿼리로 전환한 이유

처음 **Redux Toolkit**을 도입했을땐 정말 신선하게 느꼈다. 고스락 프로젝트에서 좋다고 사용했던 순수 리덕스와 thunk에서의 액션, 액션 타입, 리듀서 등의 이런저런 방대한 코드가 없어도 된다는 게 편리했다.

하지만 점점 프로젝트가 방대해지고 처음 기획과 달라지는 부분이 생기면서 조금씩 어려운 부분이 생기기 시작했다.

#### createChallengeSlice.tsx
```typescript
type TcreateChallengeState = {
  status: TFetchStatus;
  error: string | undefined;
  challenge: {
    challengeCategory: string;
    isMom: boolean | null;
    itemName: string | null;
    title: string;
    interestRate: 10 | 20 | 30 | null;
    interestPrice: number;
    totalPrice: number;
    weekPrice: number;
    weeks: number;
    fileName: string;
  };
  response: TPostChallengeResponseState | null;
};
```

돈길생성 스토어에는 아래와 같은 형식으로 저장된다. 돈길 계약하기의 단계를 밟으면서 받은 정보들을 `state.challenge`에 저장한다. 각 다른 path에서 진행하기 때문에 전역으로 관리를 해야했다.

계약서에 사인하고 다음 버튼을 누르면 스토어 정보를 가져와 api 요청의 인자로 넣어 서버로 전송한다. POST 요청의 응답이 오면 그 정보들 또한 스토어에 저장한다. 응답받은 데이터를 가져와 돈길 계약요청 완료 모달을 띄우기 때문이다. 그렇기 때문에 state 안에서 status, error, response 상태도 함께 관리한다.

```typescript
export const postChallenge = createAsyncThunk(
  'createChallenge/postChallenge',
  async (axiosPrivate: AxiosInstance, { getState, rejectWithValue }) => {
    try {
      const { createChallenge } = getState() as RootState;
      const response = await axiosPrivate.post(
        '/challenge',
        createChallenge.challenge,
      );
      return response.data;
    } catch (err) {
      if (axios.isAxiosError(err)) {
        return rejectWithValue(err);
      }
    }
  },
);

export const createChallengeSlice = createSlice({
  name: 'createChallenge',
  initialState,
  reducers: {
    setParent(state, action: PayloadAction<boolean>) {
      state.challenge.isMom = action.payload;
    },
    setItemName(state, action: PayloadAction<string>) {
      state.challenge.itemName = action.payload;
    },
    setTitle(state, action: PayloadAction<string>) {
      state.challenge.title = action.payload;
    },

    // ...생략

    resetChallengePayload(state) {
      return initialState;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(postChallenge.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(postChallenge.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.response = action.payload;
      })
      .addCase(postChallenge.rejected, (state, action) => {
        state.status = 'failed';
      });
  },
});
```

`createAsyncThunk`와 `createSlice` 함수이다. 클라이언트 상태와 서버 상태가 분리되지 않고 하나로 관리되고 있다. 그 뿐이 아니라 API 요청 상태나 에러 유무까지 (전역으로 관리할 필요가 없는 것들임에도) 스토어에서 담당하고 있다. **리덕스 사용이 비효율적이고 Boilerlate 코드가 비대해진다¹.**

심지어 제안받은 돈길 (proposedDonil)의 경우는 오직 비동기 통신을 위해서만 상태 관리 라이브러리를 사용했다. 단순히 상태관리 라이브러리를 의도에 맞지 않게 사용한다는 것 외에도 다른 문제가 있었다. 부모가 '제안받은 돈길'을 수락하면 해당 돈길은 '금주의 돈길'로 보여져야 한다. '제안받은 돈길'과 '금주의 돈길'은 다른 슬라이스에서 관리되고 있기 때문에 굉장히 번거로운 작업이 필요했다. 돈길 수락 PATCH 요청을 보내면서 **서버의 상태는 변화되지만, 리덕스에 저장하고 있는 돈길의 상태는 클라이언트에서 직접 업데이트를 해주어야 한다²**.

전역 클라이언트 상태와 서버 상태를 하나의 스토어에서 관리하게 되면서 점점 비대해지고 관심사의 분리가 어렵게 되는 점, 서버의 최신 데이터를 가져와 유지하는데에 추가적인 소요가 있는 점 - 으로 현재의 문제점을 요약할 수 있을 것 같다.

문제점을 일찍이 인지하고 있었지만 스프린트가 꽤 긴박하게 돌아가서 대대적인 리팩토링을 계속 미루고 있었다. 스프린트 마지막에 마이페이지 작업을 시작하면서 리액트 쿼리를 새로 도입했다.

user 정보와 family 정보는 앱의 전반적인 부분에서 자주 쓰이는 상태들이다. 기존엔 홈('/')이 렌더링 될때 thunk 액션을 디스패치해서 정보를 받아왔다. 보통의 루트대로 홈에서 마이페이지로 가는 경우에는 받아온 정보가 있을테니 상관 없겠지만, 새로고침하거나 알림탭에서 바로 마이페이지로 이동하는 경우에는 받아온 정보가 없다. 스토어에서 값을 확인해보고 받아온 데이터가 없으면 패칭하는 로직을 구현했다가 어, 이거 이미 있는거잖아. 곧바로 리액트 쿼리를 도입했다.

####  2. 두번째 써보는 리액트 쿼리

```crystal
├── App.tsx
├── assets
├── components
├── index.tsx
├── lib
│   ├── apis # API 관련 로직 규격화 및 추상화
│   │   ├── ${controller}/${controller}API.ts
│   │   └── ${controller}/${controller}DTO.ts
│   ├── constants # queryKey 별도 파일을 통해 객체로 관리
│   ├── hooks
│   │   └── queries # query 사용 관련 공통 로직 함수화 custom hook
│   ├── styles
│   ├── types
│   └── utils
├── pages
└── store
    ├── app
    └── slices
```

처음 리액트 쿼리를 알게 되고 고스락 프로젝트에 바로 도입을 해서 사용했었다. 그때 처음 공부하고 사용하면서 느꼈던 아쉬운 점들을 보완해서 프로젝트의 구조를 짜보았다.

```typescript
import { axiosPrivate } from '../axios';
import { IFamilyGroupPayload, IFamilyDTO, IKidListDTO } from './familyDTO';

const familyAPI = {
  getFamily: async (): Promise<IFamilyDTO> => {
    const response = await axiosPrivate.get('/family');
    const data = response.data;
    return data;
  },

  getKid: async (): Promise<IKidListDTO[]> => {
    const response = await axiosPrivate.get('/family/kid');
    const data = response.data;
    return data;
  },

  // ...생략
};

export default familyAPI;
```

**API 호출 함수들은 따로 분리해 객체 형식으로 내보낸다**¹**.** 객체 리터럴을 통해 싱글톤으로 만들 수 있다. 서버의 로직과 비슷하게 controller 그대로 분류를 해주었다. `userAPI.getUser`, `challengeAPI.postChallenge` 따위로 가져와 사용한다. 스웨거 명세를 보고 거의 그대로 옮겨왔기 때문에 controller 이름과 메소드, uri만 보고도 편하게 자동완성으로 함수를 가져올 수 있다.

```typescript
export interface IMyPageDTO {
  user: IUserDTO;
  kid: IKidDTO | null;
  parent: IParentDTO | null;
}

export interface IUserDTO {
  username: string;
  isFemale: boolean;
  isKid: boolean;
  birthday: string;
  phone: string | null;
}
```

API 반환값의 타입으로 **백엔드에서 사용하는 DTO의 타입을 그대로 가져와 클라이언트 코드에 이식했다²**. 서버 상태를 서버 상태답게 직관적으로 관리하기 위해 고민했던 결과였다. 역시 스웨거 모델에서 보여주는 그대로 옮겨왔다.

다른 API에서 사용하는 DTO를 포함하는 DTO도 있음. 이런 경우에 굉장히 편리하게 타입을 지정해줄 수 있다. 받아온 데이터의 일부만 필요할 때에는 utility 타입을 통해서 각 컴포넌트마다 필요한 형태로 가공해 사용할 수 있다.

```typescript
interface SecondRowProps
  extends Pick<IChallengeDTO, 'totalPrice' | 'weekPrice' | 'interestRate'> {}
```

영수증 모달 중 두번째 줄 컴포넌트에 들어가는 props의 타입이다. IChallengeDTO에서 필요한 값만 `Pick`을 통해 가져온다. 기존에 RTK로 비동기 처리를 했을 때에는 서버 상태의 타입과 클라이언트 로직에서 필요한 타입이 혼재되거나 중복되는게 많았다.

**복잡하거나 반복되는 로직은 커스텀훅으로 추상화해 사용했다³.** 이 부분에도 특히 고민이 많았다. 모든 `useQuery`문을 커스텀훅으로 만들어서 API 함수와 같이 분리하려고도 했다. 쿼리문을 사용하는 컴포넌트 내에서 쿼리키와 API 객체를 임포트할 필요 없이 훅 하나로 간단히 쓸 수 있다는 장점이 있었다. 하지만 그만큼 불필요한 코드가 많아지고 쓸데없는 작업이 필요했다.

```typescript
const useLeaveFamilyMutation = (
  options?: UseMutationOptions<IFamilyDTO, AxiosError, any, void>,
) => {
  return useMutation(familyApi.leaveFamily, options);
};

const { mutate: MutateLeaveFamily } = useLeaveFamilyMutation({
  onSuccess: () => {
    openLeaveGroupCompletedSheet();
    queryClient.invalidateQueries(queryKeys.FAMILY);
    queryClient.invalidateQueries(queryKeys.FAMILY_KID);
  },
});
```

이런식으로. 인자로 넣어주는 옵션의 타입을 적으며 삽질한건 둘째 치고, 매번 옵션을 넣어주어야 한다면 굳이 커스텀훅으로 만들 필요가 없다는 의견이 있었다. `useUserQuery`, `useFamilyQuery`처럼 자주 호출하는 함수나, 알림내역 무한스크롤 쿼리처럼 복잡한 로직들만 따로 훅으로 작성하기로.

대신 **쿼리키를 더 체계적으로 관리⁴** 해보려고 했다. 쿼리키의 이름은 api의 url을 그대로 가져온다, 객체 리터럴 형식으로 작성한다. 이 역시 고스락 프로젝트에서는 고려하지 않고 대충 넘어갔던 부분이었음. `queryKeys.` 로 자동완성을 이용할 수 있는점이 상당히 편했다.

#### 3. 좋았던 점
- 뻔하지만, 서버 상태 캐싱.
- 코드량이 굉장히 적어졌다. 특히 slice. 사실 원래 클라이언트 상태는 그리 많지 않았다.
- 제공하는 API 상태를 이용해서 다양한 로직을 쉽게 구현할 수 있다. enabled 옵션과 함께 사용해 쿼리문을 지정한 순서대로 수행할 수도 있고, 무한스크롤도 편히 적용했다.
- onSuccess와 onError를 통해 요청이 성공했을 때와 실패했을 때 실행할 로직을 넣어줄 수 있다. defaultOptions 에서 공통으로 에러핸들링을 해준다면, useQuery를 사용하는 컴포넌트에서는 오직 요청이 성공했을 때만의 상황만 볼 수 있다.
- 서버 상태와 클라이언트 상태가 완벽하게 분리되었고, 항상 최신 상태를 유지할 수 있다.