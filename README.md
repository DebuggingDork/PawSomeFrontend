# 🐾 PawSome Frontend

React + TypeScript frontend for **PawSome** — a Tinder-style matchmaking platform for pets. Create a profile, discover nearby pets, swipe, match, and chat in real time.

Pairs with the [PawSome backend](https://github.com/DebuggingDork/PawSome-Backend) (FastAPI).

## 🏗️ Tech Stack

| Layer | Choice |
|---|---|
| Framework | React 19 + TypeScript |
| Build tool | Vite |
| Styling | Tailwind CSS + Framer Motion / GSAP |
| State | Zustand |
| Data fetching | TanStack Query |
| Routing | React Router |

## 📦 Project Structure

```
src/
├── pages/         # Auth, Onboarding, Discover, Matches, Chat, Profile, Landing, ...
├── components/    # animations, chat, discover, notifications, profile, safety, ui
├── store/         # Zustand stores (auth, loader, ...)
├── hooks/         # shared hooks
├── lib/           # api client, utils
└── assets/
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- The [backend](https://github.com/DebuggingDork/PawSome-Backend) running locally (or a deployed API URL)

### Setup

```bash
npm install                 # install dependencies
cp .env.example .env        # fill in your own values
npm run dev                 # start dev server
```

The app is now available at `http://localhost:5174`.

## 🔑 Environment Variables

See [`.env.example`](.env.example) for the full list.

| Variable | Purpose |
|---|---|
| `VITE_API_URL` | Base URL of the FastAPI backend, e.g. `http://localhost:8000` |
| `VITE_WS_URL` | WebSocket origin for real-time chat, usually the same host as `VITE_API_URL` |

> 💡 If requests fail with CORS errors, check that the backend's `CORS_ORIGINS` includes this app's dev URL.

## 📜 Scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Start the Vite dev server |
| `npm run build` | Type-check and build for production |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint |
| `npm run format` | Format with Prettier |
| `npm run format:check` | Check formatting without writing |

## 📄 License

Private project — all rights reserved.
