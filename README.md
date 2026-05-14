# Asset Tracking and QR Movement System

A full-stack asset tracking app for managing employees, assigned assets, QR codes, movement scans, logs, reports, and admin access.

## What This Project Does

- Manage employee records.
- Manage assets such as laptops, devices, and other office equipment.
- Assign assets to employees.
- Generate and print QR codes for assets.
- Scan QR codes when assets move `OUT`, come `IN`, or go to `MAINTENANCE`.
- Store every movement attempt as a success or failure log.
- View dashboards, asset logs, movement logs, and reports.
- Protect the app with admin login and role-based access.

## Tech Stack

### Backend

- Node.js
- Express
- PostgreSQL
- Prisma
- JWT authentication
- Zod validation
- Winston logging
- Excel/PDF report support

### Frontend

- React
- TypeScript
- Vite
- Tailwind CSS
- React Router
- Axios
- TanStack Table
- Recharts
- QR code generation and scanning

## Project Structure

```text
Asset Tracking/
|-- Backend/
|   |-- prisma/              Database schema, migrations, and seed file
|   |-- scripts/             Database setup/check helper scripts
|   |-- src/
|   |   |-- config/          Environment and database setup
|   |   |-- controllers/     Route handlers
|   |   |-- middleware/      Auth, validation, logging, errors
|   |   |-- repositories/    Database access layer
|   |   |-- routes/          API routes
|   |   |-- services/        Business logic
|   |   |-- uploads/         Uploaded files
|   |   |-- validators/      Zod validation schemas
|   |   `-- server.js        Backend entry point
|   `-- package.json
|-- Frontend/
|   |-- src/
|   |   |-- components/      Shared UI components
|   |   |-- context/         Auth and theme context
|   |   |-- layouts/         Navbar, sidebar, app layout
|   |   |-- pages/           Dashboard, assets, employees, scanner, logs, settings
|   |   |-- routes/          Frontend route setup
|   |   `-- services/        API service files
|   `-- package.json
`-- README.md
```

## Requirements

- Node.js 18 or newer
- npm
- PostgreSQL

## Backend Setup

Open a terminal in the backend folder:

```powershell
cd "D:\Asset Tracking\Backend"
npm install
copy .env.example .env
```

Update `Backend/.env` with your PostgreSQL details:

```env
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your-postgres-password
DB_NAME=asset_tracking
DB_SCHEMA=public
AUTO_DB_SETUP=true
AUTO_DB_SEED=true
JWT_SECRET=replace-with-a-long-random-secret
CORS_ORIGIN=http://localhost:5173
QR_PUBLIC_BASE_URL=http://localhost:5000
ADMIN_EMAIL=admin@company.com
ADMIN_PASSWORD=xxxxx
```

Start the backend:

```powershell
npm run dev
```

With `AUTO_DB_SETUP=true`, the backend will create the database if needed, apply Prisma migrations, and seed demo data during startup.

Backend URLs:

```text
API:          http://localhost:5000/api
Health check: http://localhost:5000/health
```

Useful backend commands:

```powershell
npm run db:check
npm run db:setup
npm run prisma:generate
npm run prisma:migrate
npm run prisma:studio
npm run db:seed
```

## Frontend Setup

Open another terminal in the frontend folder:

```powershell
cd "D:\Asset Tracking\Frontend"
npm install
copy .env.example .env
npm run dev
```

Frontend URL:

```text
http://localhost:5173
```

The frontend reads the backend URL from `Frontend/.env`:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

## Default Login

If you keep the default admin values in `Backend/.env`, use:

```text
Email:    admin@company.com
Password: admin123
```

## Main App Pages

- `/dashboard` - overview and charts
- `/employees` - employee management
- `/assets` - asset management and QR actions
- `/qr-scanner` - QR movement scanning
- `/logs` - logs and reports
- `/settings` - app settings
- `/login` - admin login

## API Areas

The backend exposes these route groups under `/api`:

- `/api/auth`
- `/api/employees`
- `/api/assets`
- `/api/qr`
- `/api/scanner`
- `/api/logs`
- `/api/reports`

## Important Business Rules

- New assets start as `IN_OFFICE`.
- Asset movement should happen through the scanner flow.
- `OUT` moves an `IN_OFFICE` asset to `OUTSIDE`.
- `IN` moves an `OUTSIDE` asset back to `IN_OFFICE`.
- `MAINTENANCE` moves an eligible asset to `MAINTENANCE`.
- Invalid scans do not update the asset status.
- Every scan attempt is saved in `asset_movement_logs`.

## Network Access

To use the app from another device on the same network, replace localhost with your computer's LAN IP.

Example LAN IP:

```text
172.30.4.151
```

Update `Frontend/.env`:

```env
VITE_API_BASE_URL=http://172.30.4.151:5000/api
```

Update `Backend/.env`:

```env
CORS_ORIGIN=http://localhost:5173,http://127.0.0.1:5173,http://172.30.4.151:5173
QR_PUBLIC_BASE_URL=http://172.30.4.151:5000
```

Then restart both backend and frontend servers.

## Notes

- Environment files are ignored by Git.
- `node_modules`, build output, logs, uploads, caches, and TypeScript build info are ignored.
- The QR print action prints only the QR image, not the full page or modal.
