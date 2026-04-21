# 🗳️ Election Assistant

> A bright, friendly, and interactive civic education platform that helps first-time voters, students, and curious citizens understand the election process — step by step.

---

## ✨ Overview

**Election Assistant** is a non-partisan, educational web application built to demystify the democratic process. From understanding how elections are announced, to registering as a voter, to what to carry on polling day — this platform walks you through everything in plain, welcoming language.

The platform is designed to be:
- **Beginner-friendly** — suitable for first-time voters and students
- **Approachable** — warm, bright design that feels like a learning guide, not a government portal
- **Non-partisan** — strictly informational with no political opinion or bias
- **Interactive** — self-paced modules, quizzes, and checklists

---

## 🚀 Features

| Feature | Description |
|---|---|
| 🏠 **Welcome Home** | Friendly landing page with a clear starting point |
| 📖 **Guided Learning** | A 7-step, lesson-based walkthrough of the election process |
| 🗓️ **Election Timeline** | An expandable phase-by-phase view of how elections unfold |
| 🪜 **Step-by-Step Guide** | Visual card grid breaking down each voting action |
| 📋 **Voter Registration** | Clear explanation of why and how to register |
| 📄 **Required Documents** | A practical list of what to bring to the polls |
| ✅ **Election Day Checklist** | An interactive, printable personal readiness checklist |
| ❓ **FAQ** | A searchable accordion of common questions and answers |
| 📚 **Glossary** | Card-based definitions of key election terminology |
| 💬 **Ask the Assistant** | A Gemini-powered Q&A interface for quick civic questions |
| 🧠 **Self-Check Quiz** | A 5-question quiz with explanations to test your knowledge |
| 📈 **Progress Tracker** | Sidebar progress bar tracking how many sections you've visited |

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | React 19 + TypeScript |
| **Build Tool** | Vite 8 |
| **Styling** | Vanilla CSS (custom design system with CSS variables) |
| **Icons** | Lucide React |
| **State** | React Context API + `localStorage` persistence |
| **Fonts** | Nunito (headings) + Inter (body) via Google Fonts |
| **Google Services** | Gemini API, Cloud Run, Cloud Build, Cloud Logging |

---

## 📦 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18 or newer
- npm (comes with Node.js)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/smallBrat/Election-Assistant.git
cd Election-Assistant

# 2. Install dependencies
npm install

# 3. Start the development server
npm run dev
```

The app will be running at **http://localhost:5173/**

### Build for Production

```bash
npm run build
```

Output will be in the `dist/` folder, ready to deploy to static hosting or to the Cloud Run container included in this repository.

### Preview Production Build

```bash
npm run preview
```

---

## 🧪 Testing

The app uses Vitest and React Testing Library for unit, component, and integration-style coverage.

- `npm run test` runs the suite once in jsdom.
- `npm run test:coverage` generates coverage output and enforces the configured thresholds.
- Coverage and setup live in `vite.config.ts` and `src/test/`.

Key coverage areas include navigation, progress tracking, quiz flow, FAQ/glossary search, checklist toggles, and the Gemini assistant success/fallback paths.

See [TESTING.md](TESTING.md) for the full testing guide.

---

## ☁️ Google Services Integration

The assistant is backed by Gemini through a Cloud Run endpoint that reads `GEMINI_API_KEY` at runtime. The UI calls `/api/assistant`, and the server adds a neutral civic-education system prompt before forwarding the request to Gemini.

- Cloud Run serves the production container and captures logs automatically in Cloud Logging.
- Cloud Build can run tests, build the container, and deploy the app on push to `main`.
- Assistant failures fall back to a local educational answer so the app remains usable even if Gemini is temporarily unavailable.

See [DEPLOYMENT.md](DEPLOYMENT.md) for build, deploy, and logging steps.

See [SECURITY.md](SECURITY.md) for API key handling and prompt-safety notes.

---

## 📁 Project Structure

```
election-assistant/
├── public/                  # Static assets (favicon, etc.)
├── src/
│   ├── assets/              # Images and static media
│   ├── components/
│   │   ├── sections/        # One file per section/page
│   │   │   ├── Home.tsx
│   │   │   ├── GuidedLearning.tsx
│   │   │   ├── ElectionTimeline.tsx
│   │   │   ├── StepByStepGuide.tsx
│   │   │   ├── VoterRegistration.tsx
│   │   │   ├── RequiredDocuments.tsx
│   │   │   ├── ElectionDayChecklist.tsx
│   │   │   ├── FAQ.tsx
│   │   │   ├── Glossary.tsx
│   │   │   ├── ChatAssistant.tsx
│   │   │   └── Quiz.tsx
│   │   ├── Navigation.tsx   # Left sidebar navigation
│   │   └── Navigation.css
│   ├── context/
│   │   └── ProgressContext.tsx  # Global state for progress tracking
│   ├── data/
│   │   └── mockData.ts      # All educational content (FAQ, glossary, quiz, etc.)
│   ├── App.tsx              # Root layout and section routing
│   ├── App.css
│   ├── index.css            # Design system: CSS variables and global styles
│   └── main.tsx             # React entry point
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── .gitignore
└── README.md
```

---

## 🎨 Design Philosophy

The UI uses a **warm, creamy off-white palette** (`#FCFAF8` base) inspired by civic awareness pamphlets and accessible public information design. Key design choices:

- **No dark backgrounds** — keeps the experience light and inviting
- **Rounded cards with soft shadows** — educational module feel
- **Muted warm orange** for primary CTAs — friendly, not alarming
- **Dusty slate blue** for headings and navigation accents
- **Olive green** exclusively for success/progress states
- **Generous whitespace** — gives content room to breathe

---

## 🔮 Future Improvements

- [ ] Add real election data API integration (e.g., by country/state)
- [ ] Multilingual support (Hindi, Tamil, Bengali, etc.)
- [ ] Accessibility audit and WCAG 2.2 compliance pass
- [ ] Dark mode support
- [ ] Shareable quiz scores
- [ ] Printable voter registration guide PDF

---

## 📝 License

This project is for educational and civic awareness purposes. Feel free to fork and adapt for non-commercial use.

---

## 🙏 Acknowledgements

Built as part of a civic tech hackathon to make democratic participation more accessible and understandable for everyone.
