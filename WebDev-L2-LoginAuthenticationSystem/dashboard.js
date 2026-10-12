/* TaskFlow dashboard — protected page, per-user tasks, live stats + charts */
(function () {
  var session = null;
  try { session = sessionStorage.getItem('taskflow_session'); } catch (e) { session = null; }
  if (!session) { window.location.href = 'login.html'; return; }

  var TASKS_KEY = 'taskflow_tasks_' + session.toLowerCase();
  var activeFilter = 'all';
  var searchTerm = '';
  var PAGE_SIZE = 6; // fixed rows per page -> card height never changes -> no scroll ever
  var currentPage = 1;

  /* ---------- elements ---------- */
  var $ = function (id) { return document.getElementById(id); };
  var listEl = $('task-list'), weekBars = $('week-bars');

  $('username-label').textContent = session;
  $('avatar').textContent = (session[0] || 'U').toUpperCase();
  $('dropdown-user').textContent = session;
  $('welcome-title').textContent = 'Welcome Back, ' + session + '! 👋';
  $('today-pill').textContent = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  var dateInput = $('new-date');
  dateInput.value = toISODate(new Date());

  $('logout-btn').addEventListener('click', logout);
  var chip = $('user-chip'), drop = $('user-dropdown');
  chip.addEventListener('click', function (e) {
    e.stopPropagation();
    var open = drop.hidden;
    drop.hidden = !open;
    chip.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
  document.addEventListener('click', function (e) {
    if (!drop.hidden && !drop.contains(e.target) && e.target !== chip && !chip.contains(e.target)) {
      drop.hidden = true;
      chip.setAttribute('aria-expanded', 'false');
    }
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !drop.hidden) {
      drop.hidden = true;
      chip.setAttribute('aria-expanded', 'false');
    }
  });
  $('view-all').addEventListener('click', function () { setFilter('all'); });
  $('filters').addEventListener('click', function (e) {
    if (e.target.classList.contains('ftab')) setFilter(e.target.getAttribute('data-filter'));
  });
  $('search').addEventListener('input', function (e) {
    searchTerm = e.target.value.trim().toLowerCase();
    currentPage = 1;
    render();
  });
  $('page-prev').addEventListener('click', function () { if (currentPage > 1) { currentPage--; render(); } });
  $('page-next').addEventListener('click', function () { currentPage++; render(); });
  $('add-form').addEventListener('submit', onAdd);

  /* ---------- storage (never throws — memory fallback if blocked) ---------- */
  var __memTasks = null;
  function lsGet(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function lsSet(k, v) {
    try { localStorage.setItem(k, v); }
    catch (e) { if (k === TASKS_KEY) __memTasks = v; }
  }
  function loadTasks() {
    if (__memTasks !== null) {
      try { return JSON.parse(__memTasks) || []; } catch (e) { return []; }
    }
    var raw = lsGet(TASKS_KEY);
    if (raw === null) {
      var seeded = seedTasks();
      lsSet(TASKS_KEY, JSON.stringify(seeded));
      if (__memTasks === null) { try { return seeded; } catch (e) { return []; } }
      return seeded;
    }
    try { return JSON.parse(raw) || []; } catch (e) { return []; }
  }
  function save(tasks) {
    try { lsSet(TASKS_KEY, JSON.stringify(tasks)); }
    catch (e) { try { __memTasks = JSON.stringify(tasks); } catch (e2) {} }
  }

  function toISODate(d) {
    var m = ('0' + (d.getMonth() + 1)).slice(-2);
    var day = ('0' + d.getDate()).slice(-2);
    return d.getFullYear() + '-' + m + '-' + day;
  }
  function seedTasks() {
    var now = new Date();
    var today = toISODate(now);
    var tomorrow = toISODate(new Date(now.getTime() + 86400000));
    var plus3 = toISODate(new Date(now.getTime() + 3 * 86400000));
    var t = function (title, category, date, time, done) {
      return { id: 't' + Math.random().toString(36).slice(2, 9), title: title, category: category, date: date, time: time || '', done: !!done, createdAt: new Date().toISOString(), completedAt: done ? new Date().toISOString() : null };
    };
    return [
      t('Complete web development assignment', 'Study', today, '10:30', false),
      t('Read 20 pages of a book', 'Personal', today, '11:15', true),
      t('Go for a 30-minute walk', 'Health', today, '13:45', false),
      t("Prepare for tomorrow's meeting", 'Work', today, '15:00', false),
      t('Review login security settings', 'Study', tomorrow, '16:20', true),
      t('Update profile information', 'Personal', plus3, '18:00', true)
    ];
  }

  /* ---------- add / edit / delete / toggle ---------- */
  function onAdd(e) {
    e.preventDefault();
    var title = $('new-title').value.trim();
    var category = $('new-category').value;
    var date = $('new-date').value || toISODate(new Date());
    var time = $('new-time').value || '';
    var err = $('add-error');
    if (!title) {
      err.textContent = 'Please type a task first.';
      err.hidden = false;
      return;
    }
    err.hidden = true;
    var tasks = loadTasks();
    tasks.unshift({ id: 't' + Date.now().toString(36), title: title, category: category, date: date, time: time, done: false, createdAt: new Date().toISOString(), completedAt: null });
    save(tasks);
    $('new-title').value = '';
    $('new-time').value = '';
    currentPage = 1; // new task appears on first page
    toast('Task added ✅');
    render();
  }

  function setFilter(f) {
    activeFilter = f;
    currentPage = 1;
    document.querySelectorAll('.ftab').forEach(function (b) {
      b.classList.toggle('active', b.getAttribute('data-filter') === f);
    });
    render();
  }

  function sameDay(a, b) {
    return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
  }
  function parseDate(t) {
    if (t.date) {
      var parts = t.date.split('-');
      return new Date(+parts[0], +parts[1] - 1, +parts[2]);
    }
    return new Date(t.createdAt);
  }

  function filtered(tasks) {
    var now = new Date();
    now.setHours(0, 0, 0, 0);
    return tasks.filter(function (t) {
      if (searchTerm && t.title.toLowerCase().indexOf(searchTerm) === -1) return false;
      var d = parseDate(t);
      if (activeFilter === 'completed' && !t.done) return false;
      if (activeFilter === 'today' && !sameDay(d, new Date())) return false;
      if (activeFilter === 'upcoming' && (t.done || d <= now || sameDay(d, new Date()))) return false;
      if (activeFilter !== 'all' && activeFilter !== 'completed' && activeFilter !== 'today' && activeFilter !== 'upcoming') return true;
      if (activeFilter === 'all') return true;
      return true;
    });
  }

  function fmtTime(hhmm) {
    if (!hhmm) return '';
    var p = hhmm.split(':');
    var h = +p[0], m = p[1];
    var ap = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
    return h + ':' + m + ' ' + ap;
  }
  function fmtDateLabel(t) {
    var d = parseDate(t);
    var now = new Date();
    var tomorrow = new Date(now.getTime() + 86400000);
    var day = sameDay(d, now) ? 'Today' : sameDay(d, tomorrow) ? 'Tomorrow'
      : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    var time = t.time ? ' · ' + fmtTime(t.time) : '';
    return day + time;
  }

  /* ---------- render ---------- */
  function render() {
    var tasks = loadTasks();
    var total = tasks.length;
    var done = tasks.filter(function (t) { return t.done; }).length;
    var pending = total - done;
    var dueToday = tasks.filter(function (t) { return !t.done && sameDay(parseDate(t), new Date()); }).length;
    var pct = total ? Math.round((done / total) * 100) : 0;

    $('stat-total').textContent = total;
    $('stat-pending').textContent = pending;
    $('stat-completed').textContent = done;
    $('stat-due').textContent = dueToday;

    // ring + rate
    var C = 326.7;
    $('ring').style.strokeDashoffset = (C - (C * pct) / 100).toFixed(1);
    $('ring-text').textContent = pct + '%';
    $('rate-pct').textContent = pct + '%';
    $('rate-bar').style.width = pct + '%';
    $('rate-done').textContent = done;
    $('rate-pending').textContent = pending;

    // list (paged — fixed height, never scrolls)
    var items = filtered(tasks);
    var totalPages = Math.max(1, Math.ceil(items.length / PAGE_SIZE));
    if (currentPage > totalPages) currentPage = totalPages;
    if (currentPage < 1) currentPage = 1;
    var pageItems = items.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
    $('page-info').textContent = currentPage + '/' + totalPages;
    $('page-prev').disabled = currentPage <= 1;
    $('page-next').disabled = currentPage >= totalPages;
    if (!items.length) {
      listEl.innerHTML = '<div class="empty-tasks">No tasks here yet — add one above ☝️</div>';
    } else {
      listEl.innerHTML = '';
      pageItems.forEach(function (t) {
        var row = document.createElement('div');
        row.className = 'task-item' + (t.done ? ' done' : '');
        row.innerHTML =
          '<button class="check" title="Toggle complete">' + (t.done ? '✓' : '') + '</button>' +
          '<div class="task-info"><div class="task-title"></div><div class="task-meta">' + fmtDateLabel(t) + '</div></div>' +
          '<span class="cat-badge cat-' + t.category + '">' + t.category + '</span>' +
          '<div class="task-ops"><button class="mini-btn" title="Edit">✎</button><button class="mini-btn del" title="Delete">🗑</button></div>';
        row.querySelector('.task-title').textContent = t.title;
        row.querySelector('.task-title').title = t.title;
        row.querySelector('.check').addEventListener('click', function () {
          t.done = !t.done;
          t.completedAt = t.done ? new Date().toISOString() : null;
          persistById(tasks, t);
        });
        var ops = row.querySelectorAll('.mini-btn');
        ops[0].addEventListener('click', function () { editTask(tasks, t); });
        ops[1].addEventListener('click', function () {
          save(tasks.filter(function (x) { return x.id !== t.id; }));
          toast('Task deleted 🗑');
          render();
        });
        listEl.appendChild(row);
      });
    }

    renderWeek(tasks);
    renderTrend(tasks);
  }

  function persistById(tasks, updated) {
    save(tasks.map(function (x) { return x.id === updated.id ? updated : x; }));
    render();
  }

  function editTask(tasks, t) {
    var next = prompt('Edit task:', t.title);
    if (next === null) return;
    next = next.trim();
    if (!next) { toast('Task title cannot be empty ⚠️'); return; }
    t.title = next.slice(0, 150);
    persistById(tasks, t);
    toast('Task updated ✏️');
  }

  function renderWeek(tasks) {
    var now = new Date();
    var monday = new Date(now);
    var d = (now.getDay() + 6) % 7; // Monday-first
    monday.setDate(now.getDate() - d);
    monday.setHours(0, 0, 0, 0);
    var days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
    weekBars.innerHTML = '';
    var max = 1;
    var counts = [];
    for (var i = 0; i < 7; i++) {
      var day = new Date(monday.getTime() + i * 86400000);
      var c = tasks.filter(function (t) { return sameDay(parseDate(t), day); }).length;
      counts.push(c);
      if (c > max) max = c;
    }
    for (var j = 0; j < 7; j++) {
      var col = document.createElement('div');
      col.className = 'bar-col';
      var h = 10 + Math.round((counts[j] / max) * 40);
      col.innerHTML = '<span class="bar-val">' + counts[j] + '</span>' +
        '<div class="bar" style="height:' + h + 'px"></div>' +
        '<div class="bar-day">' + days[j] + '</div>';
      weekBars.appendChild(col);
    }
  }

  function renderTrend(tasks) {
    var svg = $('trend-svg');
    var days = [];
    for (var i = 6; i >= 0; i--) {
      var d = new Date();
      d.setHours(0, 0, 0, 0);
      d.setDate(d.getDate() - i);
      days.push(d);
    }
    var cum = 0, pts = [];
    days.forEach(function (day) {
      var n = tasks.filter(function (t) {
        return t.done && t.completedAt && sameDay(new Date(t.completedAt), day);
      }).length;
      // fall back: distribute completions so the line is never flat-empty when tasks exist
      cum += n;
      pts.push(cum);
    });
    if (cum === 0 && tasks.length) {
      var done = tasks.filter(function (t) { return t.done; }).length;
      pts = pts.map(function (_, idx) { return Math.round((done * (idx + 1)) / 7); });
      cum = done;
    }
    var max = Math.max.apply(null, pts.concat([1]));
    var coords = pts.map(function (v, idx) {
      var x = 12 + (idx * (276 / 6));
      var y = 112 - (v / max) * 88;
      return [x, y];
    });
    var line = coords.map(function (p, idx) { return (idx ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1); }).join(' ');
    var area = line + ' L' + coords[6][0].toFixed(1) + ' 125 L' + coords[0][0].toFixed(1) + ' 125 Z';
    var dots = coords.map(function (p) { return '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="3.4" fill="#7c3aed" stroke="#fff" stroke-width="1.5"/>'; }).join('');
    svg.innerHTML = '<defs><linearGradient id="tg" x1="0" y1="0" x2="0" y2="1">' +
      '<stop offset="0" stop-color="#7c3aed" stop-opacity=".45"/><stop offset="1" stop-color="#7c3aed" stop-opacity=".05"/></linearGradient></defs>' +
      '<path d="' + area + '" fill="url(#tg)"/>' +
      '<path d="' + line + '" fill="none" stroke="#7c3aed" stroke-width="2.5" stroke-linecap="round"/>' + dots;
  }

  function toast(msg) {
    var el = $('toast');
    el.textContent = msg;
    el.classList.add('show');
    clearTimeout(el._t);
    el._t = setTimeout(function () { el.classList.remove('show'); }, 2200);
  }

  render();
})();
