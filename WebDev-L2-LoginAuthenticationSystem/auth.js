/* TaskFlow auth — localStorage users + sessionStorage session + salted SHA-256.
   Hardened: works on file://, http(s), and sandboxed previews. Never throws. */
var USERS_KEY = 'taskflow_users';
var SESSION_KEY = 'taskflow_session';

/* --- crash-proof storage (falls back to memory if browser blocks it) --- */
var __memStore = {};
function __memGet(k) {
  return Object.prototype.hasOwnProperty.call(__memStore, k) ? __memStore[k] : null;
}
function lsGet(k) {
  try { return localStorage.getItem(k); } catch (e) { return __memGet('ls:' + k); }
}
function lsSet(k, v) {
  try { localStorage.setItem(k, v); } catch (e) { __memStore['ls:' + k] = v; }
}
function ssGet(k) {
  try { return sessionStorage.getItem(k); } catch (e) { return __memGet('ss:' + k); }
}
function ssSet(k, v) {
  try { sessionStorage.setItem(k, v); } catch (e) { __memStore['ss:' + k] = v; }
}
function ssDel(k) {
  try { sessionStorage.removeItem(k); } catch (e) {}
  delete __memStore['ss:' + k];
}

function getUsers() {
  try { return JSON.parse(lsGet(USERS_KEY)) || []; }
  catch (e) { return []; }
}
function saveUsers(users) {
  try { lsSet(USERS_KEY, JSON.stringify(users)); } catch (e) {}
}
function getSession() {
  try { return ssGet(SESSION_KEY); } catch (e) { return null; }
}
function go(url) {
  // replace() avoids back-button loops; falls back to href assignment.
  try { window.location.replace(url); } catch (e) { window.location.href = url; }
}

/* --- hashing: salted + iterated SHA-256, hex output.
       Uses WebCrypto when available (https/localhost), otherwise a built-in
       pure-JS SHA-256, otherwise a deterministic non-crypto fallback hash.
       Passwords are NEVER stored in plain text. --- */
