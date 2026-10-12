// MyTodo app — add / complete / edit / delete + counts + timestamps + localStorage

var STORAGE_KEY = 'mytodo_tasks_v1';

var form = document.getElementById('task-form');
var input = document.getElementById('task-input');
var dateInput = document.getElementById('task-date');
var formError = document.getElementById('form-error');
var pendingList = document.getElementById('pending-list');
var completedList = document.getElementById('completed-list');
var pendingEmpty = document.getElementById('pending-empty');
var completedEmpty = document.getElementById('completed-empty');
var pendingCount = document.getElementById('pending-count');
var completedCount = document.getElementById('completed-count');
var statTotal = document.getElementById('stat-total');
var statPending = document.getElementById('stat-pending');
var statCompleted = document.getElementById('stat-completed');
var progressPct = document.getElementById('progress-pct');
var progressFill = document.getElementById('progress-fill');
var ringFill = document.getElementById('ring-fill');
var toast = document.getElementById('toast');
var listsContainer = document.getElementById('lists-container');
var clearCompletedBtn = document.getElementById('clear-completed');

var tasks = loadTasks();
var editingId = null;

function loadTasks() {
  try {
    var raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return seedIfEmpty();
    var arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr : [];
  } catch (e) { return []; }
}

// starter tasks so it looks like the design on first open
function seedIfEmpty() {
  var now = Date.now();
  var H = 3600000;
  var seed = [
    { id: 's1', text: 'Complete web development assignment', completed: false, createdAt: now - 2 * H, completedAt: null },
    { id: 's2', text: 'Read 20 pages of a book', completed: false, createdAt: now - 3 * H, completedAt: null },
    { id: 's3', text: 'Go for a 30 minute walk', completed: false, createdAt: now - 4 * H, completedAt: null },
    { id: 's4', text: "Prepare for tomorrow's meeting", completed: false, createdAt: now - 5 * H, completedAt: null }
  ];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
  return seed;
}

function saveTasks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function makeId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

// "Oct 12, 2024 10:30 AM"
function formatDate(ts) {
  var d = new Date(ts);
  var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  var h = d.getHours();
  var ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  var m = String(d.getMinutes()).padStart(2, '0');
  return months[d.getMonth()] + ' ' + d.getDate() + ', ' + d.getFullYear() + ' ' +
    String(h).padStart(2, '0') + ':' + m + ' ' + ampm;
}

