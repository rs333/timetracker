// This is a minimal Jest test to simulate the focus problem in the in-progress comment box.
// It assumes jsdom is available (as in Jest's default environment).

/**
 * @jest-environment jsdom
 */

document.body.innerHTML = `
  <table><tbody id="periodsBody"></tbody></table>
`;

let window = globalThis;
window.inProgressComment = '';

function renderPeriodsSim() {
  const tbody = document.getElementById('periodsBody');
  // Save focus and selection for in-progress comment
  let prevInput = document.getElementById('inProgressComment');
  let prevSelectionStart = null, prevSelectionEnd = null;
  let wasFocused = false;
  if (prevInput && document.activeElement === prevInput) {
    wasFocused = true;
    prevSelectionStart = prevInput.selectionStart;
    prevSelectionEnd = prevInput.selectionEnd;
  }
  tbody.innerHTML = '';
  // Simulate in-progress row
  const tr = document.createElement('tr');
  tr.id = 'inProgressRow';
  tr.innerHTML = `
    <td>now</td>
    <td><em>In progress</em></td>
    <td>00:00:10</td>
    <td>
      <input class="comment-input" type="text" id="inProgressComment" value="${window.inProgressComment || ''}" autocomplete="off" />
    </td>
  `;
  tbody.appendChild(tr);
  const input = document.getElementById('inProgressComment');
  if (input) {
    input.addEventListener('input', (e) => {
      window.inProgressComment = e.target.value;
    });
    // Restore focus and selection if previously focused
    if (wasFocused) {
      input.focus();
      if (prevSelectionStart !== null && prevSelectionEnd !== null) {
        input.setSelectionRange(prevSelectionStart, prevSelectionEnd);
      }
    }
  }
}

test('in-progress comment input retains focus after render', () => {
  renderPeriodsSim();
  const input = document.getElementById('inProgressComment');
  input.value = 'abc';
  input.focus();
  input.setSelectionRange(1, 2);
  // Simulate timer update (re-render)
  window.inProgressComment = input.value;
  renderPeriodsSim();
  const input2 = document.getElementById('inProgressComment');
  expect(document.activeElement).toBe(input2);
  expect(input2.selectionStart).toBe(1);
  expect(input2.selectionEnd).toBe(2);
});
