// TaskFlow — To-Do Web App (OIBSIP Task 3)
// Features: add, complete toggle, inline edit, delete, counts,
// timestamps, localStorage persistence, empty states, filter.

const STORAGE_KEY = 'taskflow_todos_v1';

const form = document.getElementById('task-form');
const input = document.getElementById('task-input');
const formError = document.getElementById('form-error');
const pendingList = document.getElementById('pending-list');
const completedList = document.getElementById('completed-list');
const pendingEmpty = document.getElementById('pending-empty');
const completedEmpty = document.getElementById('completed-empty');
const pendingCount = document.getElementById('pending-count');
const completedCount = document.getElementById('completed-count');
const statTotal = document.getElementById('stat-total');
const statPending = document.getElementById('stat-pending');
const statCompleted = document.getElementById('stat-completed');
const progressFill = document.getElementById('progress-fill');
const progressPct = document.getElementById('progress-pct');
const toast = document.getElementById('toast');
const listsContainer = document.getElementById('lists-container');
const clearCompletedBtn = document.getElementById('clear-completed');

let tasks = loadTasks();
let editingId = null;

function loadTasks() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveTasks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function formatDate(ts) {
  const d = new Date(ts);
  return d.toLocaleString(undefined, {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ---- Toast ----
let toastTimer;
function showToast(msg) {
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2200);
}

// ---- CRUD ----
function addTask(text) {
  const clean = text.trim();
  if (!clean) {
    formError.hidden = false;
    input.focus();
    return;
  }
  formError.hidden = true;
  tasks.unshift({
    id: uid(),
    text: clean,
    completed: false,
    createdAt: Date.now(),
    completedAt: null,
  });
  saveTasks();
  render();
  showToast('Task added ✓');
}

function toggleComplete(id) {
  const t = tasks.find((x) => x.id === id);
  if (!t) return;
  t.completed = !t.completed;
  t.completedAt = t.completed ? Date.now() : null;
  saveTasks();
  render();
  showToast(t.completed ? 'Nice! Task completed 🎉' : 'Moved back to pending');
}

function deleteTask(id) {
  tasks = tasks.filter((x) => x.id !== id);
  if (editingId === id) editingId = null;
  saveTasks();
  render();
  showToast('Task deleted');
}

function startEdit(id) {
  editingId = id;
  render();
  const editInput = document.querySelector(`[data-edit-input="${id}"]`);
  if (editInput) {
    editInput.focus();
    editInput.setSelectionRange(editInput.value.length, editInput.value.length);
  }
}

function saveEdit(id, newText) {
  const clean = newText.trim();
  if (!clean) {
    showToast('Task text cannot be empty');
    return;
  }
  const t = tasks.find((x) => x.id === id);
  if (t) t.text = clean;
  editingId = null;
  saveTasks();
  render();
  showToast('Task updated ✎');
}

function cancelEdit() {
  editingId = null;
  render();
}

// ---- Render ----
function taskItemHTML(task) {
  if (editingId === task.id) {
    return `
      <li class="task ${task.completed ? 'completed' : ''}" data-id="${task.id}">
        <button class="checkbox" data-action="toggle" title="${task.completed ? 'Mark as pending' : 'Mark complete'}">
          ${task.completed ? '✓' : ''}
        </button>
        <div class="task-body">
          <input class="edit-input" data-edit-input="${task.id}" value="${escapeHtml(task.text)}" maxlength="200" aria-label="Edit task" />
          <div class="edit-row">
            <button class="save-btn" data-action="save">Save</button>
            <button class="cancel-btn" data-action="cancel">Cancel</button>
          </div>
          <div class="timestamps">
            <span class="ts">➕ Added: ${formatDate(task.createdAt)}</span>
          </div>
        </div>
      </li>`;
  }

  return `
    <li class="task ${task.completed ? 'completed' : ''}" data-id="${task.id}">
      <button class="checkbox" data-action="toggle" title="${task.completed ? 'Mark as pending' : 'Mark complete'}" aria-label="Toggle complete">
        ${task.completed ? '✓' : ''}
      </button>
      <div class="task-body">
        <div class="task-text">${escapeHtml(task.text)}</div>
        <div class="timestamps">
          <span class="ts">➕ Added: ${formatDate(task.createdAt)}</span>
          ${task.completed && task.completedAt ? `<span class="ts done-ts">✔ Done: ${formatDate(task.completedAt)}</span>` : ''}
        </div>
      </div>
      <div class="task-actions">
        <button class="icon-btn edit-btn" data-action="edit" title="Edit task">✎</button>
        <button class="icon-btn del-btn" data-action="delete" title="Delete task">🗑</button>
      </div>
    </li>`;
}

function render() {
  const pending = tasks.filter((t) => !t.completed);
  const completed = tasks.filter((t) => t.completed);

  pendingList.innerHTML = pending.map(taskItemHTML).join('');
  completedList.innerHTML = completed.map(taskItemHTML).join('');

  // Empty states
  pendingEmpty.style.display = pending.length ? 'none' : 'block';
  completedEmpty.style.display = completed.length ? 'none' : 'block';

  // Counts — "X pending" / "Y completed"
  pendingCount.textContent = `${pending.length} pending`;
  completedCount.textContent = `${completed.length} completed`;

  // Header stats + progress
  statTotal.textContent = tasks.length;
  statPending.textContent = pending.length;
  statCompleted.textContent = completed.length;
  const pct = tasks.length ? Math.round((completed.length / tasks.length) * 100) : 0;
  progressFill.style.width = pct + '%';
  progressPct.textContent = pct + '%';
}

// ---- Events ----
form.addEventListener('submit', (e) => {
  e.preventDefault();
  addTask(input.value);
  input.value = '';
  input.focus();
});

input.addEventListener('input', () => {
  if (input.value.trim()) formError.hidden = true;
});

document.addEventListener('click', (e) => {
  const btn = e.target.closest('[data-action]');
  if (!btn) return;
  const li = e.target.closest('.task');
  if (!li) return;
  const id = li.dataset.id;
  const action = btn.dataset.action;

  if (action === 'toggle') toggleComplete(id);
  else if (action === 'delete') deleteTask(id);
  else if (action === 'edit') startEdit(id);
  else if (action === 'cancel') cancelEdit();
  else if (action === 'save') {
    const editInput = li.querySelector('.edit-input');
    saveEdit(id, editInput ? editInput.value : '');
  }
});

// Enter / Escape while editing (event delegation)
document.addEventListener('keydown', (e) => {
  if (editingId == null) return;
  const activeEdit = document.querySelector(`[data-edit-input="${editingId}"]`);
  if (!activeEdit) return;
  if (document.activeElement !== activeEdit && e.key !== 'Escape') return;
  if (e.key === 'Enter') saveEdit(editingId, activeEdit.value);
  if (e.key === 'Escape') cancelEdit();
});

// Filter pills
document.querySelectorAll('.pill').forEach((pill) => {
  pill.addEventListener('click', () => {
    document.querySelectorAll('.pill').forEach((p) => p.classList.remove('active'));
    pill.classList.add('active');
    const f = pill.dataset.filter;
    listsContainer.classList.remove('filter-pending', 'filter-completed');
    if (f === 'pending') listsContainer.classList.add('filter-pending');
    if (f === 'completed') listsContainer.classList.add('filter-completed');
  });
});

clearCompletedBtn.addEventListener('click', () => {
  const n = tasks.filter((t) => t.completed).length;
  if (!n) {
    showToast('Nothing to clear');
    return;
  }
  tasks = tasks.filter((t) => !t.completed);
  saveTasks();
  render();
  showToast(`Cleared ${n} completed task${n > 1 ? 's' : ''}`);
});

// Initial render
render();
