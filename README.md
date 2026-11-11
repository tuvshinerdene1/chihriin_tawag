# 💖 Duo / OurNook

A modern, full-stack, couple-centric web application designed for partners to store date ideas, plan upcoming dates, track memories with media uploads, and play interactive couple games together.

---

## ✨ Core Features

### 📅 Date Planner & Memory Scrapbook
- **Bucket List & Idea Bank:** Save date ideas categorized by tags (*Budget*, *Low-Energy*, *Outdoors*, *Late Night*).
- **Date Scheduling:** Move ideas into a calendar with date, time, and location details.
- **Digital Scrapbook:** Attach photos, notes, and memories to completed dates to build a visual timeline.

### 🎮 Interactive Couple Features
- **Date Roulette:** Filter date ideas by budget, weather, or duration and let the app randomly decide your next plan.
- **Surprise Date Mode:** Lock in a date where details remain blurred for your partner until a specified countdown timer reaches zero.
- **Dual-Approval Swipe:** Swipe through proposed date ideas or places to eat; when both partners swipe right, it's instantly scheduled.
- **Daily Prompts:** A shared morning Q&A prompt. Answers are revealed only after both partners submit their responses.

---

## 🛠️ Architecture & Tech Stack

- **Frontend:** Next.js / React, Tailwind CSS, Framer Motion
- **Backend:** Node.js (Express / Next.js API Routes)
- **Database:** PostgreSQL / Supabase DB (PostgreSQL relational models)
- **Object Storage:** Cloudflare R2 / AWS S3 / Supabase Storage *(Images and media files are stored in object storage, while metadata and URLs are mapped in the database)*
- **Auth:** Hardcoded single-pair authorization / Magic Links
