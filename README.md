# OIBSIP — Oasis Infobyte Web Development Internship (Level 2)

A collection of 4 front-end web projects built as part of the **OIBSIP Web Development Internship (Level 2)** by **Aononto Jahan Junnurain**.

All projects are built with **HTML5 + CSS3 + Vanilla JavaScript** — no frameworks, no build step. Just clone and open in a browser.

## 📑 Projects Overview

| # | Task | Project | Folder | Description |
|---|------|---------|--------|-------------|
| 1 | Level 2 · Task 1 | **Calculator** | [`WebDev-L2-Calculator`](./WebDev-L2-Calculator/) | Clean browser calculator with dual-line display, precedence-correct evaluation, copy-on-click result, and full keyboard support |
| 2 | Level 2 · Task 2 | **CR7 Tribute Page** | [`WebDev-L2-TributePage`](./WebDev-L2-TributePage/) | Premium black / cream / gold one-page tribute to Cristiano Ronaldo — hero, biography, 7-stop career journey, record legacy, quotes & gallery |
| 3 | Level 2 · Task 3 | **MyTodo — To-Do Web App** | [`WebDev-L2-ToDoWebApp`](./WebDev-L2-ToDoWebApp/) | Colorful daily task manager with Pending / Completed panels, due dates, timestamps, inline editing, and localStorage persistence |
| 4 | Level 2 · Task 4 | **TaskFlow — Login Authentication System** | [`WebDev-L2-LoginAuthenticationSystem`](./WebDev-L2-LoginAuthenticationSystem/) | Landing + register + login + protected dashboard task manager with salted SHA-256 auth, session guarding, search/filter, stats & charts |

## 🛠️ Common Tech Stack

- **HTML5** — semantic page structure
- **CSS3** — Grid / Flexbox, gradients, responsive layout, custom theming
- **JavaScript (Vanilla)** — app logic, no `eval()`, no libraries
- **Web Storage** — `localStorage` for persistence, `sessionStorage` for auth sessions
- **Web Crypto API** — SHA-256 password hashing (Login System only)

---

## 1️⃣ Calculator — WebDev Level 2 · Task 1

> [`WebDev-L2-Calculator/`](./WebDev-L2-Calculator/) — [Full docs](./WebDev-L2-Calculator/README.md)

A clean, professional browser-based calculator with a button interface.

**How it works:** the input expression appears on the top display line, while the result line stays at `0` during typing and shows the answer only after pressing `=`. Clicking the result copies it (`Copied!` confirmation). Operator chaining is supported without a full reset (e.g. `5+3×2 = 11` with correct precedence).

**Features:**
- Display screen showing current input + separate result line
- Numeric buttons `0–9` + decimal `.`
- Operators: `+`, `−`, `×`, `÷`, `%`
- `=` evaluates, `C` clears, `⌫` backspace / delete
- Division-by-zero protection
- Operator chaining with correct precedence (no `eval()`)
- Click result to copy
- Full keyboard support
- Single-viewport layout — no page scroll
- Responsive design for mobile

**Structure:**
```
WebDev-L2-Calculator/
├── index.html
├── style.css
├── script.js
└── Project Screenshots/
```

**Screenshots:**

![Calculator Interface](./WebDev-L2-Calculator/Project%20Screenshots/Interface.png)
![Calculator Test Calculation](./WebDev-L2-Calculator/Project%20Screenshots/Test%20Calculation.png)

---

## 2️⃣ CR7 Tribute Page — WebDev Level 2 · Task 2

> [`WebDev-L2-TributePage/`](./WebDev-L2-TributePage/) — [Full docs](./WebDev-L2-TributePage/README.md)

A premium one-page tribute to **Cristiano Ronaldo** — cinematic hero, biography, 7-stop photo career journey, 6-stat rolling record legacy, quote band and legacy finale — in a black / cream / gold editorial style.

**How it works:** from Madeira's streets to global icon — title + tagline hero, 4 original biography paragraphs, 7 photo career cards with club crests, 6-stat record legacy, two distinct quote bands and an iconic-moments gallery. Overlay navigation with active-link highlighting and scroll-reveal animations.

**Features:**
- Page title with subject name + one-line tagline
- Prominent hero image
- Biography: 4 paragraphs of original content
- Career journey as 7 photo cards with club crests
- Record legacy as 6 photo cards on matching dark theme
- Distinct quote band
- 3+ background colours, 3 font styles
- Responsive layout + overlay nav

**Image credits:** all images via Wikimedia Commons (CC BY / CC BY-SA / CC BY 4.0), stored locally in `assets/`. Club badges and trophy icons are CSS/text recreations — no external image URLs anywhere in the page.

**Structure:**
```
WebDev-L2-TributePage/
├── index.html
├── style.css
├── script.js
├── assets/
└── Project Screenshot/
```

**Screenshots:**

![Tribute Home](./WebDev-L2-TributePage/Project%20Screenshot/Tribute%20Home%20Page.png)
![Tribute Biography](./WebDev-L2-TributePage/Project%20Screenshot/Tribute%20Biography%20Page.png)
![Tribute Career Journey](./WebDev-L2-TributePage/Project%20Screenshot/Tribute%20Career%20Jouney%20Page.png)
![Tribute Achievements](./WebDev-L2-TributePage/Project%20Screenshot/Tribute%20Achivements%20Page.png)
![Tribute Quotes & Legacy](./WebDev-L2-TributePage/Project%20Screenshot/Tribute%20Quotes%20&%20Legacy%20Page.png)

