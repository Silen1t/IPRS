Here is the updated, complete `README.md` block. It has been updated to specifically highlight integration with the latest **React Router v7** features (which unifies Remix and React Router into a single powerful system), alongside your **React 19**, **.NET 10**, and **Neon PostgreSQL DB** stack.

# Internal Procurement Request System (IPRS)

An internal enterprise web application engineered for **Majd Technology Company (شركة مجد للتقنية)** to digitize and enforce a structured, two-level approval workflow for procurement operations. The system automates the lifecycle of internal purchase requests, moving seamlessly from employee submission to departmental manager review, and finally to finance officer verification for Purchase Order (PO) issuance.

## 🚀 Architecture & Tech Stack

This project is built using a modern, decoupled full-stack architecture optimized for strict data integrity, type safety, and real-time state synchronization.

* **Frontend:** React 19, TypeScript, Tailwind CSS, Shadcn UI components, React Router v7 (latest unified routing architecture).
* **State Management & Forms:** Zustand (global auth & notification stores), React Hook Form.
* **Backend:** ASP.NET Core 10 Web API, Entity Framework Core (Code-First).
* **Database:** PostgreSQL (Cloud-hosted via Neon DB).
* **Authentication:** JWT Bearer Token Authentication with custom expired session token rotation.
* **Real-time Communication:** SignalR for event-driven, system-wide in-app notifications.

---

## ⚙️ Core System Architecture

### 1. Request Lifecycle State Machine
Requests are driven by a strict backend-enforced state machine. Status transitions follow an irreversible sequential pipeline unless pushed back via a rejection:

```text
 [DRAFT] ──> [PENDING_MANAGER] ──> [PENDING_FINANCE] ──> [APPROVED] (PO Issued)
                  │                     │
                  ▼                     ▼
             [REJECTED]            [REJECTED]
```

* **DRAFT:** Created by employee; fully editable.
* **PENDING_MANAGER:** Awaiting action from the designated department manager.
* **PENDING_FINANCE:** Approved by manager; awaiting final finance confirmation.
* **APPROVED:** Finalized by finance; a required unique Purchase Order (PO) number is bound.
* **REJECTED / CANCELLED:** Terminal states. Once moved here, the request locks completely.

### 2. RBAC (Role-Based Access Control) Matrix

The application implements strict four-tier role segmentation enforced simultaneously via frontend route guards using React Router v7 layout configurations and backend authorization policies (`[Authorize(Roles = "...")]`):

| User Role | Arabic Label | System Responsibility |
| --- | --- | --- |
| **Employee** | موظف | Submits and tracks own departmental requests; handles draft revisions. |
| **Manager** | مدير قسم | Dashboard queue tracking; approves/rejects requests within their department. |
| **Finance** | مسؤول مالي | Final verification layer; evaluates all manager-approved requests and issues PO numbers. |
| **Admin** | مشرف النظام | Full system oversight; manages users, deactivations, departments, and categories. |

---

## 🔒 Enterprise Business Rules Enforced

* **Zero-Zero Client Layer:** Total price tracking is strictly computed on the backend as `Quantity * UnitPrice` to eliminate client-side payload tampering.
* **Deterministic Key Generation:** Tracking keys are systematically auto-generated using an automated database sequence formatting structure (`PR-YYYY-NNNN`).
* **Conditional Risk Validation:** High-value procurement requests exceeding **50,000 SAR** dynamically invoke strict model validation rules, enforcing a comprehensive justification string within the `Description` field.
* **Immutability Windows:** The system completely locks a record from external updates the moment its state shifts out of `DRAFT`.
* **Strict Scope Isolation:** Departmental managers are cryptographically restricted from reading, querying, or intercepting data structures originating outside their assigned organizational unit.

---

## 📁 Repository Directory Structure

