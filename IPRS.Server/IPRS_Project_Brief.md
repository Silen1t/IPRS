# Project Brief: Internal Procurement Request System (IPRS)
**Client:** Majd Technology Company — شركة مجد للتقنية  
**Project Type:** Internal Enterprise Web Application  
**Assigned To:** YOUA Studio (Yousef Alsaleh)  
**Stack:** React + TypeScript (Frontend) · ASP.NET Core Web API (Backend) · SQL Server (Database) · Entity Framework Core (ORM) · JWT (Authentication)  
**Expected Delivery:** Full working system with source code and deployment-ready build

---

## 1. Background & Purpose

Majd Technology Company is a mid-sized IT services firm based in Riyadh with ~200 employees across multiple departments. Currently, all internal purchase requests are handled through email chains and paper forms, causing delays, lost approvals, and zero visibility into request statuses.

The company needs a web-based system that digitizes and enforces a structured two-level approval workflow for all internal procurement requests — from an employee submitting a request, to a department manager reviewing it, to a finance officer issuing a Purchase Order (PO).

---

## 2. User Roles

There are four roles in the system. Every user has exactly one role.

| Role | Arabic Label | Description |
|---|---|---|
| `Employee` | موظف | Submits purchase requests, tracks their own requests |
| `Manager` | مدير قسم | Approves or rejects requests from their department |
| `Finance` | مسؤول مالي | Final approval level; issues PO numbers |
| `Admin` | مشرف النظام | Manages users, departments, and categories |

---

## 3. Request Lifecycle & Status Flow

A request always moves through these statuses in order. It can only move backward if rejected.

```
[DRAFT] → [PENDING_MANAGER] → [PENDING_FINANCE] → [APPROVED]
                   ↓                    ↓
               [REJECTED]           [REJECTED]
```

- **DRAFT** — Employee created the request but has not submitted it yet.
- **PENDING_MANAGER** — Submitted and waiting for the department manager.
- **PENDING_FINANCE** — Manager approved; waiting for finance.
- **APPROVED** — Finance approved and a PO number has been assigned.
- **REJECTED** — Rejected at either stage. The rejection reason is always recorded.
- **CANCELLED** — Employee cancelled their own request (only allowed when status is DRAFT or PENDING_MANAGER).

---

## 4. Business Rules

These are the rules that enforce correct behavior. They must be validated on the backend — never trust the frontend alone.

1. An employee can only submit requests for their own department.
2. A manager can only act on requests from their assigned department.
3. Only Finance can issue a PO number, and the PO number field is required when approving.
4. A request cannot be edited once it has been submitted (status ≠ DRAFT).
5. A cancelled or rejected request cannot change status again.
6. The `TotalPrice` field is always computed as `Quantity × UnitPrice` — the frontend displays it, but the backend calculates and stores it.
7. Request numbers are auto-generated in the format `PR-YYYY-NNNN` (e.g., `PR-2025-0047`), never set by the user.
8. Requests with a `TotalPrice` above **50,000 SAR** must include a written justification (the `Description` field becomes required).
9. Only the Admin can create, deactivate, or assign users. Employees cannot register themselves.

---

## 5. Functional Requirements

### 5.1 Authentication
- Login with email and password.
- JWT token returned on successful login, stored in `httpOnly` cookie or `localStorage`.
- All API routes (except `/api/auth/login`) require a valid JWT.
- Role-based access enforced on both frontend (route guards) and backend (authorization attributes).
- No self-registration. Accounts are created by Admin only.

### 5.2 Employee Features
- View a list of all their own requests with status badges and request number.
- Create a new request (starts as DRAFT).
- Edit a request while it is still in DRAFT.
- Submit a request (moves from DRAFT → PENDING_MANAGER).
- Cancel a request if it is DRAFT or PENDING_MANAGER.
- View the full detail of any of their requests, including the approval timeline.
- See in-app notifications when their request is approved or rejected.

### 5.3 Manager Features
- View a dashboard showing the count of pending requests awaiting their action.
- View a list of all requests from their department.
- View the full detail of any request in their department.
- Approve a request (with optional comment) → moves to PENDING_FINANCE.
- Reject a request (rejection reason is required) → moves to REJECTED.
- Cannot act on requests from other departments.

