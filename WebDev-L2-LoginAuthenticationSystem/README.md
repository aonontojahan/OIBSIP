# TaskFlow — WebDev Level 2 · Login Authentication System

A colourful, browser-based task manager with secure login, built as part of the OIBSIP Web Development internship.

## Description

Landing page, register, login, and a protected personal dashboard. Users create an account with validation, log in with username or email, and open their dashboard to add, complete, edit, delete, search and filter tasks with live stats and charts.

Passwords are never stored in plain text — each password is saved as a salted, iterated (500×) SHA-256 hash in `localStorage`, while the active session lives in `sessionStorage`. Unauthenticated visitors are bounced to `login.html`, and logged-in users skip straight to `dashboard.html`.

## Tech Used

- HTML5 — Page structure
- CSS3 — Styling, Grid / Flexbox layout
- JavaScript — Auth logic, vanilla JS, Web Crypto SHA-256 + localStorage


## Features

- [x] Landing page with navbar + hero + CTA (matches demo screenshot)
- [x] Register with username, email, password + confirm
- [x] Validation: username 3+ chars, valid email, password 8+ chars + 1 number, no empty submits
- [x] Duplicate username / email protection
- [x] Login with username OR email
- [x] Generic login error — never reveals which field is wrong
- [x] Salted + iterated (500x) SHA-256 password hashing, no plain-text storage
- [x] Session persistence with `sessionStorage`, users in `localStorage`
- [x] Show / hide password toggle + live password-strength meter
- [x] Protected dashboard: redirects to login without a session; logout clears session
- [x] Tasks: add (title + category + date + optional time), complete toggle, edit, delete
- [x] Search + filters (All / Today / Upcoming / Completed), per-user task storage
- [x] Dashboard stats: total, pending, completed, due today + progress ring, completion rate, weekly activity bars, completion trend, tasks by category
- [x] Responsive design for mobile


## Author

Name: Aononto Jahan Junnurain
Mail: aonontojahan@gmail.com
Phon: +8801723740704


Copyright © 2026 aonontojahan.vercel.app. All Rights Reserved.
