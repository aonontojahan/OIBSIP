# CR7 Tribute — WebDev Level 2 · Task 2

A premium one-page tribute to Cristiano Ronaldo — cinematic hero, biography, 7-stop photo career journey (infinite rolling row), 6-stat rolling record legacy, quote band and legacy finale — in a black / cream / gold editorial style.

## Description

From Madeira's streets to global icon: title + tagline hero, 4 original biography paragraphs, 7 photo career cards with club crests (2002 Sporting → Portugal national team), 6-stat record legacy, two distinct quote bands and iconic-moments gallery.

## Tech Used

- HTML5 — Semantic structure (index.html)
- CSS3 — Theme, Flexbox/Grid, masks, responsive + overlay nav (style.css)
- JavaScript — Overlay navigation, active link, reveal (script.js, vanilla)

Fonts: Playfair Display (display serif) + Exo (body) + Kaushan Script (legacy signature) via Google Fonts.

## Features

- [x] Page title with subject name + one-line tagline
- [x] Prominent image (Wikimedia Commons, stored locally in assets/)
- [x] Biography: 4 paragraphs of original content
- [x] Career journey as 7 photo cards with club crests (ordered list, infinite auto-scrolling row, pauses on hover)
- [x] Record legacy as 6 photo cards on matching dark theme (infinite auto-scrolling row, pauses on hover)
- [x] Distinct quote band (dark, gold mark)
- [x] 3+ background colours (teal nav, black, cream)
- [x] 3 font styles (serif display, sans body, script signature)
- [x] Responsive layout (1020px / 790px / 500px, overlay menu)

## Folder Structure

```text
WebDev-L2-TributePage/
├── index.html
├── style.css
├── script.js
├── README.md
└── assets/
    ├── cr7-portrait.jpg        # 2018 portrait (bio)
    ├── cr7-siu.jpg             # 2011 Madrid celebration (CC BY-SA 2.0)
    ├── Cristiano Ronaldo.png   # SIU jump hero image (user-provided)
    ├── cr7-united.jpg          # 2006 Man United (bio + career + gallery)
    ├── cr7-united07.jpg        # United vs Chelsea action (career)
    ├── cr7-united21.jpg        # United vs Everton 2021 (spare)
    ├── cr7-united21b.jpg       # United return debut vs Newcastle 2021 (career)
    ├── cr7-madrid10.jpg        # Madrid celebrating vs Valencia 2010 (career)
    ├── cr7-portugal25.jpg      # Portugal celebrating 2025 (career)
    ├── cr7-sporting.png        # Sporting hoops age 17 (user-provided)
    ├── cr7-nassr.jpg           # Al Nassr 2023 yellow kit (career)
    ├── cr7-juve.jpg            # Juventus 2019 (career)
    ├── crest-sporting.svg      # Sporting CP crest (Commons)
    ├── crest-united.svg        # Manchester United crest (Wikipedia fair-use)
    ├── crest-madrid.svg        # Real Madrid crest (Wikipedia fair-use)
    ├── crest-juve.svg          # Juventus 2017 logo (Commons)
    ├── crest-portugal.svg      # Portugal NT logo (Wikipedia fair-use)
    ├── trophy-ballon.jpg        # Ronaldo holding Ballon d'Or, night match
    ├── trophy-ucl.jpg            # UCL trophy, Istanbul 2005 ribbons, dark bg
    ├── trophy-euro.jpg          # Henri Delaunay Euro trophy
    ├── trophy-boot.jpg          # His Golden Boot (CR7 museum)
    ├── cr7-madrid.jpg          # 2018 UCL final (career bg + quote + gallery)
    ├── cr7-2018.jpg            # 2018 portrait (gallery)
    ├── cr7-confeds.jpg         # Portugal 2017 (hero + legacy + gallery)
    └── cr7-worldcup-2022.jpg   # Qatar 2022 (quote + gallery)
```

## Image Credits

All images via Wikimedia Commons (CC BY / CC BY-SA / CC BY 4.0), downloaded with `curl` via `Special:FilePath` and used only from the local `assets/` folder. Club badges and trophy icons are CSS/text recreations — no external image URLs anywhere in the page.

## How to Run

Double-click `index.html` in any modern browser (internet needed only for Google Fonts). No dependencies.

## Author

Built for OIBSIP — Oasis Infobyte Internship Program, Web Development Level 2.