### 5.4 Finance Officer Features
- View a list of all requests that are in PENDING_FINANCE status.
- View a history of all previously approved or rejected requests.
- Approve a request: must enter a PO number. Request moves to APPROVED.
- Reject a request: rejection reason required. Request moves to REJECTED.

### 5.5 Admin Features
- **User Management:** Create users, assign roles, assign employees/managers to departments, deactivate accounts.
- **Department Management:** Create and edit departments, assign a manager to each department.
- **Category Management:** Create and manage purchase categories (e.g., IT Equipment, Office Supplies, Software Licenses, Maintenance).
- **Full Request View:** See all requests across all departments and statuses.
- Cannot approve or reject requests (that is not their role).

### 5.6 Notifications
- In-app notifications only (no email required for v1).
- Triggered automatically when:
  - A request is submitted (notify the department manager).
  - A request is approved by manager (notify finance + the employee).
  - A request is approved by finance (notify the employee).
  - A request is rejected at any stage (notify the employee).
- Notification shows as unread (red badge on bell icon) until the user marks it read.
- User can mark individual or all notifications as read.

### 5.7 Dashboard & Reports
- Each role sees a role-appropriate dashboard on login:
  - **Employee:** My request counts by status (Draft, Pending, Approved, Rejected).
  - **Manager:** Pending approvals count, department total spend this month.
  - **Finance:** Pending finance approvals count, total approved spend this month.
  - **Admin:** System-wide totals — total requests, total users, total departments.
- A basic report page (Admin + Finance) that allows filtering all requests by date range, status, and department, with a total spend sum.

---

## 6. Database Schema

### Table: `Users`
| Column | Type | Notes |
|---|---|---|
| `Id` | int (PK) | Auto-increment |
| `FullName` | nvarchar(100) | Required |
| `Email` | nvarchar(150) | Unique, required |
| `PasswordHash` | nvarchar(255) | BCrypt hash |
| `Role` | nvarchar(20) | Employee / Manager / Finance / Admin |
| `DepartmentId` | int (FK, nullable) | Null for Finance and Admin |
| `IsActive` | bit | Default true |
| `CreatedAt` | datetime2 | Default GETUTCDATE() |

### Table: `Departments`
| Column | Type | Notes |
|---|---|---|
| `Id` | int (PK) | Auto-increment |
| `Name` | nvarchar(100) | Required |
| `ManagerId` | int (FK → Users, nullable) | The assigned manager |
| `CreatedAt` | datetime2 | |

### Table: `Categories`
| Column | Type | Notes |
|---|---|---|
| `Id` | int (PK) | Auto-increment |
| `Name` | nvarchar(100) | e.g. "IT Equipment" |
| `IsActive` | bit | Default true |

### Table: `PurchaseRequests`
| Column | Type | Notes |
|---|---|---|
| `Id` | int (PK) | Auto-increment |
| `RequestNumber` | nvarchar(20) | e.g. PR-2025-0001, unique |
| `Title` | nvarchar(200) | Required |
| `Description` | nvarchar(1000) | Required if TotalPrice > 50,000 |
| `CategoryId` | int (FK → Categories) | Required |
| `Quantity` | int | Required, min 1 |
| `UnitPrice` | decimal(18,2) | Required, in SAR |
| `TotalPrice` | decimal(18,2) | Computed: Quantity × UnitPrice |
| `UrgencyLevel` | nvarchar(20) | Low / Medium / High / Critical |
| `Status` | nvarchar(30) | See Section 3 |
| `RequestedById` | int (FK → Users) | The employee who created it |
| `DepartmentId` | int (FK → Departments) | Department of the requester |
| `ManagerActionById` | int (FK → Users, nullable) | Who acted as manager |
| `ManagerActionAt` | datetime2 (nullable) | When manager acted |
| `ManagerNote` | nvarchar(500) (nullable) | Manager's comment or rejection reason |
| `FinanceActionById` | int (FK → Users, nullable) | Who acted as finance |
| `FinanceActionAt` | datetime2 (nullable) | When finance acted |
| `FinanceNote` | nvarchar(500) (nullable) | Finance's comment or rejection reason |
| `PurchaseOrderNumber` | nvarchar(50) (nullable) | Required when Finance approves |
| `CreatedAt` | datetime2 | |
| `UpdatedAt` | datetime2 | Updated on every status change |