function escapeHtml(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// "2026-10-15" -> "Oct 15, 2026"
function formatDue(ymd) {
  if (!ymd) return '';
  var parts = ymd.split('-');
  if (parts.length !== 3) return ymd;
  var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  var m = parseInt(parts[1], 10);
  if (m < 1 || m > 12) return ymd;
  return months[m - 1] + ' ' + parseInt(parts[2], 10) + ', ' + parts[0];
}

// don't allow picking a past day
if (dateInput) {
  var t = new Date();
  var todayStr = t.getFullYear() + '-' + String(t.getMonth() + 1).padStart(2, '0') + '-' + String(t.getDate()).padStart(2, '0');
  dateInput.min = todayStr;
}

var toastTimer;
function showToast(msg) {
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(function () { toast.classList.remove('show'); }, 2100);
}

function addTask(text) {
  var clean = text.trim();
  if (!clean) { formError.hidden = false; input.focus(); return; }
  formError.hidden = true;
  var due = dateInput && dateInput.value ? dateInput.value : null;
  tasks.unshift({ id: makeId(), text: clean, completed: false, createdAt: Date.now(), completedAt: null, dueDate: due });
  if (dateInput) dateInput.value = '';
  saveTasks();
  render();
  showToast(due ? 'Task added for ' + formatDue(due) + ' ✅' : 'Task added ✅');
}

function toggleComplete(id) {
  var t = tasks.find(function (x) { return x.id === id; });
  if (!t) return;
  t.completed = !t.completed;
  t.completedAt = t.completed ? Date.now() : null;
  saveTasks();
  render();
  showToast(t.completed ? 'Task completed 🎉' : 'Moved back to pending');
}

function deleteTask(id) {
  tasks = tasks.filter(function (x) { return x.id !== id; });
  if (editingId === id) editingId = null;
  saveTasks();
  render();
  showToast('Task deleted 🗑️');
}

function startEdit(id) {
  editingId = id;
  render();
  var el = document.querySelector('[data-edit-input="' + id + '"]');
  if (el) { el.focus(); el.setSelectionRange(el.value.length, el.value.length); }
}

function saveEdit(id, val, dueDate) {
  var clean = (val || '').trim();
  if (!clean) { showToast('Task cannot be empty'); return; }
  var t = tasks.find(function (x) { return x.id === id; });
  if (t) {
    t.text = clean;
    t.dueDate = dueDate || null;
  }
  editingId = null;
  saveTasks();
  render();
  showToast('Task updated ✏️');
}

function taskHTML(task) {
  if (editingId === task.id) {
    var curDue = task.dueDate || '';
    return '<li class="task" data-id="' + task.id + '">' +
      '<div class="task-body" style="width:100%">' +
      '<input class="edit-input" data-edit-input="' + task.id + '" value="' + escapeHtml(task.text) + '" maxlength="200">' +
      '<input type="date" class="edit-date" data-edit-date="' + task.id + '" value="' + curDue + '" title="Change day">' +
      '<div class="edit-row"><button class="save-btn" data-action="save">Save</button>' +
      '<button class="cancel-btn" data-action="cancel">Cancel</button></div></div></li>';
  }

  var liClass = task.completed ? 'task done' : 'task';
  var tick = task.completed ? '✓' : '';

  var time = '<div class="task-time">📅 Added: ' + formatDate(task.createdAt);
  if (task.dueDate) {
    time += ' <span class="sep">|</span> <span class="due">📆 For: ' + formatDue(task.dueDate) + '</span>';
  }
  if (task.completed && task.completedAt) {
    time += ' <span class="sep">|</span> Completed: ' + formatDate(task.completedAt);
  }
  time += '</div>';

  var editBtn = task.completed ? '' :
    '<button class="icon-btn edit-btn" data-action="edit" title="Edit">✎</button>';

  return '<li class="' + liClass + '" data-id="' + task.id + '">' +
    '<button class="tick" data-action="toggle" title="Mark complete">' + tick + '</button>' +
    '<div class="task-body"><div class="task-text">' + escapeHtml(task.text) + '</div>' + time + '</div>' +
    '<div class="task-actions">' +
    editBtn +
    '<button class="icon-btn del-btn" data-action="delete" title="Delete">🗑</button>' +
    '</div></li>';
}

function render() {
  var pending = tasks.filter(function (t) { return !t.completed; });
  var completed = tasks.filter(function (t) { return t.completed; });

  pendingList.innerHTML = pending.map(taskHTML).join('');
  completedList.innerHTML = completed.map(taskHTML).join('');

  pendingEmpty.style.display = pending.length ? 'none' : 'flex';
  completedEmpty.style.display = completed.length ? 'none' : 'flex';

  pendingCount.textContent = pending.length + ' pending';
  completedCount.textContent = completed.length + ' completed';

  statTotal.textContent = tasks.length;
  statPending.textContent = pending.length;
  statCompleted.textContent = completed.length;

  var pct = tasks.length ? Math.round((completed.length / tasks.length) * 100) : 0;
  progressPct.textContent = pct + '%';
}

form.addEventListener('submit', function (e) {
  e.preventDefault();
  addTask(input.value);
  input.value = '';
  input.focus();
});

input.addEventListener('input', function () {
  if (input.value.trim()) formError.hidden = true;
});

document.addEventListener('click', function (e) {
  var btn = e.target.closest('[data-action]');
  if (!btn) return;
  var li = e.target.closest('.task');
  if (!li) return;
  var id = li.getAttribute('data-id');
  var action = btn.getAttribute('data-action');
  if (action === 'toggle') toggleComplete(id);
  else if (action === 'delete') deleteTask(id);
  else if (action === 'edit') startEdit(id);
  else if (action === 'cancel') { editingId = null; render(); }
  else if (action === 'save') {
    var box = li.querySelector('.edit-input');
    var dateBox = li.querySelector('.edit-date');
    saveEdit(id, box ? box.value : '', dateBox ? dateBox.value : '');
  }
});

document.addEventListener('keydown', function (e) {
  if (!editingId) return;
  var box = document.querySelector('[data-edit-input="' + editingId + '"]');
  if (!box) return;
  if (e.key === 'Enter') {
    var dateBox = document.querySelector('[data-edit-date="' + editingId + '"]');
    saveEdit(editingId, box.value, dateBox ? dateBox.value : '');
  }
  if (e.key === 'Escape') { editingId = null; render(); }
});

clearCompletedBtn.addEventListener('click', function () {
  var n = tasks.filter(function (t) { return t.completed; }).length;
  if (!n) { showToast('Nothing to clear'); return; }
  tasks = tasks.filter(function (t) { return !t.completed; });
  saveTasks();
  render();
  showToast('Cleared ' + n + ' completed task' + (n > 1 ? 's' : ''));
});

render();
