/* AuthGuard — shared auth core
   Users + salted SHA-256 password hashes in localStorage,
   session id in sessionStorage. */

var Auth = (function () {
  var USERS_KEY = 'authguard_users_v1';
  var SESSION_KEY = 'authguard_session_v1';
  var ITERATIONS = 500;

  /* ---- Compact SHA-256 (public domain style implementation) ---- */
  function sha256(ascii) {
    function rightRotate(value, amount) {
      return (value >>> amount) | (value << (32 - amount));
    }
    var mathPow = Math.pow;
    var maxWord = mathPow(2, 32);
    var result = '';
    var words = [];
    var asciiBitLength = ascii.length * 8;
    var hash = (sha256.h = sha256.h || []);
    var k = (sha256.k = sha256.k || []);
    var primeCounter = k.length;
    var isComposite = {};
    for (var candidate = 2; primeCounter < 64; candidate++) {
      if (!isComposite[candidate]) {
        for (var i = 0; i < 313; i += candidate) isComposite[i] = candidate;
        hash[primeCounter] = (mathPow(candidate, 0.5) * maxWord) | 0;
        k[primeCounter++] = (mathPow(candidate, 1 / 3) * maxWord) | 0;
      }
    }
    ascii += '\x80';
    while (ascii.length % 64 - 56) ascii += '\x00';
    for (var i = 0; i < ascii.length; i++) {
      var j = ascii.charCodeAt(i);
      if (j >> 8) return ''; // ASCII only
      words[i >> 2] |= j << (((3 - i) % 4) * 8);
    }
    words[words.length] = asciiBitLength / maxWord | 0;
    words[words.length] = asciiBitLength;
    for (var j = 0; j < words.length;) {
      var w = words.slice(j, (j += 16));
      var oldHash = hash;
      hash = hash.slice(0, 8);
      for (var i = 0; i < 64; i++) {
        var w15 = w[i - 15], w2 = w[i - 2];
        var a = hash[0], e = hash[4];
        var temp1 =
          hash[7] +
          (rightRotate(e, 6) ^ rightRotate(e, 11) ^ rightRotate(e, 25)) +
          ((e & hash[5]) ^ (~e & hash[6])) +
          k[i] +
          (w[i] = i < 16 ? w[i] : w[i - 16] +
            (rightRotate(w15, 7) ^ rightRotate(w15, 18) ^ (w15 >>> 3)) +
            w[i - 7] +
            (rightRotate(w2, 17) ^ rightRotate(w2, 19) ^ (w2 >>> 10)));
        var temp2 =
          (rightRotate(a, 2) ^ rightRotate(a, 13) ^ rightRotate(a, 22)) +
          ((a & hash[1]) ^ (a & hash[2]) ^ (hash[1] & hash[2]));
        hash = [temp1 + temp2 | 0].concat(hash);
        hash[4] = (hash[4] + temp1) | 0;
      }
      for (var i = 0; i < 8; i++) hash[i] = (hash[i] + oldHash[i]) | 0;
    }
    for (var i = 0; i < 8; i++) {
      for (var j = 3; j + 1; j--) {
        var b = (hash[i] >> (j * 8)) & 255;
        result += (b < 16 ? '0' : '') + b.toString(16);
      }
    }
    return result;
  }

  function makeSalt() {
    var chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    var s = '';
    for (var i = 0; i < 16; i++) s += chars[Math.floor(Math.random() * chars.length)];
    return s + Date.now().toString(36);
  }

  // Salted + iterated SHA-256 — never store plain-text passwords
  function hashPassword(password, salt) {
    var h = sha256(salt + '::' + password);
    for (var i = 1; i < ITERATIONS; i++) h = sha256(h + '::' + salt);
    return h;
  }

  /* ---- Storage ---- */
  function getUsers() {
    try {
      var raw = localStorage.getItem(USERS_KEY);
      var arr = raw ? JSON.parse(raw) : [];
      return Array.isArray(arr) ? arr : [];
    } catch (e) {
      return [];
    }
  }

  function saveUsers(users) {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  }

  function makeId() {
    return Date.now().toString(36) + Math.floor(Math.random() * 10000).toString(36);
  }

  /* ---- Validators ---- */
  function validEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
  }

  // min 8 chars + at least 1 number
  function passwordError(pw) {
    if (!pw) return 'Password is required.';
    if (pw.length < 8) return 'Password must be at least 8 characters.';
    if (!/\d/.test(pw)) return 'Password must contain at least 1 number.';
    return '';
  }

  /* ---- Core actions ---- */
  function findUser(login) {
    var key = String(login).trim().toLowerCase();
    return getUsers().find(function (u) {
      return u.username.toLowerCase() === key || u.email.toLowerCase() === key;
    }) || null;
  }

  // Returns { ok, message }
  function register(username, email, password) {
    username = String(username).trim();
    email = String(email).trim();
    if (!username || !email || !password) {
      return { ok: false, message: 'Please fill in all fields.' };
    }
    if (username.length < 3) {
      return { ok: false, message: 'Username must be at least 3 characters.' };
    }
    if (!validEmail(email)) {
      return { ok: false, message: 'Please enter a valid email address.' };
    }
    var pwErr = passwordError(password);
    if (pwErr) return { ok: false, message: pwErr };

    var users = getUsers();
    var nameTaken = users.some(function (u) { return u.username.toLowerCase() === username.toLowerCase(); });
    if (nameTaken) return { ok: false, message: 'That username is already taken. Try another one.' };
    var mailTaken = users.some(function (u) { return u.email.toLowerCase() === email.toLowerCase(); });
    if (mailTaken) return { ok: false, message: 'An account with this email already exists. Try logging in.' };

    var salt = makeSalt();
    users.push({
      id: makeId(),
      username: username,
      email: email,
      salt: salt,
      hash: hashPassword(password, salt),
      createdAt: Date.now(),
      logins: 0,
      lastLogin: null
    });
    saveUsers(users);
    return { ok: true, message: 'Account created! You can now log in.' };
  }

  // Returns { ok, message, user? } — generic error, never reveals which field is wrong
  function login(login, password) {
    login = String(login).trim();
    if (!login || !password) {
      return { ok: false, message: 'Please enter your username/email and password.' };
    }
    var user = findUser(login);
    if (!user || hashPassword(password, user.salt) !== user.hash) {
      return { ok: false, message: 'Invalid login credentials. Please try again.' };
    }
    user.logins = (user.logins || 0) + 1;
    user.lastLogin = Date.now();
    var users = getUsers();
    for (var i = 0; i < users.length; i++) {
      if (users[i].id === user.id) users[i] = user;
    }
    saveUsers(users);
    try {
      sessionStorage.setItem(SESSION_KEY, user.id);
    } catch (e) {}
    return { ok: true, message: 'Welcome back, ' + user.username + '!', user: user };
  }

  function currentUser() {
    var id = null;
    try {
      id = sessionStorage.getItem(SESSION_KEY);
    } catch (e) {}
    if (!id) return null;
    return getUsers().find(function (u) { return u.id === id; }) || null;
  }

  function logout() {
    try {
      sessionStorage.removeItem(SESSION_KEY);
    } catch (e) {}
    window.location.href = 'login.html';
  }

  // Call on protected pages — bounces visitors without a session to login
  function requireAuth() {
    if (!currentUser()) {
      window.location.href = 'login.html';
      return null;
    }
    return currentUser();
  }

  // Call on login/register — logged-in users skip straight to dashboard
  function redirectIfAuthed() {
    if (currentUser()) window.location.href = 'dashboard.html';
  }

  function userCount() {
    return getUsers().length;
  }

  return {
    register: register,
    login: login,
    logout: logout,
    currentUser: currentUser,
    requireAuth: requireAuth,
    redirectIfAuthed: redirectIfAuthed,
    userCount: userCount,
    passwordError: passwordError,
    validEmail: validEmail
  };
})();