---

## 3️⃣ MyTodo — To-Do Web App — WebDev Level 2 · Task 3

> [`WebDev-L2-ToDoWebApp/`](./WebDev-L2-ToDoWebApp/) — [Full docs](./WebDev-L2-ToDoWebApp/README.md)

A colorful browser-based to-do list app for managing daily tasks across Pending and Completed lists.

**How it works:** an "Organize Today, Build a Better Tomorrow" hero, an add-task bar with optional due-date picker, and two equal-height panels for pending and completed tasks. Clicking a checkbox moves a task between lists, and every task carries added/completed timestamps. All data persists in `localStorage`.

**Features:**
- Input field + "Add Task" button to create new tasks
- New tasks appear immediately in Pending Tasks
- Checkbox toggle — completed tasks move to Completed list
- Edit button for inline text + due-date editing (pending tasks)
- Delete button on every task + Clear button for completed list
- Count badges: "X pending" and "Y completed"
- Due-date picker for scheduling
- Timestamps on each task (added / completed date-time)
- Persists across refreshes via `localStorage`
- Empty-state messages + equal-height cards + mobile responsive

**Structure:**
```
WebDev-L2-ToDoWebApp/
├── index.html
├── style.css
├── script.js
└── Project Screenshot/
```

**Screenshots:**

![MyTodo App](./WebDev-L2-ToDoWebApp/Project%20Screenshot/Interactive%20to-do%20list%20application.png)

---

## 4️⃣ TaskFlow — Login Authentication System — WebDev Level 2 · Task 4

> [`WebDev-L2-LoginAuthenticationSystem/`](./WebDev-L2-LoginAuthenticationSystem/) — [Full docs](./WebDev-L2-LoginAuthenticationSystem/README.md)

A colourful, browser-based task manager with secure login.

**How it works:** landing page → register → login → protected personal dashboard. Users create an account with validation, log in with username or email, and open their dashboard to add, complete, edit, delete, search and filter tasks with live stats and charts. Passwords are never stored in plain text — each is saved as a salted, iterated (500×) SHA-256 hash in `localStorage`, while the active session lives in `sessionStorage`. Unauthenticated visitors are bounced to `login.html`; logged-in users skip straight to `dashboard.html`.

**Features:**
- Landing page with navbar + hero + CTA
- Register with username, email, password + confirm
- Validation: username 3+ chars, valid email, password 8+ chars + 1 number, no empty submits
- Duplicate username / email protection
- Login with username OR email
- Generic login error — never reveals which field is wrong
- Salted + iterated (500×) SHA-256 password hashing, no plain-text storage
- Session persistence with `sessionStorage`, users in `localStorage`
- Show / hide password toggle + live password-strength meter
- Protected dashboard: redirects to login without a session; logout clears session
- Tasks: add (title + category + date + optional time), complete toggle, edit, delete
- Search + filters (All / Today / Upcoming / Completed), per-user task storage
- Dashboard stats: total, pending, completed, due today + progress ring, completion rate, weekly activity bars, completion trend, tasks by category
- Responsive design for mobile

**Structure:**
```
WebDev-L2-LoginAuthenticationSystem/
├── index.html        # landing page
├── register.html
├── login.html
├── dashboard.html
├── auth.js
├── dashboard.js
├── style.css
└── Project Screenshot/
```

**Screenshots:**

![Landing Page](./WebDev-L2-LoginAuthenticationSystem/Project%20Screenshot/Login%20&%20Authentication%20Landing%20Page.png)
![Sign Up Page](./WebDev-L2-LoginAuthenticationSystem/Project%20Screenshot/Login%20&%20Authentication%20Sign%20Up%20Page.png)
![Login Page](./WebDev-L2-LoginAuthenticationSystem/Project%20Screenshot/Login%20&%20Authentication%20Login%20Page.png)
![Dashboard](./WebDev-L2-LoginAuthenticationSystem/Project%20Screenshot/Login%20&%20Authentication%20Page%20Dashboard.png)

---

## 🚀 How to Run

No install, no build — each project is static:

1. Clone the repo:
   ```bash
   git clone https://github.com/aonontojahan/OIBSIP.git
   cd OIBSIP
   ```
2. Open any project in a browser:
   - Calculator: open `WebDev-L2-Calculator/index.html`
   - Tribute Page: open `WebDev-L2-TributePage/index.html`
   - To-Do App: open `WebDev-L2-ToDoWebApp/index.html`
   - Login System: open `WebDev-L2-LoginAuthenticationSystem/index.html` (start here, then Register → Login → Dashboard)

   Or serve the whole repo locally:
   ```bash
   npx serve .
   ```

## 📁 Repository Structure

```
OIBSIP/
├── README.md  ← you are here
├── WebDev-L2-Calculator/
├── WebDev-L2-TributePage/
├── WebDev-L2-ToDoWebApp/
└── WebDev-L2-LoginAuthenticationSystem/
```

Each project folder has its own `README.md` with full documentation.

## 👤 Author

**Name:** Aononto Jahan Junnurain
**Mail:** aonontojahan@gmail.com
**Phone:** +8801723740704

Copyright © 2026 aonontojahan.vercel.app. All Rights Reserved.