### Table: `Notifications`
| Column | Type | Notes |
|---|---|---|
| `Id` | int (PK) | Auto-increment |
| `UserId` | int (FK → Users) | The recipient |
| `Message` | nvarchar(300) | e.g. "Your request PR-2025-0001 has been approved." |
| `RelatedRequestId` | int (FK → PurchaseRequests, nullable) | For linking to the request |
| `IsRead` | bit | Default false |
| `CreatedAt` | datetime2 | |

---

## 7. API Endpoints

Base URL: `/api`  
All endpoints require `Authorization: Bearer <token>` header except `/auth/login`.

### Auth
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/auth/login` | Public | Login with email + password. Returns JWT. |
| GET | `/auth/me` | All | Returns the current user's profile and role. |

### Purchase Requests
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/requests` | All | Returns requests filtered by role. Employee: own only. Manager: department only. Finance/Admin: all. Supports query params: `status`, `departmentId`, `from`, `to`. |
| GET | `/requests/{id}` | All | Full detail of a single request. |
| POST | `/requests` | Employee | Create a new request (status = DRAFT). |
| PUT | `/requests/{id}` | Employee | Edit a request. Only allowed if status = DRAFT. |
| POST | `/requests/{id}/submit` | Employee | Submit request → PENDING_MANAGER. |
| POST | `/requests/{id}/cancel` | Employee | Cancel request (DRAFT or PENDING_MANAGER only). |
| POST | `/requests/{id}/manager-approve` | Manager | Approve → PENDING_FINANCE. Body: `{ note?: string }`. |
| POST | `/requests/{id}/manager-reject` | Manager | Reject. Body: `{ note: string }` (required). |
| POST | `/requests/{id}/finance-approve` | Finance | Approve → APPROVED. Body: `{ purchaseOrderNumber: string, note?: string }`. |
| POST | `/requests/{id}/finance-reject` | Finance | Reject. Body: `{ note: string }` (required). |

### Users (Admin Only)
| Method | Endpoint | Description |
|---|---|---|
| GET | `/users` | List all users. Supports `role`, `departmentId`, `isActive` filters. |
| POST | `/users` | Create a new user. |
| PUT | `/users/{id}` | Update user info (name, role, department). |
| PATCH | `/users/{id}/deactivate` | Soft-delete: sets IsActive = false. |

### Departments (Admin Only)
| Method | Endpoint | Description |
|---|---|---|
| GET | `/departments` | List all departments (all roles can read). |
| POST | `/departments` | Create a department. |
| PUT | `/departments/{id}` | Edit department name or assigned manager. |

### Categories
| Method | Endpoint | Description |
|---|---|---|
| GET | `/categories` | List all active categories (all roles). |
| POST | `/categories` | Create category (Admin only). |
| PUT | `/categories/{id}` | Edit category (Admin only). |

### Notifications
| Method | Endpoint | Description |
|---|---|---|
| GET | `/notifications` | Current user's notifications (newest first). |
| PATCH | `/notifications/{id}/read` | Mark one as read. |
| PATCH | `/notifications/read-all` | Mark all as read. |

### Dashboard
| Method | Endpoint | Description |
|---|---|---|
| GET | `/dashboard/stats` | Role-appropriate summary stats. |
| GET | `/reports/requests` | Filterable full request report (Admin + Finance). |

---

## 8. UI Screens

### Shared Screens (All Roles)
- **Login Page** — Email + password form.
- **Dashboard** — Role-appropriate stats on login.
- **Notifications Panel** — Bell icon in navbar; dropdown with unread messages.
- **Request Detail Page** — Shows all request fields + a status timeline at the bottom showing each stage, who acted, when, and any notes.

### Employee Screens
- **My Requests** — Table of own requests with columns: Request Number, Title, Category, Total Price (SAR), Urgency, Status, Date. Clickable rows.
- **New Request Form** — Fields: Title, Category (dropdown), Quantity, Unit Price (auto-calculates Total), Urgency Level (dropdown), Description (textarea). Two buttons: Save as Draft / Submit.
- **Edit Request** — Same form, only accessible if status = DRAFT.

