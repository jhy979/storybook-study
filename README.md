# storybook 공식 문서 정복하기

# 🎯 들어가기 전에..

> 공식 문서에서는 일정 관리를 위한 TaskBox를 만들고 있어요. 이를 따라가면서 작성하겠습니다.
다만, 너무 TaskBox 프로젝트에 국한되기 보다는 제가 몰랐던 부분들을 위주로 적으면서 공부하고자 해요.

## 1. 설치해봅시다

```jsx
npx create-react-app taskbox

cd taskbox

npx -p @storybook/cli sb init
```

## 2. --watchAll 명령어가 있네요?

script에 명령어를 추가하려고 하니 공식문서에서 다음을 말하고 있었어요.

```js
# 터미널에서 테스트 실행
yarn test --watchAll

# 6006번 포트로 브라우저에서 실행
yarn storybook

# 3000번 포트로 App 실행
yarn start
```

### --watchAll 이란?
- --watchAll 명령어는 webpack 빌드할 떄에도 본적이 있었어요. 
- 파일에 변경사항이 있다면 모든 테스트를 다시 시도해요.
- 만약 변경된 파일에 대해서만 재실행하고 싶다면 `--watch` 옵션을 사용하세요.


# 🎯 간단한 컴포넌트 만들기

## 1. 프론트엔드 App의 3가지 양상

1. 자동화된 테스트 (Jest)

2. 컴포넌트 개발 (Storybook)

3. 앱 그 자체 (App)

👉 위의 script 명령어에서 보았던 세 친구들이 모두 있네요.

## 2. CDD

CDD를 경험해본적이 있어요.

Component Driven Development라 하여, Bottom-up 방식으로 컴포넌트를 구현하는 방식이죠.

storybook은 `독립적으로 각 컴포넌트의 UI를 확인`할 수 있기 때문에 CDD에 굉장히 적합한 방식이라고 할 수 있어요.

