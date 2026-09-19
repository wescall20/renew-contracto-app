# Renew Contractor Portal — Private Deployment Guide

This repository contains the private marketing, lead acquisition, and contractor portal for **Mark Karlon** (Renew Home Improvement) and **Paulo** (`paulospeople@gmail.com`).

---

## 1. Fast Launch to a Private Host

You can deploy this repository using either of these two fast, reliable options:

### Option A: Direct Google Cloud Run (Built into AI Studio — No Third Party Needed)
1. In the top toolbar of Google AI Studio, click **Deploy**.
2. Select **Cloud Run**.
3. AI Studio packages the application container directly to Google Cloud Run and gives you an instant, fast HTTPS URL with zero manual configuration.

### Option B: Railway.app (Recommended GitHub Host)
1. Go to [Railway.app](https://railway.app) and sign in with GitHub.
2. Click **Start a New Project** > **Deploy from GitHub repo**.
3. Select your private `renew-contractor-portal` repository.
4. Under **Variables**, add:
   - `GEMINI_API_KEY`: Your Google Gemini API Key
   - `APP_PRIVATE_PIN`: `4242` (or your chosen private passcode)
5. Railway automatically runs `npm run build` and `npm run start` and gives you a private HTTPS link in under 45 seconds!

### Option C: DigitalOcean App Platform / Docker
Use the included `Dockerfile`:
```bash
docker build -t renew-portal .
docker run -p 3000:3000 -e GEMINI_API_KEY="your_key" -e APP_PRIVATE_PIN="4242" renew-portal
```

---

## 2. Installing the App to Your Phone (Mark & Paulo)

This application is built as a Progressive Web App (PWA) that installs as a native full-screen app on both iPhones and Android phones without needing the App Store.

### On Apple iPhone / iPad:
1. Open your private site URL in **Safari**.
2. Tap the **Share** button (box with upward arrow at the bottom).
3. Scroll down and tap **"Add to Home Screen"**.
4. Tap **Add**. The Renew icon will appear on your iPhone home screen!
5. Tap the icon anytime to open the full-screen contractor portal with no browser address bars.

### On Android:
1. Open your private site URL in **Chrome**.
2. Tap the in-app **"Download to Phone"** button in the top bar (or tap Chrome's 3-dot menu and select **"Install App"**).
3. Confirm the install. The Renew app is added to your home screen and apps drawer.

---

## 3. Privacy & Passcode Protection

The app includes private access protection:
- Default Master Contractor PIN: `4242` (celebrating 42 years of local New England craftsmanship).
- Authorized accounts: **Mark Karlon** & **Paulo**.
- Sessions can be persisted on your personal phone with "Remember this device" so you don't have to enter the PIN every time you launch from your home screen.
