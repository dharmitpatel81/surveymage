# Deploy SurveyMage on Render.com – Step-by-Step Guide

## Overview

You will deploy:
1. **Backend** (API server) → Render Web Service
2. **Frontend** (React app) → Render Static Site

---

## Part 1: Prerequisites (Do These First)

### 1.1 Push Code to GitHub

1. Create a GitHub repo (if you haven’t already).
2. Push your Surveymage project:
   ```bash
   git add .
   git commit -m "Prepare for deployment"
   git remote add origin https://github.com/YOUR_USERNAME/surveymage.git
   git push -u origin main
   ```

### 1.2 MongoDB Atlas (Database)

1. Go to [mongodb.com/atlas](https://www.mongodb.com/atlas) and sign up.
2. Create a **free M0 cluster**.
3. **Database Access** → Add Database User → create username and password.
4. **Network Access** → Add IP Address → choose **Allow Access from Anywhere** (`0.0.0.0/0`).
5. **Database** → Connect → **Drivers** → copy the connection string.
6. Replace `<password>` with your user password. Example:
   ```
   mongodb+srv://myuser:mypassword@cluster0.xxxxx.mongodb.net/surveymage?retryWrites=true&w=majority
   ```
7. Save this as `MONGODB_URI` for later.

### 1.3 Firebase Service Account (Backend Auth)

1. Go to [Firebase Console](https://console.firebase.google.com) → your project.
2. **Project Settings** (gear) → **Service Accounts**.
3. Click **Generate New Private Key**.
4. Save the downloaded JSON file.
5. Open it and copy the **entire JSON** (one line). You’ll paste it as `FIREBASE_SERVICE_ACCOUNT_JSON` on Render.

### 1.4 Firebase Authorized Domains

1. In Firebase Console → **Authentication** → **Settings** → **Authorized domains**.
2. Add your Render frontend URL (e.g. `surveymage.onrender.com`). You can add this after the frontend is deployed.

---

## Part 2: Deploy Backend on Render

### 2.1 Create Web Service

1. Go to [render.com](https://render.com) and sign up (use GitHub).
2. Click **New +** → **Web Service**.
3. Connect your GitHub account if needed.
4. Select the **surveymage** repository.

### 2.2 Configure Backend

Use these settings:

| Field | Value |
|-------|--------|
| **Name** | `surveymage-api` (or any name) |
| **Region** | Choose closest to you |
| **Root Directory** | `server` |
| **Runtime** | Node |
| **Build Command** | `npm install` |
| **Start Command** | `npm start` |
| **Instance Type** | Free |

### 2.3 Add Environment Variables

Click **Advanced** → **Add Environment Variable**. Add:

| Key | Value |
|-----|-------|
| `MONGODB_URI` | Your MongoDB Atlas connection string |
| `NODE_ENV` | `production` |
| `CORS_ORIGIN` | `https://YOUR-FRONTEND-URL.onrender.com` (add after frontend deploy; use `https://surveymage.onrender.com` if that will be your frontend URL) |
| `FIREBASE_PROJECT_ID` | Your Firebase project ID (e.g. `surveymage-0`) |
| `FIREBASE_SERVICE_ACCOUNT_JSON` | Paste the full JSON from serviceAccountKey.json as a single line |

**Tip for FIREBASE_SERVICE_ACCOUNT_JSON:** Open the JSON file, copy everything, then paste into Render. Remove line breaks so it’s one line. Example format:
```json
{"type":"service_account","project_id":"surveymage-0","private_key_id":"...","private_key":"-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n","client_email":"...","client_id":"...","auth_uri":"...","token_uri":"...","auth_provider_x509_cert_url":"...","client_x509_cert_url":"..."}
```

### 2.4 Deploy

1. Click **Create Web Service**.
2. Wait for the build and deploy to finish.
3. Copy your backend URL, e.g. `https://surveymage-api.onrender.com`.

### 2.5 Test Backend

Open: `https://YOUR-BACKEND-URL.onrender.com/api/v1`

You should see JSON with `message`, `status`, etc.

---

## Part 3: Deploy Frontend on Render

### 3.1 Create Static Site

1. In Render dashboard, click **New +** → **Static Site**.
2. Connect the same **surveymage** repository.

### 3.2 Configure Frontend

| Field | Value |
|-------|--------|
| **Name** | `surveymage` (or any name) |
| **Root Directory** | `ui` |
| **Build Command** | `npm install && npm run build` |
| **Publish Directory** | `build` |

### 3.3 Add Environment Variables

Add these (use your real values):

| Key | Value |
|-----|-------|
| `REACT_APP_API_URL` | `https://YOUR-BACKEND-URL.onrender.com/api/v1` |
| `REACT_APP_FIREBASE_API_KEY` | From Firebase Console → Project Settings → General |
| `REACT_APP_FIREBASE_AUTH_DOMAIN` | `your-project.firebaseapp.com` |
| `REACT_APP_FIREBASE_PROJECT_ID` | Your Firebase project ID |
| `REACT_APP_FIREBASE_STORAGE_BUCKET` | `your-project.firebasestorage.app` |
| `REACT_APP_FIREBASE_MESSAGING_SENDER_ID` | From Firebase config |
| `REACT_APP_FIREBASE_APP_ID` | From Firebase config |

### 3.4 Deploy

1. Click **Create Static Site**.
2. Wait for the build to finish.
3. Copy your frontend URL, e.g. `https://surveymage.onrender.com`.

---

## Part 4: Final Setup

### 4.1 Update CORS on Backend

1. Go to your **backend** Web Service on Render.
2. **Environment** → edit `CORS_ORIGIN`.
3. Set it to your frontend URL: `https://YOUR-FRONTEND-URL.onrender.com`.
4. Save. Render will redeploy automatically.

### 4.2 Add Frontend URL to Firebase

1. Firebase Console → **Authentication** → **Settings** → **Authorized domains**.
2. Add: `YOUR-FRONTEND-URL.onrender.com` (without `https://`).

---

## Part 5: Verify

1. Open your frontend URL in a browser.
2. Sign in and create a survey.
3. Open the API docs: `https://YOUR-BACKEND-URL.onrender.com/api-docs`.

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Backend fails to start | Check Render logs. Ensure `MONGODB_URI` and `FIREBASE_SERVICE_ACCOUNT_JSON` are correct. |
| CORS errors | Set `CORS_ORIGIN` to your exact frontend URL (with `https://`). |
| Firebase auth fails | Add your frontend domain to Firebase Authorized domains. |
| Free tier sleeps | Render free tier sleeps after ~15 min of inactivity. First request may take 30–60 seconds. |
| Build fails | Check Root Directory (`server` or `ui`), Build Command, and Publish Directory (`build` for frontend). |

---

## Quick Reference

- **Backend URL:** `https://surveymage-api.onrender.com` (example)
- **Frontend URL:** `https://surveymage.onrender.com` (example)
- **API docs:** `https://surveymage-api.onrender.com/api-docs`
