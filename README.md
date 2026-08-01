# Kori_Rotti

Kori_Rotti is a full-stack hospital referral and care coordination platform built to support rapid patient handoff from primary care facilities to receiving hospitals. The system combines a React-based front end for assessment and referral workflows with a Node.js/Express backend for referral processing, hospital coordination, and AI-assisted insights.

The project is designed for scenarios where frontline health workers need to:
- capture patient assessments and risk signals,
- create urgent referrals to a hospital network,
- monitor referral status and preparation steps,
- and support caregiver observations during the transfer process.

---

## Overview

Kori_Rotti brings together three core experiences:

1. Primary Health Center (PHC) workflow
   - create patient assessments,
   - review NEWS-style risk indicators,
   - send referrals to hospitals.

2. Receiving hospital workflow
   - review incoming referrals,
   - manage preparation checklists,
   - reroute referrals when needed.

3. Caregiver-facing workflow
   - share a patient observation page through a token-based link,
   - collect caregiver updates and signs.

---

## Key Features

### Patient assessment and referral creation
- add new patient assessments with risk scoring,
- track patient status in a dashboard,
- send referrals to the hospital network.

### AI-assisted trend prediction
- analyze vital sign trends to estimate deterioration risk,
- expose a prediction endpoint for the frontend.

### Hospital coordination and readiness
- evaluate hospital capacity and readiness,
- generate preparation checklists,
- support rerouting to alternate hospitals when required.

### Caregiver observation flow
- provide a token-based caregiver page,
- collect observation updates and patient feedback.

### Offline and UI enhancements
- offline mode toggle,
- dark/light theme support,
- responsive mobile-friendly components.

---

## Tech Stack

### Frontend
- React 19
- TypeScript
- Vite
- Tailwind CSS
- Recharts
- Lucide icons
- React QR Code

### Backend
- Node.js
- Express
- Firebase Admin SDK
- Twilio SMS integration
- dotenv

### AI / Intelligence
- Python-based AI scripts under the backend AI folder for training and prediction experiments,
- optional Ollama integration for checklist generation and coordination logic.

---

## Project Structure

```text
backend/
  package.json
  server.js
  src/
    app.js
    ai/
      delta_trend_model.py
      generate_dataset.py
      predict.py
      train_trend_model.py
      data/
      models/
    config/
      firebase.js
      serviceAccountKey.json
    controllers/
    middleware/
    routes/
    services/
    utils/
  test/

frontend/
  package.json
  vite.config.ts
  src/
    App.tsx
    components/
    data/
    services/
    utils/
```

---

## Prerequisites

Before running the project, make sure you have:
- Node.js 18 or newer
- npm or pnpm
- a Firebase project and valid service account configuration
- optional: Twilio credentials for SMS functionality
- optional: Ollama for AI-generated checklist support

---

## Environment Setup

### Backend
Create a `.env` file inside the backend folder with the following variables as needed:

```env
PORT=5000

# Optional SMS integration
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=your_twilio_number
HOSPITAL_PHONE_NUMBER=your_hospital_number

# Optional public URL for generated links
PUBLIC_APP_URL=http://localhost:5000

# Optional Ollama integration
OLLAMA_ENABLED=false
OLLAMA_HOST=http://localhost:11434
OLLAMA_MODEL=llama3.2:3b
```

### Frontend
Create or update a `.env` file in the frontend folder if the backend is not running on the default local address:

```env
VITE_API_URL=http://localhost:5000
```

> The Firebase service account file is already present under the backend config folder, so the backend can initialize Firebase Admin when the credentials are valid.

---

## Installation

### 1) Install backend dependencies

```bash
cd backend
npm install
```

### 2) Install frontend dependencies

```bash
cd ../frontend
npm install
```

---

## Running the Application

### Start the backend

```bash
cd backend
npm run dev
```

The backend will start on:
- http://localhost:5000

### Start the frontend

```bash
cd frontend
npm run dev
```

The frontend will be served on:
- http://localhost:3000

Open the frontend in your browser to access the PHC dashboard and related features.

---

## Main Application Routes

### Frontend routes
- `/` - main PHC dashboard
- `/hospital` - receiving hospital dashboard
- `/caregiver/:token` - caregiver observation page

### Backend API routes
- `GET /` - API health/root response
- `POST /api/ai/trend` - predict patient trend from vital sign data
- `POST /api/referrals` - create a new referral
- `GET /api/referrals/incoming` - list incoming referrals
- `GET /api/referrals/:id` - fetch a referral
- `PATCH /api/referrals/:id/status` - update referral lifecycle
- `PATCH /api/referrals/:id/checklist` - update checklist state
- `DELETE /api/referrals/:id` - delete a referral
- `GET /api/referrals/caregiver/:patientToken` - caregiver observation page data
- `POST /api/referrals/caregiver/:patientToken/observations` - submit caregiver observations
- `GET /api/hospitals` and related hospital endpoints - hospital discovery and details
- `GET /api/coordinator` and related coordinator endpoints - coordination and readiness logic

---

## Development Notes

### Backend behavior
The backend uses Firebase as the main persistence layer for referrals and hospital coordination data. It also integrates with Twilio for SMS notifications and can optionally use Ollama for AI-backed checklist generation.

### Frontend behavior
The frontend is a single-page app with route-like views controlled by client-side state. It supports multiple user flows inside one application shell.

### AI scripts
The Python scripts under the backend AI folder are useful for experimentation, training, and generating synthetic datasets for trend modeling. They are not required to run the main web app unless you want to extend the AI capabilities.

---

## Testing

Basic backend test infrastructure exists under the backend test folder. You can expand this area as the system grows.

Example:

```bash
cd backend
npm run dev
```

For frontend validation:

```bash
cd frontend
npm run build
```

---

## Recommended Workflow

1. Start the backend.
2. Start the frontend.
3. Create a patient assessment from the PHC view.
4. Send a referral to the hospital network.
5. Open the hospital view to review and prepare the referral.
6. Use the caregiver observation link when additional patient updates are needed.

---

## License

The package metadata lists the project license as ISC.

---

## Summary

Kori_Rotti is a practical digital referral and hospital coordination system for emergency and near-emergency care. It combines a modern UI with backend services for referrals, hospital readiness, caregiver communication, and AI-supported insights so that patient transfers can be handled more quickly and safely.
