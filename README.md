# Identity Verification Management System

A production-ready full-stack **Identity Verification System** with three clients sharing a single REST API backend:

- **Backend** — Node.js + Express + MongoDB + Cloudinary
- **Web** — React + Vite + Tailwind CSS
- **Mobile** — Flutter + Dart (Android & iOS)

---

## Architecture

```
FleetReplica/
│
├── server/          → Node.js + Express REST API
├── client/          → React + Vite web application
├── mobile/          → Flutter mobile application
└── README.md
```

All three clients share the same backend API. Authentication is JWT-based with role-based access control (RBAC).

---

## User Roles

| Role    | Permissions                                                    |
| ------- | -------------------------------------------------------------- |
| Maker   | Register, submit identity requests, upload documents, track status |
| Checker | View pending requests, approve/reject with remarks             |
| Admin   | All permissions + user CRUD, role management, audit logs       |

---

## Tech Stack

### Backend (`server/`)
- **Runtime**: Node.js
- **Framework**: Express.js 5
- **Database**: MongoDB + Mongoose
- **Auth**: JWT + bcrypt
- **Upload**: Multer + Cloudinary
- **Security**: Helmet, CORS, rate limiting
- **Docs**: Swagger UI (`/api-docs`)
- **Email**: Nodemailer (optional SMTP)

### Web (`client/`)
- **Framework**: React 19 + Vite
- **Styling**: Tailwind CSS 4
- **State**: React Context + TanStack Query
- **Routing**: React Router 7
- **HTTP**: Axios
- **PDF**: jsPDF

### Mobile (`mobile/`)
- **Framework**: Flutter (Dart)
- **Design**: Material 3 (light/dark)
- **State**: Provider
- **HTTP**: Dio
- **Storage**: SharedPreferences (JWT)
- **Images**: image_picker, cached_network_image

---

## Setup Instructions

### Prerequisites
- Node.js ≥ 18
- MongoDB (local or Atlas)
- Cloudinary account
- Flutter SDK ≥ 3.5 (for mobile)

### 1. Backend

```bash
cd server
cp .env.example .env   # Edit with your MongoDB, Cloudinary, JWT values
npm install
npm run seed            # Create test users
npm run dev             # Starts on port 5000
```

### 2. Web Client

```bash
cd client
npm install
npm run dev             # Starts on port 5173 (proxies API to 5000)
```

### 3. Mobile Client

```bash
cd mobile
# Edit lib/utils/constants.dart → set apiBaseUrl to your backend IP
flutter pub get
flutter run             # Run on device/emulator
```

> **Note for Android Emulator**: Use `http://10.0.2.2:5000/api` as the API base URL.
> **Note for physical device**: Use your machine's LAN IP (e.g., `http://192.168.1.x:5000/api`).

---

## Test Credentials

| Role    | Email                | Password    |
| ------- | -------------------- | ----------- |
| Admin   | admin@idverify.com   | admin123    |
| Checker | checker@idverify.com | checker123  |
| Maker   | maker@idverify.com   | maker123    |

Run `npm run seed` in the `server/` directory to create these users.

---

## API Documentation

Once the backend is running, visit:

```
http://localhost:5000/api-docs
```

This opens the interactive Swagger UI with all endpoints documented.

### API Endpoints Summary

| Method | Endpoint              | Role           | Description                          |
| ------ | --------------------- | -------------- | ------------------------------------ |
| POST   | `/api/auth/register`  | Public         | Register new maker                   |
| POST   | `/api/auth/login`     | Public         | Login and get JWT                    |
| GET    | `/api/auth/me`        | Authenticated  | Get current user profile             |
| POST   | `/api/identity/create`| Maker/Admin    | Submit identity request              |
| GET    | `/api/identity/my`    | Maker/Admin    | List maker's requests                |
| GET    | `/api/identity/:id`   | Authenticated  | Get request details                  |
| GET    | `/api/checker/pending`| Checker/Admin  | List requests by status              |
| GET    | `/api/checker/request/:id` | Checker/Admin | Get request for verification    |
| PUT    | `/api/checker/approve/:id` | Checker/Admin | Approve request                 |
| PUT    | `/api/checker/reject/:id`  | Checker/Admin | Reject request                  |
| GET    | `/api/admin/dashboard`| Admin          | Dashboard statistics                 |
| GET    | `/api/admin/users`    | Admin          | List all users                       |
| POST   | `/api/admin/user`     | Admin          | Create user                          |
| PUT    | `/api/admin/user/:id` | Admin          | Update user                          |
| DELETE | `/api/admin/user/:id` | Admin          | Delete user                          |
| GET    | `/api/admin/audit-logs`| Admin         | View audit logs                      |
| GET    | `/api/admin/requests` | Admin          | List all requests                    |

---

## Environment Variables

Create a `.env` file in `server/` (see `.env.example`):

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/identity-verification
JWT_SECRET=your_jwt_secret_key_change_in_production
JWT_EXPIRES_IN=7d
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your_email@example.com
SMTP_PASS=your_password
SMTP_FROM=noreply@identityverify.com
CLIENT_URL=http://localhost:5173
```

---

## Features

- ✅ JWT authentication with auto-login
- ✅ Role-based access control (Maker/Checker/Admin)
- ✅ Document upload to Cloudinary
- ✅ Identity verification workflow (Submit → Review → Approve/Reject)
- ✅ Zoomable document viewer
- ✅ Search, filter, sort, pagination
- ✅ PDF report download (web)
- ✅ Audit trail logging
- ✅ Email notifications on approval/rejection
- ✅ Dark mode / Light mode
- ✅ Rate limiting
- ✅ Swagger API documentation
- ✅ Responsive design (web + mobile)
- ✅ Pull-to-refresh, shimmer loading (mobile)

---

## UI Theme

Professional government-style identity verification design:

| Token     | Color     |
| --------- | --------- |
| Primary   | `#1E3A8A` |
| Secondary | `#2563EB` |
| Success   | `#16A34A` |
| Warning   | `#F59E0B` |
| Danger    | `#DC2626` |
| Background| `#F8FAFC` |

---

## License

ISC
