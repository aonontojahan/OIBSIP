# AuthGuard — WebDev Level 2 · Task 4

A clean, secure browser-based login authentication system built as part of the OIBSIP Web Development internship.

## Description

This project is a fully functional authentication flow with landing page, register, login, and protected dashboard. Users can create an account with validation, log in with username or email, and unlock a personal dashboard with stats and analytics.

Passwords are never stored in plain text — each password is saved as a salted, iterated SHA-256 hash in `localStorage`, while the active session lives in `sessionStorage`. Unauthenticated visitors are bounced to `login.html`, and logged-in users skip straight to `dashboard.html`.

## Tech Used

- HTML5 — Page structure
- CSS3 — Styling, Grid / Flexbox layout
- JavaScript — Auth logic, vanilla JS, SHA-256 + localStorage


## Features

- [x] Landing page with navbar + hero + CTA
- [x] Register with username, email, password + confirm
- [x] Validation: username 3+ chars, valid email, password 8+ chars + 1 number
- [x] Duplicate username / email protection
- [x] Login with username OR email
- [x] Generic login error — never reveals which field is wrong
- [x] Salted + iterated (500x) SHA-256 password hashing, no plain-text storage
- [x] Session persistence with `sessionStorage`, users in `localStorage`
- [x] Show / hide password toggle
- [x] Live password-strength meter on register
- [x] Dashboard stats: member since, total logins, last login, registered users
- [x] Dashboard charts: weekly line graph, bar chart, device donut chart
- [x] Account details + recent activity feed
- [x] Logout from topbar + sidebar
- [x] Single-viewport layout on home / login / register — no page scroll
- [x] Responsive design for mobile


## Author

Name: Aononto Jahan Junnurain
Mail: aonontojahan@gmail.com
Phon: +8801723740704


Copyright © 2026 aonontojahan.vercel.app. All Rights Reserved.