function bytesToHex(buffer) {
  var bytes = new Uint8Array(buffer);
  var hex = '';
  for (var i = 0; i < bytes.length; i++) {
    hex += ('0' + bytes[i].toString(16)).slice(-2);
  }
  return hex;
}
function hasSubtle() {
  try { return !!(typeof crypto !== 'undefined' && crypto.subtle && crypto.subtle.digest); }
  catch (e) { return false; }
}
/* Pure-JS SHA-256 (ASCII input). Public-domain style implementation. */
function sha256Ascii(ascii) {
  function rr(v, a) { return (v >>> a) | (v << (32 - a)); }
  var maxWord = Math.pow(2, 32), i, j, result = '';
  var words = [], bitLen = ascii.length * 8;
  var hash = sha256Ascii.h = sha256Ascii.h || [];
  var k = sha256Ascii.k = sha256Ascii.k || [];
  var primeCounter = k.length, isComposite = {};
  for (var candidate = 2; primeCounter < 64; candidate++) {
    if (!isComposite[candidate]) {
      for (i = 0; i < 313; i += candidate) isComposite[i] = candidate;
      hash[primeCounter] = (Math.pow(candidate, 0.5) * maxWord) | 0;
      k[primeCounter++] = (Math.pow(candidate, 1 / 3) * maxWord) | 0;
    }
  }
  ascii += '\x80';
  while (ascii.length % 64 - 56) ascii += '\x00';
  for (i = 0; i < ascii.length; i++) {
    j = ascii.charCodeAt(i);
    if (j >> 8) return '';
    words[i >> 2] |= j << ((3 - i) % 4) * 8;
  }
  words[words.length] = (bitLen / maxWord) | 0;
  words[words.length] = bitLen;
  for (j = 0; j < words.length;) {
    var w = words.slice(j, j += 16), oldHash = hash;
    hash = hash.slice(0, 8);
    for (i = 0; i < 64; i++) {
      var w15 = w[i - 15], w2 = w[i - 2], a = hash[0], e = hash[4];
      var t1 = hash[7]
        + (rr(e, 6) ^ rr(e, 11) ^ rr(e, 25))
        + ((e & hash[5]) ^ ((~e) & hash[6]))
        + k[i]
        + (w[i] = (i < 16) ? w[i] : (w[i - 16]
          + (rr(w15, 7) ^ rr(w15, 18) ^ (w15 >>> 3))
          + w[i - 7]
          + (rr(w2, 17) ^ rr(w2, 19) ^ (w2 >>> 10))) | 0);
      var t2 = (rr(a, 2) ^ rr(a, 13) ^ rr(a, 22)) + ((a & hash[1]) ^ (a & hash[2]) ^ (hash[1] & hash[2]));
      hash = [(t1 + t2) | 0].concat(hash);
      hash[4] = (hash[4] + t1) | 0;
    }
    for (i = 0; i < 8; i++) hash[i] = (hash[i] + oldHash[i]) | 0;
  }
  for (i = 0; i < 8; i++) {
    for (j = 3; j + 1; j--) {
      var b = (hash[i] >> (j * 8)) & 255;
      result += ((b < 16) ? '0' : '') + b.toString(16);
    }
  }
  return result;
}
function sha256SyncUtf8(str) {
  // Encode to UTF-8 bytes first so any unicode password works.
  return sha256Ascii(unescape(encodeURIComponent(str)));
}
/* Last-resort deterministic 64-char hex (still never plain text). */
function fallbackHashHex(str) {
  var out = '';
  for (var r = 0; r < 8; r++) {
    var h1 = 0xdeadbeef ^ r, h2 = 0x41c6ce57 ^ r;
    var s = 'taskflow$' + str + '#' + r;
    for (var i = 0; i < s.length; i++) {
      var ch = s.charCodeAt(i);
      h1 = Math.imul(h1 ^ ch, 2654435761);
      h2 = Math.imul(h2 ^ ch, 1597334677);
    }
    h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
    h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
    out += ('00000000' + (h1 >>> 0).toString(16)).slice(-8) + ('00000000' + (h2 >>> 0).toString(16)).slice(-8);
  }
  return out.slice(0, 64);
}
function syncHash(text) {
  try {
    var h = sha256SyncUtf8(text);
    if (h && h.length === 64) return h;
  } catch (e) {}
  return fallbackHashHex(text);
}
function sha256Hex(text) {
  if (hasSubtle()) {
    try {
      var data = new TextEncoder().encode(text);
      return crypto.subtle.digest('SHA-256', data).then(
        bytesToHex,
        function () { return syncHash(text); } // subtle rejected -> sync path
      );
    } catch (e) { /* fall through to sync */ }
  }
  return Promise.resolve(syncHash(text));
}
function makeSalt() {
  try {
    var arr = new Uint8Array(16);
    crypto.getRandomValues(arr);
    var s = '';
    for (var i = 0; i < arr.length; i++) s += ('0' + arr[i].toString(16)).slice(-2);
    return s;
  } catch (e) {
    return 'rnd' + Date.now().toString(16) + Math.floor(Math.random() * 1e16).toString(16);
  }
}
function hashPassword(password, salt) {
  var value = salt + '::' + password;
  var p = Promise.resolve(value);
  for (var i = 0; i < 500; i++) {
    p = p.then(sha256Hex);
  }
  return p;
}

/* --- shared UI helpers --- */
function showError(el, msg) {
  if (!el) return;
  el.textContent = msg;
  el.hidden = !msg;
}
function fieldErr(id, msg) {
  var el = document.getElementById(id);
  if (!el) return;
  el.textContent = msg || '';
  el.hidden = !msg;
}
function bindToggles() {
  var btns = document.querySelectorAll('.toggle-pass');
  for (var i = 0; i < btns.length; i++) {
    (function (btn) {
      btn.addEventListener('click', function () {
        var input = document.getElementById(btn.getAttribute('data-for'));
        if (!input) return;
        var show = input.type === 'password';
        input.type = show ? 'text' : 'password';
        btn.textContent = show ? 'Hide' : 'Show';
      });
    })(btns[i]);
  }
}
function redirectIfLoggedIn() {
  try { if (getSession()) go('dashboard.html'); } catch (e) {}
}

/* --- validation --- */
function validEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
}
function passwordScore(pw) {
  var score = 0;
  if (pw.length >= 8) score++;
  if (/\d/.test(pw)) score++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  if (pw.length >= 12) score++;
  return Math.min(score, 4);
}

