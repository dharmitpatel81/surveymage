# SurveyMage

A full-stack survey builder and response collection app. Create surveys, share links, collect responses, and view analytics dashboards with charts.

---

## Table of Contents

- [Live Demo](#live-demo)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [API Overview](#api-overview)
- [Issues & Solutions](#issues--solutions)
- [Deployment](#deployment)
- [License](#-license)
- [Author](#-author)

---

## Live Demo

| Service | URL |
|---------|-----|
| **Frontend** | [https://surveymage.onrender.com](https://surveymage.onrender.com) |
| **Backend API** | [https://surveymage-api.onrender.com/api/v1](https://surveymage-api.onrender.com/api/v1) |
| **API Docs (Swagger)** | [https://surveymage-api.onrender.com/api-docs](https://surveymage-api.onrender.com/api-docs) |

---

## Features

- **Survey builder** – Create surveys with multiple question types (text, choice, rating, etc.)
- **Anonymous & email auth** – Sign in with Google or use anonymously
- **Public survey links** – Share `/s/{surveyId}` for anyone to take surveys
- **Analytics dashboard** – Charts, widgets, CSV export
- **REST API** – Full API with Swagger docs for integrations
- **One response per user** – Optional enforcement by email/identifier

---

## Tech Stack

| Layer | Stack |
|-------|-------|
| **Frontend** | React 19, React Router, Firebase Auth, Chart.js, Tailwind CSS |
| **Backend** | Node.js, Express 5, MongoDB (Mongoose) |
| **Auth** | Firebase Authentication |
| **Deployment** | Render.com (Web Service + Static Site) |

---

## Project Structure

```
surveymage/
├── server/                 # Backend API
│   ├── routes/             # surveyRoutes, responseRoutes
│   ├── services/           # surveyService, responseService
│   ├── middleware/         # auth, validation, rate limit
│   ├── config/             # swagger, firebase
│   └── index.js
├── ui/                     # React frontend
│   ├── src/
│   │   ├── components/    # SurveyDesigner, SurveyViewer, DashboardDesigner, etc.
│   │   ├── contexts/      # AuthContext, ErrorContext
│   │   └── utils/          # serverComm, firebase config
│   └── public/
├── DEPLOY_RENDER.md        # Step-by-step Render deployment guide
└── README.md
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB (local or [MongoDB Atlas](https://www.mongodb.com/atlas))
- [Firebase](https://console.firebase.google.com) project

### Installation

```bash
# Clone the repo
git clone https://github.com/dharmitpatel81/surveymage.git
cd surveymage

# Install root deps (for dev script)
npm install

# Install server deps
cd server && npm install && cd ..

# Install UI deps
cd ui && npm install && cd ..
```

### Environment Setup

**Server** (`server/.env`):

```env
MONGODB_URI=mongodb://localhost:27017/surveymage
PORT=5000
CORS_ORIGIN=http://localhost:3000
```

Copy `server/serviceAccountKey.json` from Firebase Console → Project Settings → Service Accounts → Generate New Private Key.

**UI** (`ui/.env`):

```env
REACT_APP_API_URL=http://localhost:5000/api/v1
REACT_APP_FIREBASE_API_KEY=...
REACT_APP_FIREBASE_AUTH_DOMAIN=...
REACT_APP_FIREBASE_PROJECT_ID=...
REACT_APP_FIREBASE_STORAGE_BUCKET=...
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=...
REACT_APP_FIREBASE_APP_ID=...
```

See `server/.env.example` and `ui/.env.example` for full templates.

### Run Locally

```bash
# Start both server and UI
npm run dev
```

- Frontend: [http://localhost:3000](http://localhost:3000)
- API: [http://localhost:5000/api/v1](http://localhost:5000/api/v1)
- Swagger: [http://localhost:5000/api-docs](http://localhost:5000/api-docs)

---

## API Overview

| Endpoint | Auth | Description |
|----------|------|-------------|
| `GET /surveys` | Yes | List user's surveys |
| `POST /surveys/create` | Yes | Create blank survey |
| `GET /surveys/public/{id}` | No | Get survey for public viewing |
| `PUT /surveys/{id}` | Yes | Update survey |
| `GET /surveys/{id}/responses` | Yes | Get survey + responses for analytics |
| `GET /responses/checkSubmission` | No | Check if user already submitted |
| `POST /responses/submitResponse` | No | Submit survey responses |

Full docs: [https://surveymage-api.onrender.com/api-docs](https://surveymage-api.onrender.com/api-docs)

---

## Issues & Solutions

### 1. Swagger YAML Error: "Map keys must be unique; 'description' is repeated"

**Issue:** OpenAPI JSDoc in `surveyRoutes.js` had a response like `200: { description: Survey (title, description, questions, isOpen) }`. The word `description` inside the string was parsed as a duplicate key.

**Solution:** Quote the string: `200: { description: "Survey with title, description, questions, isOpen" }`.

---

### 2. Firebase Service Account on Render (No File Upload)

**Issue:** Render uses environment variables, not file uploads. The server expected `serviceAccountKey.json`.

**Solution:** Added support for `FIREBASE_SERVICE_ACCOUNT_JSON` env var. Paste the full JSON from the service account file as a single line in Render's Environment tab. The server checks this first, then falls back to the file locally.

---

### 3. Jest: "Cannot find module 'react-router-dom'"

**Issue:** `react-router-dom` v7 changed module structure; Jest (CRA) couldn't resolve it.

**Solution:** Downgraded to `react-router-dom@^6.28.0`, which works with Create React App's Jest setup.

---

### 4. AuthContext Test: "unsubscribe is not a function"

**Issue:** The `onAuthStateChanged` mock returned a function, but in some cases the cleanup called `unsubscribe()` when it wasn't a function.

**Solution:** Added a guard: `if (typeof unsubscribe === 'function') unsubscribe();` in the effect cleanup. Also simplified the test by mocking `onAuthStateChanged` to immediately call the callback with a user, avoiding timer complexity.

---

### 5. CORS Errors in Production

**Issue:** Frontend at `https://surveymage.onrender.com` couldn't call the API due to CORS.

**Solution:** Set `CORS_ORIGIN` on the backend to the exact frontend URL: `https://surveymage.onrender.com`. Add the frontend domain to Firebase **Authentication → Settings → Authorized domains**.

---

### 6. Redundant / Duplicate Code

**Issue:** Unused exports, duplicate routes, and redundant config made the codebase harder to maintain.

**Solution:** Removed unused `export default app` from Firebase config, removed `logger.debug` export, consolidated duplicate API root handlers, removed legacy `/api` routes (kept `/api/v1`), simplified `apiResponse.error` by dropping unused `details` param, and cleaned up `WidgetPreview` `SIZE_CLASSES`.

---

## Deployment

Deployed on [Render.com](https://render.com):

- **Backend:** Web Service (Node), Root Directory: `server`
- **Frontend:** Static Site, Root Directory: `ui`, Publish: `build`

See **[DEPLOY_RENDER.md](./DEPLOY_RENDER.md)** for a full step-by-step guide.

Pushes to the connected GitHub branch trigger automatic deploys.

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start server + UI (concurrently) |
| `npm run server` | Start backend only |
| `npm run client` | Start UI only |
| `cd server && npm test` | Run backend tests |
| `cd ui && npm test` | Run frontend tests |
| `cd ui && npm run build` | Build UI for production |

---

## 📝 License

This project is for educational purposes. Use freely for learning and portfolio projects.

---

## 👨‍💻 Author

**Developed By:** [Dharmit Patel](https://github.com/dharmitpatel81)