[Component Driven User Interfaces](https://www.componentdriven.org/)

## 3. 가장 기본적인 storybook

```jsx
import React from 'react';

import Task from './Task';

export default {
  component: Task,
  title: 'Task',
};

const Template = (args) => <Task {...args} />;

export const Default = Template.bind({});
Default.args = {
  task: {
    id: '1',
    title: 'Test Task',
    state: 'TASK_INBOX',
    updatedAt: new Date(2018, 0, 1, 9, 0),
  },
};

export const Pinned = Template.bind({});
Pinned.args = {
  task: {
    ...Default.args.task, // 이런 식으로 재사용하면 좋아요!
    state: 'TASK_PINNED',
  },
};
```

👆 위는 Task 컴포넌트를 위한 Task.stories.js 파일이예요.

`component`: storybook을 하고자 하는 컴포넌트

`title`: storybook 앱의 사이드바에서 컴포넌트를 참조하는 방법

`args`: storybook을 다시 시작하지 않고도 Controls addon으로 컴포넌트를 실시간으로 수정


### export를 왜 할까?

> 위의 파일에서 Default, Pinned 처럼 각각의 storybook을 export하고 있어요. 왜 그럴까요?

`export`: 차후 스토리에서 이를 재사용 할 수 있도록 해줍니다.

👇 아래는 Task를 map 돌면서 많이 사용하는 TaskList라는 컴포넌트에 대한 스토리예요.

```tsx
// TaskStories를 가져옴으로써 편하게 작성할 수 있죠. (최대한 재활용)
import * as TaskStories from './Task.stories';

export const Default = Template.bind({});
Default.args = {
  // 작성해둔 story를 다시 가져와서 args를 재사용하는 모습입니다.
  tasks: [
    { ...TaskStories.Default.args.task, id: '1', title: 'Task 1' },
    { ...TaskStories.Default.args.task, id: '2', title: 'Task 2' },
    { ...TaskStories.Default.args.task, id: '3', title: 'Task 3' },
    { ...TaskStories.Default.args.task, id: '4', title: 'Task 4' },
    { ...TaskStories.Default.args.task, id: '5', title: 'Task 5' },
    { ...TaskStories.Default.args.task, id: '6', title: 'Task 6' },
  ],
};
```

👇 아 참고로, propTypes도 마찬가지입니다. 

(stories에서 정의했던 것을 찐 컴포넌트에서 사용할 수 있구나...)

```jsx
import Task from './Task';

import PropTypes from 'prop-types';

TaskList.propTypes = {
  loading: PropTypes.bool,
  tasks: PropTypes.arrayOf(Task.propTypes.task).isRequired, // 아주 편하게 가져와서 사용!
  onPinTask: PropTypes.func,
  onArchiveTask: PropTypes.func,
};
```

## 4. Action

> UI 컴포넌트를 독립적으로 만들 때, 컴포넌트와의 상호작용을 확인하는데 도움을 줘요.


- 종종, 앱의 컨텍스트에서 함수와 state에 접근하지 못할 수 있어요. 
  - 이런 경우 `action()`을 사용하여 끼워 넣어 주세요.
  - 예시는 조금 아래 redux-store를 만드는 곳에서 확인 가능해요.

- `actions`은 클릭이 되었을때 Storybook UI의 actions 패널에 나타날 콜백을 생성할수 있도록 해줍니다. 

- 예를 들어 버튼을 만들었을 때, 버튼 클릭이 성공적이었는지 테스트 UI에서 확인 할 수 있을 거예요.

```tsx
// in .storybook/preview.js

import '../src/index.css';

export const parameters = {
	// click 등의 이벤트 등을 잡아서 actions 패널에 보여줍니다.
  // preview의 parameters는 미리 모든 액션을 지정? 해주는 느낌이예요.
  actions: { argTypesRegex: '^on[A-Z].*' },
};
```

`매개변수(parameters)`는 일반적으로 Storybook의 기능과 애드온의 동작을 제어하기 위하여 사용됩니다.

또한 이렇게 모킹을 위해 사용할 수도 있어요.

```jsx
// redux store를 위한 초간단 모킹 예시
const store = {
  getState: () => {
    return {
      tasks: TaskListStories.Default.args.tasks,
    };
  },
  subscribe: () => 0,
  dispatch: action('dispatch'), // dispatch라는 액션이 발생한다~
};
```

## 5. 자동화된 테스트

😀 우리는 서버나 프런트엔드 앱 전체(npm run start)를 실행하지 않고 성공적으로 컴포넌트를 만들 수 있게 되었어요. (storybook 👍👍) 

⚠️ 하지만 누군가 각 테스트를 `일일이 클릭`하여 오류나 경고 없이 렌더링 되는지 살펴봐야 합니다. 이를 `자동화`할 수는 없을까요?

### 스냅샷 테스트 (feat. snapshot test)

스냅샷 테스트(Snapshot)는 `주어진 입력`에 대해 컴포넌트의 "양호한" `출력 값을 기록`한 다음, 향후 `출력 값이 변할 때마다 컴포넌트에 플래그를 지정`하는 방식을 말합니다. 

- 이는 새로운 버전의 컴포넌트를 보고 바뀐 부분을 빠르게 확인할 수 있기 때문에 Storybook을 보완해 줄 수 있습니다.

> 스냅샷 테스트 하는 방법: Storyshots 애드온(addon)을 사용하면 각 스토리에 대한 스냅샷이 생성됩니다!

1. 다음의 development dependencies를 추가해주세요.

```tsx
yarn add -D @storybook/addon-storyshots react-test-renderer
```

2. 설치 후 다음 파일 생성해주세요.

```tsx
// src/storybook.test.js

import initStoryshots from '@storybook/addon-storyshots';
initStoryshots();
```

3. 스냅샷 생성 완료!

`Task`스토리를 위한 스냅샷 테스트를 만들어 보았습니다. 

만약 `Task`의 구현을 변경하게 되면, 변경 사항을 확인하라는 메시지가 표시될 거예요.

# 🎯 복합적 컴포넌트 조합하기

## 1. 데코레이터

> 스토리에 임의의 래퍼(wrapper)를 제공하는 한 방법입니다. 

```tsx
export default {
  component: TaskList,
  title: 'TaskList',
	// 이런 식으로 래핑 가능!
  decorators: [(story) => <div style={{ padding: '3rem' }}>{story()}</div>],
};
```

위의 예시에서 데코레이터 key를 사용하여 기본 내보내기에서 렌더링 된 컴포넌트에 padding을 추가했었어요.

또한 데코레이터는 “providers”(React context를 설정하는 라이브러리 컴포넌트)에서 스토리를 감싸 줄 때 사용될 수 있습니다.

typescript에서도 decorator가 존재하는데 이와 비슷한 느낌인 것 같아요. 특정 작업을 수행하기 전에 미리 어떤 작업을 하게 해주도록 하는 것이 decorator가 아닐까 싶습니다.

## 2. Jest를 사용한 단위 테스트 (Unit test)

Storybook 스토리, 수동 테스트, 스냅샷 테스트는 UI 버그를 피하는 데 큰 도움이 됩니다.

```jsx
import React from 'react';
import ReactDOM from 'react-dom';
import '@testing-library/jest-dom/extend-expect';

import { WithPinnedTasks } from './TaskList.stories'; // 만든 스토리 가져오기

it('renders pinned tasks at the start of the list', () => {
  const div = document.createElement('div'); // div 태그 만들고

  ReactDOM.render(<WithPinnedTasks {...WithPinnedTasks.args} />, div); // div 안에 스토리 사용하기

	// 핀 처리된 6번째 task가 가장 위에 있기를 기대해요.
  const lastTaskInput = div.querySelector('.list-item:nth-child(1) input[value="Task 6 (pinned)"]');
  expect(lastTaskInput).not.toBe(null);

  ReactDOM.unmountComponentAtNode(div);
});
```

# 🎯 배포

```jsx
yarn add -D chromatic
```

> 공식 문서에서는 chromatic을 사용해서 배포했어요.

저는 스토리북을 배포할 때 netlify를 이용해서 배포했었는데요,

🤔 왜 공식문서에서는 배포를 chromatic으로 하는지 궁금했어요.

- 답은 금방 나왔습니다. 

- 직접 배포해보니 chromatic은 push될 때마다 새롭게 build를 진행하여 ui 변경점들을 한 눈에 보기 쉬웠어요. 또, 어떤 build version으로든 바로 돌아갈 수 있어서 좋았습니다.

# 🎯 테스트

**수동 테스트**는 개발자가 컴포넌트의 정확성을 수동으로 확인하여 검증합니다. 빌드 할 때 컴포넌트의 모습이 온전한지 점검하는데 도움이 됩니다.


**스냅샷 테스트**는 Storyshots을 사용하여 컴포넌트가 렌더링 된 마크업을 캡처합니다. 렌더링 오류와 경고를 유발하는 마크업의 변경사항을 파악하는데 도움을 줍니다.


**단위 테스트**는 Jest를 사용하여 고정된 입력값을 주었을 때 컴포넌트의 출력 값이 동일하게 유지되는지를 확인합니다. 컴포넌트의 기능적 품질을 테스트하는데 유용합니다.

하지만 이걸로는 부족하다구요!

`시각적 회귀 테스트(Visual regression test)`는 외관상의 변화를 포착하도록 설계되었어요. (이거 우테세에서도 본 기억이 있는데..!!)

새로 렌더링 된 UI 코드의 이미지와 기준 이미지를 비교하는 것에 의존합니다. 만일 UI 변경이 있다면 우리는 그에 대한 알림을 받을 수 있습니다.

업데이트로 인해 실수로 버그가 발생하지 않을 것이라는 검토가 끝나면 UI 변경 사항을 자신있게 병합(merge) 할 준비가 된 것입니다. 새로운 변경 사항이 마음에 드신다면 변경을 수락해주시고, 아니라면 이전 상태로 되돌려주세요.

---

# 🎯 애드온

[Addons | Storybook](https://storybook.js.org/addons)

애드온 목록들인데요, 참 많죠?

> Addons 중에서 가장 자주 쓰이는 Controls에 대해서 알아봅시다!

- Controls는 디자이너와 개발자가 컴포넌트에 전달되는 값를 바꾸어보며 쉽게 컴포넌트의 행동을 살펴볼 수 있게 해줍니다. 

- 게다가.. 코드가 필요하지 않습니다.****

🤔 그래도 왜 쓰는지 와닿지가 않죠?

> 빠르게 엣지 케이스를 재현하고 작업할 수 있습니다.

`Task`컴포넌트에 대량의 문자열을 추가한다면 어떤 일이 벌어질까요?

Controls는 컴포넌트에 여러가지 입력을 빠르게 시도해볼 수 있도록 해줍니다. 

- 긴 문자열과 같은 경우도 마찬가지입니다. 이는 UI 문제점들을 발견하는 일을 줄여줍니다.

- 이제 이러한 엣지 케이스를 재현하고 작업할 수 있습니다.