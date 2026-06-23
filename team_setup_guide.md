# Team Onboarding & Setup Guide

Welcome to the **Pune Authors App**! This guide explains exactly how to set up the project on a new computer and outlines the Git workflow our team of 6 will use to collaborate without overwriting each other's work.

---

## Part 1: Initial Local Setup

### 1. Prerequisites
Before starting, ensure your teammate has the following installed:
- **Node.js** (v18 or higher recommended)
- **Git**
- A code editor like **VS Code**

### 2. Clone the Repository
Open the terminal and run:
```bash
git clone https://github.com/02-anoop/pune-authors-app.git
cd pune-authors-app
```

### 3. Setup Environment Variables (`.env`)
The repository does *not* contain the `.env` files (for security reasons). You must manually share your environment variables with your teammates. 

They need to create two `.env` files exactly as written below:

**File 1: `server/.env` (Backend)**
Create a `.env` file inside the `server/` folder and paste this:
```env
# Environment variables declared in this file are NOT automatically loaded by Prisma.
# Please add `import "dotenv/config";` to your `prisma.config.ts` file, or use the Prisma CLI with Bun
# to load environment variables from .env files: https://pris.ly/prisma-config-env-vars.

# Prisma supports the native connection string format for PostgreSQL, MySQL, SQLite, SQL Server, MongoDB and CockroachDB.
# See the documentation for all the connection string options: https://pris.ly/d/connection-strings

DATABASE_URL="postgresql://postgres:Puneauthors2026@pune-authors-db.cy3okeeoeqyj.us-east-1.rds.amazonaws.com:5432/postgres?schema=public&connect_timeout=30&pool_timeout=30"
WEB3FORMS_ACCESS_KEY="33505130-94ba-420a-a7b7-f383970343e4"
JWT_SECRET="your_secret_key"
PORT=3001
```

**File 2: `.env` (Frontend)**
Create a `.env` file in the root folder of the project (`pune-authors-app/`) and paste this:
```env
# This is the base URL for the backend API. 
# By default it points to your local server on port 3001.
# If you are sharing the frontend using ngrok/localtunnel, or on a local Wi-Fi, 
# change this URL to the new backend address (e.g., "http://192.168.1.5:3001" or "https://my-backend.loca.lt").

VITE_API_URL=http://localhost:3001
```

### 4. Install Dependencies
Install the required packages for both the frontend and the backend.
```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd server
npm install
```

### 5. Setup the Database (Prisma)
Because we are using Prisma for the database, your teammate needs to generate the Prisma client so their local code knows the database structure.
```bash
# Ensure you are still in the /server directory
npx prisma generate
```
*(Note: Because the database is hosted on AWS RDS, they do **not** need to run `npx prisma db push` unless they are explicitly testing a schema change).*

### 6. Run the Application
Your teammate will need **two terminal windows** open to run the app locally.

**Terminal 1 (Backend):**
```bash
cd server
node index.js
```
*(The backend should start on `http://localhost:3001`)*

**Terminal 2 (Frontend):**
```bash
# From the root folder of the project
npm run dev
```
*(The frontend should start on `http://localhost:5173`)*

---

## Part 2: Team Collaboration Workflow (Git)

Since you have 5 members, you **cannot** all push directly to the `main` branch. If you do, you will face severe merge conflicts. Instead, follow the **Feature Branch Workflow**:

### 1. Synchronize with `main`
Before starting any new feature, always make sure you have the latest code:
```bash
git checkout main
git pull origin main
```

### 2. Create a Feature Branch
Create a new branch for the specific task you are working on. Name it descriptively.
```bash
git checkout -b feature/author-login
# or
git checkout -b bugfix/cart-error
```

### 3. Write Code and Commit
Work on your feature. When you are ready to save your progress:
```bash
git status
git add .
git commit -m "Added author login screen"
```

### 4. Push Your Branch
Push your newly created branch to GitHub:
```bash
git push -u origin feature/author-login
```

### 5. Create a Pull Request (PR)
1. Go to the GitHub repository in your web browser.
2. You will see a green button saying **"Compare & pull request"**. Click it.
3. Add a title and description explaining what your code does.
4. Click **Create pull request**.

### 6. Review and Merge
- Ask another teammate to review your code.
- If there are no conflicts, click the **"Merge pull request"** button on GitHub to safely merge your feature into the `main` branch.

### 7. Cleanup
Once your PR is merged, update your local computer and delete the old branch:
```bash
git checkout main
git pull origin main
git branch -d feature/author-login
```

---

## Part 3: Handling Database Changes (Prisma)
If a teammate needs to add a new column or table to `schema.prisma`:
1. Make the change in `server/prisma/schema.prisma`.
2. Run `npx prisma db push` (or `prisma migrate dev` if you switch to migrations).
3. Push the updated `schema.prisma` file in the Pull Request.
4. **CRITICAL:** When the other 4 teammates pull that code to their computers, they **MUST** run `cd server && npx prisma generate` so their local Prisma client updates to match the new schema!