/* --- register: creates account then goes DIRECTLY to dashboard --- */
function initRegister() {
  redirectIfLoggedIn();
  bindToggles();
  var form = document.getElementById('register-form');
  if (!form) return;
  var pwInput = document.getElementById('reg-password');
  var bar = document.getElementById('strength-bar');
  var txt = document.getElementById('strength-text');

  pwInput.addEventListener('input', function () {
    var v = pwInput.value;
    var s = passwordScore(v);
    var widths = ['0%', '25%', '50%', '75%', '100%'];
    var colors = ['#e5e9f2', '#ef4444', '#f59e0b', '#3b82f6', '#22c55e'];
    var labels = ['Too weak', 'Weak', 'Okay — add 8+ chars & a number', 'Good', 'Strong 💪'];
    bar.style.width = widths[s];
    bar.style.background = colors[s];
    txt.textContent = v ? labels[s] : 'Use 8+ characters with at least 1 number.';
  });

  var busy = false;
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (busy) return; // no double submits
    var username = document.getElementById('reg-username').value.trim();
    var email = document.getElementById('reg-email').value.trim().toLowerCase();
    var password = document.getElementById('reg-password').value;
    var confirm = document.getElementById('reg-confirm').value;
    var ok = true;

    fieldErr('err-username', ''); fieldErr('err-email', '');
    fieldErr('err-password', ''); fieldErr('err-confirm', '');
    showError(document.getElementById('reg-error'), '');

    if (!username) { fieldErr('err-username', 'Username is required.'); ok = false; }
    else if (username.length < 3) { fieldErr('err-username', 'Username must be at least 3 characters.'); ok = false; }

    if (!email) { fieldErr('err-email', 'Email is required.'); ok = false; }
    else if (!validEmail(email)) { fieldErr('err-email', 'Enter a valid email address.'); ok = false; }

    if (!password) { fieldErr('err-password', 'Password is required.'); ok = false; }
    else if (password.length < 8) { fieldErr('err-password', 'Password must be at least 8 characters.'); ok = false; }
    else if (!/\d/.test(password)) { fieldErr('err-password', 'Password must contain at least 1 number.'); ok = false; }

    if (!confirm) { fieldErr('err-confirm', 'Please confirm your password.'); ok = false; }
    else if (password && confirm !== password) { fieldErr('err-confirm', 'Passwords do not match.'); ok = false; }

    if (!ok) return;

    var users = getUsers();
    var dupUser = users.some(function (u) { return u.username.toLowerCase() === username.toLowerCase(); });
    var dupEmail = users.some(function (u) { return u.email.toLowerCase() === email; });
    if (dupUser || dupEmail) {
      showError(document.getElementById('reg-error'),
        dupUser ? 'That username is already taken. Try another one.'
                : 'An account with this email already exists. Try logging in.');
      return;
    }

    busy = true;
    var btn = document.getElementById('register-btn');
    btn.disabled = true; btn.textContent = 'Creating account…';
    var salt = makeSalt();
    hashPassword(password, salt).then(function (hash) {
      users.push({ username: username, email: email, salt: salt, hash: hash, createdAt: new Date().toISOString() });
      saveUsers(users);
      ssSet(SESSION_KEY, username);
      // DIRECTLY to dashboard — no waiting screen.
      go('dashboard.html');
    }).catch(function () {
      busy = false;
      showError(document.getElementById('reg-error'), 'Something went wrong. Please try again.');
      btn.disabled = false; btn.textContent = 'Register';
    });
  });
}

/* --- login --- */
function initLogin() {
  redirectIfLoggedIn();
  bindToggles();
  var form = document.getElementById('login-form');
  if (!form) return;

  var busy = false;
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (busy) return;
    var id = document.getElementById('login-id').value.trim();
    var password = document.getElementById('login-password').value;
    fieldErr('err-login-id', ''); fieldErr('err-login-password', '');
    var box = document.getElementById('login-error');
    showError(box, '');
    var ok = true;
    if (!id) { fieldErr('err-login-id', 'Username or email is required.'); ok = false; }
    if (!password) { fieldErr('err-login-password', 'Password is required.'); ok = false; }
    if (!ok) return;

    var users = getUsers();
    var user = null;
    for (var i = 0; i < users.length; i++) {
      if (users[i].username.toLowerCase() === id.toLowerCase() || users[i].email.toLowerCase() === id.toLowerCase()) {
        user = users[i];
        break;
      }
    }
    // Generic message — never reveal whether the id or the password was wrong.
    var GENERIC = 'Invalid username/email or password. Please try again.';
    if (!user) { showError(box, GENERIC); return; }

    busy = true;
    hashPassword(password, user.salt).then(function (hash) {
      if (hash !== user.hash) { busy = false; showError(box, GENERIC); return; }
      ssSet(SESSION_KEY, user.username);
      go('dashboard.html');
    }).catch(function () {
      busy = false;
      showError(box, 'Something went wrong. Please try again.');
    });
  });
}

function logout() {
  ssDel(SESSION_KEY);
  go('login.html');
}
