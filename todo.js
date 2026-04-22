// ===== TODO / TASK TRACKER =====
// Personal todo list for Moe-chan's owner

function getTodoData() {
  if (!data.todos) {
    data.todos = {
      items: [],       // { id, text, done, createdDate, doneDate, priority }
      nextId: 1,
      completedCount: 0,
    };
    saveData();
  }
  return data.todos;
}

function addTodoItem() {
  const input = document.getElementById('todo-input');
  if (!input) return;
  const text = input.value.trim();
  if (!text) return;

  const td = getTodoData();
  const priority = document.getElementById('todo-priority')?.value || 'normal';

  td.items.push({
    id: td.nextId++,
    text,
    done: false,
    createdDate: todayStr(),
    doneDate: null,
    priority,
  });
  input.value = '';
  saveData();
  renderTodoList();
}

function toggleTodoItem(id) {
  const td = getTodoData();
  const item = td.items.find(i => i.id === id);
  if (!item) return;

  item.done = !item.done;
  item.doneDate = item.done ? todayStr() : null;
  if (item.done) {
    td.completedCount++;
    // MoeBucks reward for completing a task
    if (typeof getSlotData === 'function') {
      const sd = getSlotData();
      const reward = item.priority === 'high' ? 5 : item.priority === 'low' ? 1 : 3;
      sd.moeBucks += reward;
      if (typeof updateSlotMoneyDisplay === 'function') updateSlotMoneyDisplay();
    }
  }
  saveData();
  renderTodoList();
}

function deleteTodoItem(id) {
  const td = getTodoData();
  td.items = td.items.filter(i => i.id !== id);
  saveData();
  renderTodoList();
}

function clearDoneTodos() {
  const td = getTodoData();
  td.items = td.items.filter(i => !i.done);
  saveData();
  renderTodoList();
}

function renderTodoList() {
  const container = document.getElementById('todo-list-area');
  if (!container) return;

  const td = getTodoData();
  const pending = td.items.filter(i => !i.done);
  const done = td.items.filter(i => i.done);

  // Sort pending: high > normal > low
  const prioOrder = { high: 0, normal: 1, low: 2 };
  pending.sort((a, b) => (prioOrder[a.priority] || 1) - (prioOrder[b.priority] || 1));

  const prioColors = {
    high: { bg: 'rgba(255,71,87,0.12)', border: 'rgba(255,71,87,0.3)', dot: '#ff4757', label: '🔴' },
    normal: { bg: 'rgba(112,161,255,0.12)', border: 'rgba(112,161,255,0.3)', dot: '#70a1ff', label: '🔵' },
    low: { bg: 'rgba(123,237,159,0.12)', border: 'rgba(123,237,159,0.3)', dot: '#7bed9f', label: '🟢' },
  };

  let html = '';

  // Stats bar
  html += `
    <div class="todo-stats-bar">
      <span class="todo-stat-pill glass">📋 ${pending.length} pending</span>
      <span class="todo-stat-pill glass">✅ ${done.length} done today</span>
      <span class="todo-stat-pill glass">🏆 ${td.completedCount} total completed</span>
    </div>
  `;

  // Input
  html += `
    <div class="todo-input-row glass">
      <input type="text" id="todo-input" class="todo-input" placeholder="What needs to be done?" onkeydown="if(event.key==='Enter')addTodoItem()">
      <select id="todo-priority" class="todo-priority-select">
        <option value="normal">🔵 Normal</option>
        <option value="high">🔴 High</option>
        <option value="low">🟢 Low</option>
      </select>
      <button class="btn-glossy btn-green" onclick="addTodoItem()" style="padding:8px 16px;">+ Add</button>
    </div>
  `;

  // Pending items
  if (pending.length > 0) {
    html += `<div class="todo-section-label">Tasks</div>`;
    html += pending.map(item => {
      const pc = prioColors[item.priority] || prioColors.normal;
      return `
        <div class="todo-item glass" style="border-left: 3px solid ${pc.dot}; background:${pc.bg};">
          <button class="todo-check-btn" onclick="toggleTodoItem(${item.id})" title="Complete">○</button>
          <div class="todo-item-text">${escHtml(item.text)}</div>
          <span class="todo-prio-dot">${pc.label}</span>
          <button class="todo-delete-btn" onclick="deleteTodoItem(${item.id})" title="Delete">✕</button>
        </div>
      `;
    }).join('');
  } else {
    html += `<div class="todo-empty">No tasks! Add something above, or enjoy the free time 🌸</div>`;
  }

  // Done items
  if (done.length > 0) {
    html += `
      <div class="todo-section-label" style="margin-top:18px;">
        Completed
        <button class="todo-clear-btn" onclick="clearDoneTodos()">Clear all</button>
      </div>
    `;
    html += done.map(item => `
      <div class="todo-item todo-item-done glass">
        <button class="todo-check-btn todo-checked" onclick="toggleTodoItem(${item.id})" title="Undo">✓</button>
        <div class="todo-item-text todo-text-done">${escHtml(item.text)}</div>
        <button class="todo-delete-btn" onclick="deleteTodoItem(${item.id})" title="Delete">✕</button>
      </div>
    `).join('');
  }

  container.innerHTML = html;
}

function initTodo() {
  getTodoData();
  renderTodoList();
}
