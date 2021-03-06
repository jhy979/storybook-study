import React from 'react';
import ReactDOM from 'react-dom';
import '@testing-library/jest-dom/extend-expect';

import { WithPinnedTasks } from './TaskList.stories'; //π  Our story imported here

it('ν μ²΄ν¬λ μΌμ μ κ°μ₯ μμ μ¬λ €μ λ³΄μ¬μ€λλ€.', () => {
  const div = document.createElement('div');
  //π Story's args used with our test
  ReactDOM.render(<WithPinnedTasks {...WithPinnedTasks.args} />, div);

  // We expect the task titled "Task 6 (pinned)" to be rendered first, not at the end
  const lastTaskInput = div.querySelector('.list-item:nth-child(1) input[value="Task 6 (pinned)"]');
  expect(lastTaskInput).not.toBe(null);

  ReactDOM.unmountComponentAtNode(div);
});