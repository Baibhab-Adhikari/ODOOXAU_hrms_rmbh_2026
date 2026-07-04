# HRMS SaaS Platform (ODOO x AU)

A modern, multi-tenant Human Resource Management System (HRMS) designed as a Software-as-a-Service (SaaS) application. This platform enables multiple companies to manage their HR operations securely in isolated environments.

## Features

### Multi-Tenant Architecture

- **Tenant Isolation:** Data for each company (Employees, Attendance, Leaves, Salary, Documents) is strictly isolated using `company_id`.
- **Dynamic Login Prefixes:** Generates unique login prefixes for each company upon registration.
- **Role-Based Access Control (RBAC):** Distinct roles for HR Admins (manage the company) and Employees (view their own profiles, mark attendance, apply for leave).

### HR Capabilities

- **Employee Management:** Create and onboard employees, manage profiles, and organize departments.
- **Attendance Tracking:** Clock-in/Clock-out functionality and attendance logs.
- **Leave Management:** Request time off, track balances, and handle approvals.
- **Payroll & Salary Structures:** Define basic pay, allowances, deductions, and track effective dates.
- **Document Management:** Securely upload and manage employee documents (stored via Docker volumes).

## Tech Stack

### Frontend

- **Framework:** React 18 with Vite
- **Routing:** React Router v6
- **Styling:** Tailwind CSS v4 with Shadcn UI components
- **Forms & Validation:** React Hook Form + Zod
- **State & API:** Axios for API communication and custom Context providers for auth state.

### Backend

- **Framework:** FastAPI (Python 3.13)
- **Database ORM:** SQLAlchemy 2.0 (Async)
- **Database Driver:** asyncpg for PostgreSQL (hosted on Neon)
- **Authentication:** JWT (JSON Web Tokens) with Passlib (bcrypt)
- **Validation:** Pydantic models for strict data parsing and OpenAPI generation.
- **Package Manager:** `uv` (Astral)

## Project Structure

```
hrms_odoo/
├── backend/                  # FastAPI Application
│   ├── app/                  # Application code
│   │   ├── api/v1/           # API Routers
│   │   ├── core/             # Config, security, and constants
│   │   ├── db/               # SQLAlchemy models and session
│   │   ├── schemas/          # Pydantic validation schemas
│   │   └── services/         # Business logic layer
│   ├── tests/                # Pytest integration tests
│   └── Dockerfile            # Backend container configuration
├── frontend/                 # React Application
│   ├── src/                  # Application code
│   │   ├── components/       # Shared UI and Shadcn components
│   │   ├── pages/            # Page-level components (HR & Employee views)
│   │   ├── schemas/          # Zod validation schemas
│   │   └── types/            # TypeScript definitions
│   └── Dockerfile            # Frontend container (Nginx) configuration
├── docker-compose.yml        # Orchestrates the multi-container setup
└── README.md                 # Project documentation
```

## Getting Started

### Prerequisites

- Docker and Docker Compose
- PostgreSQL Database URL (e.g., Neon)

### Environment Setup

1. **Backend Environment Variables**
   Create a `backend/.env` file with the following variables:

   ```env
   PROJECT_NAME="HRMS Backend"
   # Replace with your actual Neon Postgres URL
   DATABASE_URL="postgresql+asyncpg://user:password@hostname/dbname?ssl=require"
   SECRET_KEY="your-super-secret-key-for-jwt"
   ACCESS_TOKEN_EXPIRE_MINUTES=1440
   ```

2. **Frontend Environment Variables**
   Create a `frontend/.env` file:

   ```env
   VITE_API_BASE_URL="http://localhost:8000/api/v1"
   ```

### Running the Application

The application is fully dockerized. To start both the frontend and backend services:

```bash
docker compose up --build -d
```

- **Frontend:** Accessible at `http://localhost:3000`
- **Backend API Docs (Swagger):** Accessible at `http://localhost:8000/docs`

### Running Tests

To run the integration tests (including the multi-tenancy isolation checks):

```bash
cd backend
uv run pytest
```

## File Uploads

Uploaded files (e.g., Profile Pictures and Documents) are managed via Docker volumes (`uploads:/app/uploads`). This ensures persistent storage across container restarts while remaining securely isolated from the application code.
