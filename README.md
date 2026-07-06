# Pune Authors Association (PAA) Application

A modern, full-stack web ecosystem built for the Pune Authors Association. The platform empowers authors to list their catalogs, participate in literary events/book fairs, manage POS sales, track inventory, and register book donations for public, cafe, and airport libraries. It also provides admins with a robust panel for verifying registrations, tracking transactions, viewing line-chart performance metrics, and managing the unified book delivery pipeline.

---

## 🚀 Tech Stack

### Frontend
* **Core**: React 18 (TypeScript), Vite
* **Styling**: Tailwind CSS
* **Charts**: Recharts (smooth, filterable line charts)
* **Icons & UI Elements**: Lucide React, Radix UI primitives, Sonner (Toasts)
* **State & HTTP**: Axios

### Backend & Database
* **Server**: Node.js, Express
* **Database ORM**: Prisma (PostgreSQL / AWS RDS)
* **Authentication**: JWT (JSON Web Tokens), bcrypt hashing
* **File Uploads**: Multer (for payment screenshot uploads)
* **Mail Server**: Nodemailer (OTP and notification dispatches)

---

## ✨ Features

### 👤 Author Dashboard
* **Profile & Catalog Management**: Create draft registrations, add qualifications, list published titles, and upload covers.
* **Low-Stock Alerts**: Automatic warnings in the dashboard when catalog titles fall below threshold counts.
* **Event Registrations**: Register for upcoming literary fairs, submit payments, and track live sales.
* **Settlement Tracking**: View detailed summaries of sold copies, flat or percentage commission models, and pending payouts.
* **Unified Library Donations**: Register titles for library donation campaigns. Features:
  * Native stock clamping to prevent donating more than available copies.
  * Real-time progress tracker (`Verification` ➔ `Awaiting Dispatch` ➔ `Dispatched` ➔ `Library Reached`).
  * Instant auto-restoration of inventory stock if a donation registration is deleted before approval.

### 👑 Admin Control Panel
* **Author Verifications**: Verify and approve pending author applications, certificates, and ID documents.
* **Event Manager**: Create new book fairs, set registration fees, flat or percentage commissions, and manage opt-ins.
* **POS Order Center**: Log offline/on-ground event sales directly linking event stocks to author inventory.
* **Line-Chart Performance Overview**: Switchable analytics graphs to filter stats by "Both", "Books Only", or "Authors Only".
* **Donation Pipeline & Status Control**: Unified inline row-level stepper controls to approve payment, toggle dispatch status, and mark final library deliveries.
* **Detailed CSV Exports**: Export generated sales, registrations, and library campaign reports at a click.

---

## 🛠️ Installation & Setup

### Prerequisites
* **Node.js** (v18+ recommended)
* **PostgreSQL** database (or an AWS RDS PostgreSQL instance)

### 1. Database & Environment Configuration
In the `server/` directory, create a `.env` file and define the following variables:
```env
DATABASE_URL="postgresql://username:password@host:port/dbname?schema=public"
JWT_SECRET="your_jwt_secret_key"
PORT=3001
```

### 2. Backend Setup
```bash
# Navigate to the server folder
cd server

# Install dependencies
npm install

# Push the Prisma schema to configure tables
npx prisma db push

# Start the nodemon developer server
npm run dev
```

The backend server will launch on `http://localhost:3001`.

### 3. Frontend Setup
```bash
# Return to the root folder
cd ..

# Install dependencies
npm install

# Start the Vite HMR server
npm run dev
```

The frontend application will launch on `http://localhost:5173`.

---

## 📁 Directory Structure

```
├── public/                  # Static assets
├── server/                  # Backend Express application
│   ├── config/              # Database (Prisma client) & upload configurations
│   ├── middleware/          # JWT Token verification and role checks
│   ├── prisma/              # Prisma schema definition file
│   ├── routes/              # Express API route handlers (auth, donations, events)
│   ├── index.js             # Main server entry file
│   └── package.json         # Backend dependencies & script definitions
├── src/                     # React Frontend Source
│   ├── app/                 # Components, router views, and layouts
│   │   ├── components/      # Main dashboard tabs (LibraryDonationsTab, etc.)
│   │   └── App.tsx          # Application router setup
│   ├── styles/              # Custom stylesheets
│   ├── main.tsx             # Main React script entry
│   └── index.css            # Core design utility CSS
├── tsconfig.json            # TypeScript configuration compiler rules
├── vite.config.ts           # Vite Bundler settings
└── package.json             # Root UI dependencies & run commands
```

---

## 📜 License
This project is private and proprietary. All rights reserved.
