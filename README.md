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
* **Inventory & Fulfillment**: Manage book stock, view low-stock alerts, and fulfill direct customer web orders (Dispatch and Delivery tracking).
* **Event Registrations**: Register for upcoming literary fairs, submit payments, and track live event sales.
* **Settlement Tracking**: View detailed summaries of sold copies, commission models, and pending payouts.
* **Unified Library Donations**: Register titles for library donation campaigns with native stock clamping and real-time progress tracking.

### 👑 Admin Control Panel
* **Author Verifications**: Verify and approve pending author applications, certificates, and ID documents.
* **Order Management System**: Dedicated dashboards for standard **Web Orders** and specialized **Bulk Orders**. Admins can approve bulk requests, verify offline payments, and track fulfillment.
* **Event Manager & POS**: Create new book fairs, set registration fees, and log offline/on-ground event sales directly linked to author inventory.
* **Analytics & Reporting**: Switchable line-chart analytics (Books vs. Authors), and detailed CSV exports for sales, registrations, and library campaigns.
* **Broadcast Notifications**: Send targeted platform notifications or global broadcasts directly to author dashboards.

### 🛒 Public Storefront (Customer Facing)
* **Author Discovery**: Browse active authors, view their qualifications, and explore their published catalogs.
* **Book Purchasing & Cart**: Add books to cart, calculate shipping, and place standard web orders.
* **Bulk Order Requests**: Submit bulk order inquiries for large quantities, subject to admin approval and custom payment verification.

---

## 🛠️ Installation & Setup

### Prerequisites
* **Node.js** (v18+ recommended)
* **PostgreSQL** database (or an AWS RDS PostgreSQL instance)



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
