---
title: "[뱅키즈] 4. 돈길 계약하기"
description:
date: 10/7/2022
draft: false
---
![](https://blog.kakaocdn.net/dna/7DAgu/btrMS3cvqjP/AAAAAAAAAAAAAAAAAAAAAMFOLSKshLuXz9WTvSjAsh9HxJTWZPQIhLjBZZ6iltl3/img.png?credential=yqXZFxpELC7KVnFOS48ylbz2pIh7yKj8&expires=1759244399&allow_ip=&allow_referer=&signature=AW5PZAxRAc6bqMBXDVQt%2B14%2B3uM%3D)

특별할건 없는 단순 구현이지만 많이 고민하고 노력한게 아까워서 적는 포스팅. 앱의 가장 핵심인 돈길을 생성하는 과정을 '돈길 계약하기'라는 워딩을 통해 아이들도 재미있게 느낄 수 있도록 했다. 총 다섯개의 단계를 밟아 정보를 입력하고, 마지막에 사인을 하고 제출하면 계약 영수증이 보여지는 형식이다. 기획과 디자인팀의 노고가 느껴진다. 그리고 저걸 구현한 나도... 기능 하나하나에 많은 공을 들였어서 그런지 특히 애정이 있는 뷰들이다.  
  
팀원과 기술블로그에 대한 이야기을 나눈 적이 있다. 프로젝트 경험을 기록할 때 어렵게 공부하며 사용했던 기술을 정리할 수 도 있고, 어려운 화면을 구현하며 머리 싸맸던 고민을 기록할 수 도 있다. 난 블로그 포스팅에 시간을 꽤 많이 쓰는 편이라, 이 모든것들을 기록으로 남기는게 과연 효율적인 공부방법인지에 확신이 없었다. 팀원에게 어떻게 생각하냐고 물었더니 - 어려운 기술은 나중에 다시 와서 볼 수 있어서 좋은 반면, **단순 구현에 대한 고민은 그 과정에서 너의 피지컬이 올라갔으니 그거만으로도 이득이다** - 라고 생각한댔다. 그래도 그냥 넘어가기는 뭔가 아쉽잖아. 앞으로 기술 블로그 운영하는 방법을 더 많이 고민해봐야겠다. 그래도 뱅키즈하면서 개발 피지컬이 확 좋아진건 틀림없다.  
  

### 1. 바텀시트 라이브러리 - 바텀시트 바깥 부분 터치 처리 커스텀훅

![](https://blog.kakaocdn.net/dna/zqY2a/btrNmzIYIxN/AAAAAAAAAAAAAAAAAAAAACqYx_nhqK4Pydo_f61Qr7zJ6gwOCdbGxPkOgCL6Ecoi/img.gif?credential=yqXZFxpELC7KVnFOS48ylbz2pIh7yKj8&expires=1759244399&allow_ip=&allow_referer=&signature=whWBj2oNe6epnYiTRkKh5PhD5Yk%3D)

바텀시트의 바깥부분을 눌렀을때는 시트가 닫힌다. 근데 해당 인풋부분을 눌렀을떈 그대로 인풋에 포커스가 유지되면서 시트도 계속 올라와 있어야 한다. 그 로직을 커스텀훅으로 따로 빼 컴포넌트와 분리를 해주었다.

```typescript
import { useEffect, useRef } from 'react';

function useBottomSheetOutSideRef(handler: () => void) {
  const sheetDivRef = useRef<HTMLDivElement>(null);
  const inputDivRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent): void => {
      if (
        sheetDivRef.current &&
        inputDivRef.current &&
        !inputDivRef.current.contains(e.target as Node) &&
        !sheetDivRef.current.contains(e.target as Node)
      ) {
        handler();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [inputDivRef]);

  return [sheetDivRef, inputDivRef];
}

export default useBottomSheetOutSideRef;
```

바텀시트와 인풋 요소에 접근하기 위한 ref를 두개 둔다. 클릭 이벤트가 발생한 곳이 해당 조건을 만족할 때에만 전달된 핸들러 함수를 실행되도록 했다. 그리고 훅에선 그 ref를 반환한다.

```typescript
function Step3({ currentStep }: { currentStep: number }) {

  const [open, onOpen, onDismiss] = useBottomSheet(false);
  const [sheetDivRef, inputDivRef] = useBottomSheetOutSideRef(onDismiss);

  return (
    <Wrapper>
      <InputSection validate={validateAmount}>
        <div onClick={onOpen} ref={inputDivRef}>
          <InputForm
            sheetOpen={open}
          />
        </div>
        <p>{validateAmount.message}</p>
      </InputSection>

      <ContractSheet
        open={open}
        onDismiss={onDismiss}
        sheetRef={sheetDivRef}
      >
        <div>{/* 바텀시트 */}</div>
      </ContractSheet>
    </Wrapper>
  );
}

export default Step3;
```

페이지 컴포넌트에선 이런식으로 사용할 수 있다. 관련이 있는 부분만 남기고 지워서 가져왔더니, 알아보기 조금 힘들수도. 중요한 부분은 커스텀훅에서 반환받은 inputRef와 sheetDivRef를 각각 컴포넌트에 넘겨주는 것!! 바텀시트 닫는 함수를 인자로 넘겨서 핸들러 함수로 사용한다.  
  

### 2. 계산기를 형상화한 금액 입력 커스텀 키보드

![](https://blog.kakaocdn.net/dna/G5xV7/btrNqMGHMJf/AAAAAAAAAAAAAAAAAAAAABLUF6yKWcAAITRllhk7S1_8GfgY54XyMGg7UApw-dxV/img.gif?credential=yqXZFxpELC7KVnFOS48ylbz2pIh7yKj8&expires=1759244399&allow_ip=&allow_referer=&signature=23gSLG%2BRP8XY2SwtBw%2FP90tczTE%3D)

목표 금액을 입력할 수 있는 커스텀 키보드이다. 아이들이 재미있게 돈길을 계약할 수 있도록 계산기을 형상화 한 디자인이다. 기획에서 요구한 점이 꽤 특이했다. 각 금액에 해당하는 지폐 모양의 버튼을 누르면 그만큼의 돈이 추가된다. 오른쪽 아래 두 버튼 중, 왼쪽을 누르면 가장 최근에 추가한 금액만큼 지워진다. 예를 들어 500원, 5000원, 만원 순서대로 눌렀다가 취소하면 : 15500 → 5500 → 500 → x 순으로 돌아가게 되는 것.  
  
이를 구현하기 위해 스택을 사용했다.

```typescript
function useStackAmount() {
  const [amountStack, setAmountStack] = useState<number[]>([]);

  const pushAmount = (amount: number) => {
    setAmountStack((prev) => [...prev, amount]);
  };
  const popAmount = () => {
    setAmountStack((prev) => prev.filter((v, i) => i !== prev.length - 1));
  };
  const resetAmount = () => {
    setAmountStack([]);
  };

  return [amountStack, pushAmount, popAmount, resetAmount] as const;
}

export default useStackAmount;
```

자바스크립트에 스택이 있나?? 나중에 찾아봐야지. 일단 그냥 비슷하게 구현했다. 버튼을 클릭할 때 마다 숫자 배열의 뒤에 값을 추가한다. 삭제 (돌아가기) 버튼을 누를 땐 배열의 마지막 값을 삭제해줌.

```typescript
  // stack에 있는 숫자들 더해서 form state에 저장
  useEffect(() => {
    const amount = amountStack.reduce((acc, cur) => {
      return (acc += cur);
    }, 0);
    setForm({ ...form, contractAmount: amount });
  }, [amountStack]);
```

반환하는건 선택한 지폐들의 합산이 아닌 그냥 배열이기 때문에, 전체금액으로 다 더해주는 과정이 필요하다.  
  

### 3. 밸리데이션 검사 커스텀훅

위 금액 입력 관련 움짤에서 유효성 검사 문구가 제때제때 잘 뜨는걸 확인할 수 있다. 목표 금액은 1500원 이상 30만원 이하만 입력할 수 있다. 각각 단계에서 들어가는 값들의 유효성을 검사하는 로직을 컴포넌트 내에서 처리하려고 했지만, 너무너무 길어지는 바람에. 그 로직을 컴포넌트와 분리해보려고 했다. 커스텀훅이다. (또?)

```typescript
type TFormType = 'contractName' | 'contractAmount' | 'comment';

const validateResultContent = {
  // ...생략,
  contractAmount: {
    default: { error: false, message: '최소 1500원에서 최대 30만원까지 설정할 수 있어요!' },
    under: { error: true, message: '1,500원 이상으로 부탁해요!' },
    over: { error: true, message: '30만원 이하로 부탁해요!' },
    pass: { error: false, message: '적절한 금액이에요!' },
  },
};


function useValidation() {
  const [validateResult, setValidateResult] =
    useState<TValidationResult>(initialState);

  const validateContractName = (
    value: string,
    existChallengeNames: string[],
  ) => {
    //... 생략
  };

  const validateContractAmount = (value: number) => {
    if (!value) setValidateResult(validateResultContent.contractAmount.default);
    else if (value < 1500)
      setValidateResult(validateResultContent.contractAmount.under);
    else if (value > 300000)
      setValidateResult(validateResultContent.contractAmount.over);
    else setValidateResult(validateResultContent.contractAmount.pass);
  };

  const validateComment = (value: string) => {
      //... 생략
  };

  const checkValidate = (
    formType: TFormType,
    value: string | number,
    existChallengeNames?: string[],
  ) => {
    if (formType === 'contractName' && typeof value === 'string') {
      validateContractName(value, existChallengeNames!);
    }

    if (formType === 'contractAmount' && typeof value === 'number') {
      validateContractAmount(value);
    }

    if (formType === 'comment' && typeof value === 'string') {
      validateComment(value);
    }
  };

  return [validateResult, checkValidate] as const;
}

export default useValidation;
```

이런식으로!! validate하는 함수와 validate 결과를 리턴해준다. form마다 다른 검사를 수행한 뒤에, error 여부와 message를 담은 객체를 결과로 보낸다.

```typescript
function Step3({ currentStep }: { currentStep: number }) {
  const [disabledNext, setDisabledNext] = useState<boolean>(true);
  const [validateName, checkValidateName] = useValidation();
  const [validateAmount, checkValidateAmount] = useValidation();

  //form 값이 바뀔때마다 유효성검사 실행
  useEffect(() => {
    checkValidateName('contractName', form.contractName, existingDongilName);
    checkValidateAmount('contractAmount', form.contractAmount);
  }, [form]);

  // 다음으로 버튼 활성화,비활성화 처리
  useEffect(() => {
    validateName.message === '완전 좋은 이름인데요!' &&
    validateAmount.message === '적절한 금액이에요!'
      ? setDisabledNext(false)
      : setDisabledNext(true);
  }, [validateAmount, validateName]);

  return (
    <Wrapper>

    {/* ...생략 */}
      <InputSection validate={validateAmount}>
          <InputForm
            placeholder="부모님과 함께 모을 금액"
            value={
              form.contractAmount === 0
                ? ''
                : getCommaThreeDigits(form.contractAmount)
            }
            error={validateAmount.error}
            onBlur={() => {
              checkValidateAmount('contractAmount', form.contractAmount);
            }}
          />
        <p>{validateAmount.message}</p>
      </InputSection>
    </Wrapper>
  );
}
```

한 페이지에 폼이 두개 이상 들어가는 경우에도, 훅을 필요한 만큼 가져와서 쓰면 된다. 배열로 리턴하기 때문에 이름을 지정해서 받아올 수 있어 편리하다. 폼 내용이 바뀔 때, 인풋이 blur 될 때 검사를 매번 실행한다. 반환받은 결과값에서 error가 아닐 때에만 다음으로 버튼을 활성화 시킨다.  
  
객체에서 error값으로 조건을 두면 안되나?? - error 부울로 인풋 테두리의 색깔을 결정하는데, 입력한 값이 없을 때 기본값으로 error가 false이다. 검사에 통과했을 때 나오는 메시지를 조건으로 두었다. 약간 아쉽긴 한데, 뭐... 그래도 직관적이야.  
  

### 4. 스와이프 저금액 입력

![](https://blog.kakaocdn.net/dna/b301QM/btrNtEv6rP0/AAAAAAAAAAAAAAAAAAAAAEj-igeoNmc_O94yfFZr1ugT1ow-u8HvUlJ8fgIGC1Nj/img.gif?credential=yqXZFxpELC7KVnFOS48ylbz2pIh7yKj8&expires=1759244399&allow_ip=&allow_referer=&signature=vpqFAMe20eYqgfKtLt6u9Vp1tHI%3D)

저 작은 페이지 하나에서 고비가 세 군데나 있었다.

1. 목표 저금액에 따라서 **매주 저금액의 상한, 하한**이 정해진다. 근데 이자부스터가 껴있어서 그걸 계산하는 방법을 되게 많이 고민해야 했음.
2. 스와이프하면서 입력된 매주 저금액이 계속 바뀌는데, **이자부스터에 따른 추가 저금액과 끝나는 주**를 계산을 해야 했다.
3. 그리고 무엇보다 저 **스와이프 바 css**가 제일 문제. 하지만 디자인이 제일 중요하니까!!

  
**첫번째.**  
원래 기획은 돈을 모으는 기간과 매주 저금액에 따라 이자를 받도록 했었다. 매주 1000원을 모으고 5주를 모으면 5000원을 받는 형식. 하지만 기간과 매주 저금액을 정하기 전에 **상한과 하한값**을 먼저 보여줘야 했는데, 상한과 하한값은 전체 금액에 따라 달라진다. 근데 또 전체 금액은 이자액에 따라 달라짐. 흐름이 뒤엉켜서 애초에 불가능한 방법이었다.  
  
그래서 결국 기획을 바꿔버림. 전체 저금액 * 이자율로 먼저 계산을 해두고 사용했다. 그럼 흐름이 순서대로 가서 계산된 값을 쓸 수 있음.

```typescript
const getChallengeStep4Prices = (
  totalPrice: number,
  interestRate: 10 | 20 | 30 | null,
) => {
  // 500원 단위로 올림
  const getRoundUpBy500 = (price: number) =>
    price % 500 === 0 ? price : price - (price % 500) + 500;

  const maxPrice = interestRate
    ? getRoundUpBy500(((1 - 0.01 * interestRate) * totalPrice) / 3)
    : getRoundUpBy500((0.8 * totalPrice) / 3);
  const minPrice = interestRate
    ? getRoundUpBy500(((1 - 0.01 * interestRate) * totalPrice) / 15)
    : getRoundUpBy500((0.8 * totalPrice) / 15);

  // 20퍼센트일때 가정한 중간금액
  const middlePrice =
    (minPrice + maxPrice) / 2 - (((minPrice + maxPrice) / 2) % 500);

  return { minPrice, maxPrice, middlePrice };
}

export default getChallengeStep4Prices;
```

뱅키즈에서 계약할 수 있는 기간은 3주부터 15주까지이다. 이에 맞추려고 (이자부스터를 제외한) 혼자 모으는 금액에 3 또는 15를 나눈 금액으로 상한 하한을 설정한다. 기본값은 이자율이 20%인 경우를 보여줌.  
  
**두번째.**  
필요 주수와, 끝나는 주의 주 (n월 n주차)를 계산해서 보여준다. [주차 계산](https://falsy.me/javascript-%EC%9E%85%EB%A0%A5%ED%95%9C-%EB%82%A0%EC%A7%9C%EC%9D%98-%ED%95%B4%EB%8B%B9-%EB%8B%AC-%EA%B8%B0%EC%A4%80-%EC%A3%BC%EC%B0%A8-%EA%B5%AC%ED%95%98%EA%B8%B0/) 로직은 여기서 가져옴. JS로 구현된 함수를 타입으로 바꾸기만 했다. 덕분에 제일 걱정했던 부분을 빠르게 해결할 수 있었다. 휴! 코드를 붙여넣으려고 했다가 그냥 단순계산인데 굳이 필요할까 싶어서.. 스킵.  
  
**세번째.**

진짜 제일 고생했던 부분. `rc-slider`라는 라이브러리를 사용했다. 기본 input 태그를 이용할 수 있었지만, 모바일 환경에서 터치로 조작할 때 부자연스러운 느낌이 많아서 다른 라이브러리를 도입했다. 내부적으로 touch event까지 받아서 사용하더라.

```typescript
<RangeInputForm>
  <StyledSlider
    min={min}
    max={max}
    value={value}
    onChange={(v) => setValue(v as number)}
    step={step}
    railStyle={RcSliderRailStyle}
    trackStyle={RcSliderTrackStyle}
    handleStyle={RcSliderHandleStyle}
  />
  <Selector percent={percent}>
    <WalkingBanki />
  </Selector>
  <ProgressBar percent={percent} />
  <Track />
</RangeInputForm>;
```

하. 삽질을 많이했다. 결국 라이브러리로 가져온 슬라이더의 스타일을 모두 가리고, 눈에 보이는 컴포넌트를 따로 만들어 같이 움직이도록 했다. Selector는 뱅키 버튼, ProgressBar는 노란색 진행 바, Track은 회색 바.

```xquery
const percent = ((value - min) * 100) / (max - min);

const Selector = styled.div<{ percent: number }>`
  position: absolute;
  top: -16px;
  height: 40px;
  width: 44px;
  z-index: 3;
  ${({ percent }) => {
    return percent > 0
      ? css`
          left: calc(${percent}% - (0.44 * ${percent}px));
        `
      : css`
          left: 0px;
        `;
  }};
`;
```

position을 absolute로 두고, left 속성을 직접 주고 이동시켰다. 그냥 퍼센트로 하면 안되는게, 저 요소의 왼쪽 끝을 기준으로 이동하기 때문에 100%일때 삐져나오는 경우가 있었음. 그래서 퍼센트와 너비에 비례해서 조금 빼줘야했다.  
  
근데 또 ProgressBar는 Selector와 똑같이 하면 뱅키 왼쪽 옆구리가 비어서 22px(뱅키 절반)만큼 더해줘야했음. 에라이.  
  

### 5. 사인 전송하기 (Presigned Url

![](https://blog.kakaocdn.net/dna/m9L1x/btrNY1XQfN5/AAAAAAAAAAAAAAAAAAAAAPxCYeMj2Yy0Nvtb5rT0k3IMlrImB560gWVhs-xTuE8s/img.gif?credential=yqXZFxpELC7KVnFOS48ylbz2pIh7yKj8&expires=1759244399&allow_ip=&allow_referer=&signature=Lg0JD30upsjtlidG%2Flw8j2N%2FBwM%3D)

사인을 하고 서버에 전송한다. `react-signature-canvas` 라이브러리를 사용했다.

```typescript
function Signature({ setDisabledNext, setSign }: SignatureProps) {
  const canvasRef = useRef<any>(null);

  const onEndSign = () => {
    setDisabledNext(false);
    if (canvasRef.current) {
      const signImage = canvasRef.current
        .getTrimmedCanvas()
        .toDataURL('image/png');
      setSign(signImage);
    }
  };

  return (
    <Wrapper>
      <CanvasContainer>
        <SignatureCanvas
          penColor={theme.palette.greyScale.black}
          canvasProps={{ className: 'sigCanvas' }}
          ref={canvasRef}
          onEnd={onEndSign}
          minWidth={1.5}
          maxWidth={3.5}
        />
      </CanvasContainer>
      <p>이곳에 사인을 하면 계약이 진행돼요</p>
    </Wrapper>
  );
}

export default Signature;
```

`onEnd` props에서 사인이 끝났을 때 (클릭/터치가 끝났을때) 실행할 함수를 지정해줄 수 있다. png 이미지를 dataUrl 형태로 바꿔 state에 저장해둔다.

  
기존에 s3 업로드를 구현했을 땐 클라이언트에서 서버로 이미지를 보내고, 서버에서 s3로 업로드 한 다음에 반환받은 링크를 다시 클라이언트로 보내주는 형식이었다. 리소스 낭비가 심하고 서버에 부담이 심하다.  
  
presigned URL은 말 그대로 이미 서명된 주소를 사용하는 것이다. 서버에서 s3 버킷에 업로드할 수 있는 주소를 미리 발급받고 클라이언트로 보내면, 클라이언트에서는 그 주소로 업로드 요청을 보낸다.

```typescript
  // 렌더링하자마자 presignedUrl 가져오기
  useEffect(() => {
    const getPresignedUrl = async () => {
      try {
        const response = await axiosPrivate.get('/s3/url');
        dispatch(setFileName(response.data.imageName));
        setPreSignedUrl(response.data);
      } catch (err) {
        console.error(err);
      }
    };
    getPresignedUrl();
  }, []);
```

step5 페이지가 렌더링 되면 바로 서버로 url을 달라고 요청한다.

```typescript
  // 다음으로 버튼 클릭
  const onClickNextButton = () => {
    // s3 업로드 로직
    const uploadS3 = async (sign: any) => {
      const file = convertDataURLtoFile(sign, preSignedUrl.imageName);
      let formData = new FormData();
      formData.append('file', file);

      const response = await axios.put(preSignedUrl.preSignedUrl, file, {
        headers: { 'Content-Type': 'image/png' },
      });
    };
    uploadS3(sign);
    mutatePostChallenge(createChallengePayload);
  };
```

다음으로 버튼을 클릭하면 발급받은 preSignedUrl로 사인 이미지를 전송하고, 리덕스 스토어에 쌓아둔 돈길 계약 관련 입력 정보들을 서버로 보내 계약을 완료한다. [이미지를 파일로 변환](https://stackoverflow.com/questions/35940290/how-to-convert-base64-string-to-javascript-file-object-like-as-from-file-input-f/38935990)하고 폼데이터 형식으로 또 바꿔주는 과정이 필요하다. 이 과정에서 삽질을 어마무시하게 했다.  
  
처음에 계속 4xx 에러가 났다. aws 버킷 설정에서 cors 관련 설정을 풀어줬어야 하는데, put 메소드가 설정에 등록이 되어 있지 않아서 생긴 문제였음. 추가해주니 제대로 업로드되었다.  
  
굉장히 오래걸렸던 과정인데 글로 쓰고보니 이렇게 짧다.