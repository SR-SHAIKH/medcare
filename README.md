# MedCare – Appointment Booking & Telemedicine Platform

MedCare is a STARTUP-GRADE SaaS platform built for modern healthcare. It provides an intuitive interface for patients to book appointments, consult with doctors via secure video links, and process payments instantly. 

The platform features tailored dashboards for Patients, Doctors, and Administrators.

## Tech Stack
* **Frontend:** React, Vite, Tailwind CSS, Lucide Icons, React Router, Axios
* **Backend:** Node.js, Express.js, Socket.io
* **Database:** MongoDB with Mongoose
* **Video Consultation:** Jitsi API 
* **Payments:** Stripe Checkout
* **Notifications:** Twilio (SMS/WhatsApp stubbed), Nodemailer
* **Security:** Helmet, express-rate-limit, cors, xss-clean, bcrypt, JWT

## Directory Structure

```text
/medcare-app
├── client/              # React Frontend environment (Vite)
│   ├── src/
│   │   ├── components/  # Reusable UI (Navbar, Footer, etc)
│   │   ├── pages/       # Dashboards, Booking Flow, Login, Home
│   │   └── index.css    # Tailwind theme rules
├── server/              # Node.js/Express Backend environment
│   ├── config/          # DB config
│   ├── controllers/     # Route logic for auth, appointments, payments
│   ├── middleware/      # Auth rules, error handling
│   ├── models/          # Mongoose Schemas
│   ├── routes/          # API Routers
│   ├── utils/           # Stripe Webhooks, Emailing wrappers
│   └── server.js        # Main Entry Point
└── README.md
```

## Environment Variables

To run this project locally or in production, you will need to set the following environment variables.

### Backend (`server/.env`)
```env
PORT=5000
NODE_ENV=development
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRE=30d
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
SMTP_HOST=smtp.mailtrap.io
SMTP_PORT=2525
SMTP_EMAIL=your_email
SMTP_PASSWORD=your_password
TWILIO_ACCOUNT_SID=your_sid
TWILIO_AUTH_TOKEN=your_token
TWILIO_PHONE_NUMBER=your_number
```

### Frontend (`client/.env`)
```env
# Define backend connection URL if not using proxy
VITE_API_URL=http://localhost:5000/api/v1
# Stripe Publishable Key
VITE_STRIPE_PUBLIC_KEY=pk_test_...
```

## Running Locally

1. **Install Dependencies**
   Open two terminals.
   ```bash
   # Terminal 1 - Backend
   cd server
   npm install
   
   # Terminal 2 - Frontend
   cd client
   npm install
   ```

2. **Start the Development Servers**
   ```bash
   # Terminal 1 - Backend
   cd server
   npm run dev
   
   # Terminal 2 - Frontend
   cd client
   npm run dev
   ```

3. **Access the Application**
   Open your browser and navigate to `http://localhost:5173`. The backend will be running on `http://localhost:5000`.

## Deployment Guide

### Deploying the Frontend (Vercel)
Vercel is the recommended host for Vite/React applications.
1. Push your code to a GitHub repository.
2. Sign in to [Vercel](https://vercel.com/) and click **Add New > Project**.
3. Import your GitHub repository.
4. **Important**: Set the Root Directory to `client`.
5. The Build Command should auto-detect as `npm run build` and Output Directory as `dist`.
6. Add your Environment variables (e.g. `VITE_API_URL` pointing to your deployed backend).
7. Click **Deploy**.

### Deploying the Backend (Render or Railway)
Render provides an excellent free tier for Node.js apps.
1. Sign in to [Render](https://render.com/) and click **New > Web Service**.
2. Connect your GitHub repository.
3. Set the Root Directory to `server`.
4. Set the Environment to `Node`.
5. Setup the Build Command: `npm install`
6. Setup the Start Command: `npm start`
7. In the Advanced section, add all required Environment Variables from your `.env` file (MONGO_URI, JWT_SECRET, STRIPE_SECRET_KEY).
8. Click **Create Web Service**.

## Real-Time Features
* **Socket.io:** Handles instant status updates for the Doctor dashboard when a patient enters the "waiting room."
* **Jitsi Meetings:** Meeting URIs are generated automatically via random hash suffixing during the Booking flow success step.

## Security Posture
* Passwords are cryptographically hashed using `bcryptjs`.
* Session management is handled via stateless JSON Web Tokens.
* Express-rate-limit prevents brute force attacks on Auth routes.
* Mongoose schema validation ensures strict data casting.
* Helmet sets up to date HTTP security headers.
* CORS restricts API access strictly to the production frontend URL.