### Manager Screens
- **Pending Approvals** — List of department requests with status = PENDING_MANAGER. Each row has quick Approve / Reject buttons + a link to full detail.
- **Department Requests** — Full history of all department requests, all statuses.

### Finance Screens
- **Pending Finance Approvals** — List of requests with status = PENDING_FINANCE.
- **Approved Requests** — History of all Finance-approved requests with PO numbers.
- **Finance Action Modal** — When approving: required PO number input + optional note. When rejecting: required reason.

### Admin Screens
- **User Management** — Table of all users. Create/Edit user modal with: Full Name, Email, Password (create only), Role, Department. Deactivate button.
- **Department Management** — Table of departments. Create/Edit modal with: Department Name, Assigned Manager (dropdown from users with Manager role).
- **Category Management** — Simple list with add/edit.
- **All Requests** — Full system-wide request table with all filters.

---

## 9. Tech Stack & Architecture Notes

**Frontend**
- React + TypeScript
- React Router v6 for routing and role-based route guards
- Tailwind CSS for styling
- Axios for API calls
- Zustand for global state (auth user, notification count)
- React Hook Form for form handling and validation

**Backend**
- ASP.NET Core 8 Web API
- Entity Framework Core with SQL Server
- JWT Authentication (`Microsoft.AspNetCore.Authentication.JwtBearer`)
- BCrypt.Net for password hashing
- Role-based authorization using `[Authorize(Roles = "Manager")]` attributes
- AutoMapper for mapping between entities and DTOs

**Database**
- SQL Server (LocalDB for development, SQL Server Express for production)
- Code-first migrations via EF Core

**Folder Structure (Backend suggestion)**
```
/IPRS.API
  /Controllers
  /Models          ← EF Core entities
  /DTOs            ← Request/Response shapes
  /Services        ← Business logic
  /Repositories    ← Data access layer
  /Middleware      ← JWT, error handling
  /Migrations
```

**Folder Structure (Frontend suggestion)**
```
/src
  /pages           ← One folder per role
  /components      ← Shared UI components
  /services        ← Axios API calls
  /store           ← Zustand slices
  /types           ← TypeScript interfaces
  /utils           ← Helpers (formatDate, formatSAR, etc.)
```

---

## 10. Seed Data (for development & testing)

The system should include a database seeder that creates the following on first run:

| Role | Email | Password | Department |
|---|---|---|---|
| Admin | admin@majd.com | Admin@123 | — |
| Finance | finance@majd.com | Finance@123 | — |
| Manager | manager.it@majd.com | Manager@123 | IT Department |
| Manager | manager.ops@majd.com | Manager@123 | Operations |
| Employee | ahmed@majd.com | Employee@123 | IT Department |
| Employee | sara@majd.com | Employee@123 | Operations |

Seed categories: IT Equipment, Office Supplies, Software Licenses, Furniture, Maintenance & Repair, Other.

---

## 11. Out of Scope (v1)

These features are explicitly excluded from this delivery. Do not implement them.

- Email or SMS notifications (in-app only for v1).
- File/document attachments on requests.
- Multi-currency support (SAR only).
- Budget limits per department.
- Mobile application.
- Arabic UI localization (English UI only for v1).
- CEO or third approval level.
- Integration with any external ERP or accounting system.

---

## 12. Definition of Done

The project is considered complete when:

- [ ] All four roles can log in and see their correct dashboard.
- [ ] An employee can create, submit, and cancel a request.
- [ ] A manager can approve or reject a pending request from their department only.
- [ ] A finance officer can approve (with PO number) or reject a manager-approved request.
- [ ] Status changes are reflected in real time on the request detail page.
- [ ] Notifications are generated and displayed correctly for each status change.
- [ ] Admin can create users, departments, and categories.
- [ ] All business rules in Section 4 are enforced on the backend.
- [ ] The database is seeded with the accounts in Section 10.
- [ ] The application runs locally with `dotnet run` (backend) and `npm run dev` (frontend).