```text
├── IPRS.Server/                # ASP.NET Core 10 Web API
│   ├── Controllers/            # REST API endpoints & Http route endpoints
│   ├── Models/                 # EF Core data entities & database schema models
│   ├── DTOs/                   # Data Transfer Objects for strict validation
│   ├── Services/               # Core business logic processing layers
│   ├── Repositories/           # Data access abstraction layers
│   ├── Data/                   # Database contexts & seed initialization handlers
│   ├── Extensions/             # Model conversion tooling & object mapping hooks
│   ├── Helpers/                # Shared utilities and system text tools
│   ├── Hubs/                   # SignalR real-time messaging pipeline systems
│   ├── Infrastructure/         # Lower-level core system configuration layers
│   ├── Providers/              # Core functional cross-cutting logic modules
│   ├── Middleware/             # Global error interceptors & identity filters
│   ├── Common/                 # Shared generic structures & ServiceResult patterns
│   └── Program.cs              # Dependency injection & service configuration
│
└── iprs.client/                # React 19 Single Page Application (SPA)
    ├── src/
    │   ├── assets/             # Images, SVGs, and brand design elements
    │   ├── components/         # Shared UI modular components (DataTables, Badges)
    │   ├── config/             # React Router v7 configuration, loaders, and API routes
    │   ├── contexts/           # React context modules or custom event frames
    │   ├── hooks/              # Custom functional hooks & state behaviors
    │   ├── pages/              # Role-specific dashboard layouts & workflow panels
    │   ├── providers/          # Application shell wrappers & configuration boundaries
    │   ├── schemas/            # Form validation validation trees (Zod/Yup matrices)
    │   ├── services/           # Integrated Axios API communication pipelines
    │   ├── shadcn-ui/          # Configured core design library primitives
    │   ├── store/              # Reactive Zustand global data stores
    │   ├── types/              # Unified TypeScript interfaces
    │   └── utils/              # Formatter helpers (Currency serialization, date systems)
```

---

## 🛠️ Installation & Getting Started

### Prerequisites

* [.NET 10.0 SDK](https://dotnet.microsoft.com/en-us/download)
* [Node.js](https://nodejs.org/) (v18 or higher)
* PostgreSQL Database Instance (Hosted on Neon DB)

### 1. Database Setup & Migrations

Ensure your Neon DB connection string is properly updated under `ConnectionStrings:DefaultConnection` in your `appsettings.json`. Then run the following to apply the Entity Framework core migrations directly onto your remote PostgreSQL cluster:

```bash
cd IPRS.Server
dotnet ef database update
```

### 2. Spin Up the Backend API

Run the ASP.NET Core environment. The pipeline will automatically bind to its local endpoints and initialize the SignalR event listeners:

```bash
dotnet run
```

### 3. Initialize the Frontend Application

Open a new terminal shell inside the client application directory, restore dependencies, and start the development server environment:

```bash
cd iprs.client
npm install
npm run dev
```

---

## 👥 Built-In Development Seed Credentials

The database seeder provisions standard testing context records out of the box directly onto your Neon database instance if no user entities are detected:

* **System Admin:** `admin@majd.com` (Password: `Admin@123`)
* **Finance Officer:** `finance@majd.com` (Password: `Finance@123`)
* **IT Department Manager:** `manager.it@majd.com` (Password: `Manager@123`)
* **IT Employee:** `ahmed@majd.com` (Password: `Employee@123`)

---

## 📝 Key Learning Outcomes & Implementation Highlights

This project served as a deep-dive laboratory for mastering enterprise engineering patterns:

* **Cutting-Edge Framework Configurations:** Built using .NET 10 and React 19, taking full advantage of the new React Router v7 routing structures to encapsulate structural authorization logic cleaner than ever.
* **Serverless Cloud Infrastructure Integration:** Structured data schemas using decoupled PostgreSQL configurations, addressing low-latency transactional bindings via cloud instances on Neon DB.
* **Secure Token Handshaking:** Crafted a highly resilient token verification pipeline inside `AuthService` using manual `TokenValidationParameters` to safely parse expired access payloads for secure session token rotation.
* **Strict Build Compliance:** Resolved intricate compilation and type inheritance bugs across standard Shadcn UI primitive abstractions by restructuring explicit React compiler tokens (`ComponentProps`, `ReactNode`).
* **Reactive UI Syncing:** Coupled relational tracking indices to real-time event loops using a unified Zustand and SignalR synchronization infrastructure.

