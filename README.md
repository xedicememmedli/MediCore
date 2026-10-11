# MediCore - Clinic Management System API

A modular and scalable Web API built with **.NET 8** using **Clean Architecture** and **SOLID** principles. Designed for clinic management, featuring real-time communication, automated background processing, AI integration, and third-party services.

---

## Architecture & Layering

The solution follows a strict separation of concerns:

- **`MediCore.Core`** — Domain entities (`AppUser`, etc.), Enums, Interfaces, and Core domain abstractions.
- **`MediCore.Business`** — Business logic, Application services, DTOs, Mappings, and Validations.
- **`MediCore.DAL`** — Data Access Layer powered by EF Core, Repository pattern, and Migrations.
- **`MediCore.API`** — REST Controllers, Custom Middlewares, SignalR Hubs, Hangfire Jobs, and Swagger configuration.

---

## Tech Stack & Integrations

- **Framework:** .NET 8 Web API
- **Database & Persistence:** SQL Server, Entity Framework Core, LINQ
- **Security & Auth:** ASP.NET Core Identity, JWT Bearer Auth (with WebSocket Query String handling for SignalR)
- **Real-Time Communication:** ASP.NET Core SignalR (`ChatHub`, `NotificationHub`)
- **Background Processing:** Hangfire (SQL Server Storage)
- **AI Integration:** Google Gemini AI API
- **Document & Media Storage:** Cloudinary API
- **PDF Generation:** QuestPDF (Community License)
- **Payment Gateway:** Stripe API
- **Email Service:** SMTP Mail Integration (`MailSettings`)
- **Documentation:** Swagger / OpenAPI with JWT Authorization scheme

---

## Automated Background Jobs (Hangfire)

- **`MedicineExpirationJob`:** Daily check for expired medications in stock.
- **`BasketCleanupJob`:** Daily cleanup of abandoned/expired user baskets.
- **`ConsultationReminderJob`:** Scheduled daily appointment reminders sent at 08:00 AM.
- **`WeeklyReportJob`:** Automated weekly financial and system reports generated every Sunday at 23:55.

---

## Key Features & System Capabilities

- **Role-Based Access Control:** ASP.NET Core Identity with automated DB startup seeding (`RoleSeeder`).
- **Real-Time Chat & Alerts:** WebSockets-based live chat (`/chathub`) and notification push (`/notificationHub`).
- **Exception Handling:** Centralized `GlobalExceptionMiddleware` for uniform error responses.
- **Document & Billing Processing:** Automated PDF invoice creation via QuestPDF, Cloudinary image management, and Stripe online payments.

---

## Getting Started

### Prerequisites
- [.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)
- SQL Server

### Configuration
Configure your credentials in `MediCore.API/appsettings.json`:
```json
{
  "ConnectionStrings": { "Default": "YOUR_SQL_SERVER_CONNECTION_STRING" },
  "Jwt": {
    "Issuer": "...",
    "Audience": "...",
    "SecurityKey": "..."
  },
  "MailSettings": { "Email": "...", "Password": "..." },
  "CloudinarySettings": { "CloudName": "...", "ApiKey": "...", "ApiSecret": "..." },
  "Stripe": { "ApiKey": "..." },
  "GeminiAI": { "ApiKey": "..." }
}
```

### Run Application
1. Apply migrations and seed roles:
   ```bash
   dotnet ef database update --project MediCore.DAL --startup-project MediCore.API
   ```
2. Start the API:
   ```bash
   dotnet run --project MediCore.API
   ```
