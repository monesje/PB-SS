# Product Requirements Document (PRD)

**Product Name:** PBA Salary Survey Portal  
**Owner:** [Your Name]  
**Status:** Draft (Ready for Bolt project scaffold)  
**Version:** 1.0

---

## 🛍️ Overview

The PBA Salary Survey Portal is a secure, interactive, web-based platform that allows HR professionals in the not-for-profit (NFP) sector to explore, compare, and benchmark salary data across 41 roles. Data is published annually and licensed through paid access. This replaces a static 160-page PDF with a dynamic user experience.

---

## 🌟 Goals

- Create a user-friendly interface for HR professionals to browse salary data by role, year, and multiple filters  
- Monetise access through role/year-based Stripe payments  
- Allow internal admins to manage access and upload new data each year  

---

## 🧑‍💼 Users & Roles

### Anonymous User

- Can access public overview pages  
- Can start to filter roles but hits a paywall before seeing specific data  
- Can create an account and purchase access  

### Customer

- Can log in via Google or email/password  
- Can view all purchased role/year data  
- Can filter and compare salaries using dynamic charts and tables  
- Can create multiple "custom roles" (see Core Features below)  

### Admin (internal)

- Must log in with email domain (e.g. `@yourorg.com`, with dev override available)  
- Can manage user entitlements manually (e.g. assign roles to teams)  
- Can upload CSV files to ingest new salary data  
- Can manage pricing, coupon codes, and Stripe product IDs  

### Team Member

- Added manually by an admin to an existing team  
- Inherits access to purchased roles/years for their team  

---

## 🔐 Authentication

- Sign-in options: Google, email/password (Supabase Auth)  
- Admin accounts restricted to specific email domains  
- Session persistence and onboarding handled via Supabase Auth  

---

## 💳 Payments & Licensing

- Stripe integration for secure payments  
- One product per **role + year**  
- Bundle product for **all roles in a given year**  
- Bundle product for **all roles in a given historical year**  
- One product per role + historical year  
- Supports coupon codes and discount logic  
- Automatically grants access upon successful payment (via webhook)  
- Sends onboarding email + PDF receipt  

### Pricing Structure

Customers must select the size of their organisation at checkout, as pricing for full-year access is tiered:

- 1 to 50 employees — **$359**  
- 51 to 100 employees — **$489**  
- Over 100 employees — **$689**  
- Commercial organisations / Consultants — **$689**

Individual roles are available for purchase at:

- **$150** per role/year  
- **$75** per role for historical years  

---

## 📦 Data Model

- Each record = a `role + year + metric + filter combination`  
- Admins upload raw data in CSV format  
- Data is versioned and tied to year of publication  
- Filters include:  
  - Sector  
  - Operating Budget  
  - Organisation Size (FTE)  
  - Location (State/Territory)  
  - Tax Status  

---

## 🪰 Core Features

### Custom Role Comparison Flow (New Primary UX)

- Logged-in users begin by selecting a **base role** from the available list (e.g. “CEO”).  
- They are prompted to **create a custom label** for their version of this role — e.g. “Operations Lead - QLD”.  
- The system **automatically appends MM/YY** and saves this as a **comparison context**.  
- Filters for this role include:  
  - Year of data  
  - Sector  
  - Org Size (FTE)  
  - Operating Budget  
  - Location  
  - Tax Status  
- All settings are saved with the role for future comparisons  
- Users can create and manage multiple custom roles  

### Organisation Onboarding Settings

- Upon first login, users provide:  
  - Operating Budget  
  - Organisation Size (FTE)  
  - Location  
  - Tax Status  
- These are used to pre-fill filter defaults  

### Data Explorer (for authenticated users)

The data explorer is the core product experience and will replicate and improve upon the PDF report structure.

#### Filters:
- Sector  
- Operating Budget  
- Organisation Size (FTE)  
- Location (State/Territory)  
- Tax Status  
- Year  

#### Output Visualisations:
- Salary Summary Cards:  
  - Median, 25th, 75th, Mean — for Base Salary and Total Rem  
- Trendline Graph (Year-on-Year)  
- Bar Charts: by Sector, Budget Band, Org Size, State, Tax Status  
- Stacked Column Charts: Breakdown of Allowances (car, phone, registration, bonuses)  
- Optional: Heatmaps of salary vs org data  

#### Comparison Features:
- Multi-role and multi-year comparison views  
- Save “My Benchmarks” views  
- Export view as PDF/image  
- Show national median as default comparator  

#### Handling Low-Response Roles:
- Flag roles with <5 entries  
- Display a warning and suppress percentile charts if needed  

#### Additional Functions:
- All comparisons and settings persist per user  
- Filters and comparisons can be exported  

### Public/Anonymous Experience

- Public welcome and foreword page  
- Key trends available without login  
- Paywall activates when comparison or filtering begins  
- Anonymous UI has its own theme  

### Team Access Model

- Admins assign additional users per org  
- Additional seats incur cost  
- Members inherit access for purchased roles  

### Admin Dashboard & Usage Tracking

- Upload CSV data per year  
- Track user-generated custom roles  
- Track filters saved, exports run, and most active roles  
- Export usage logs  
- View platform-wide metrics and analytics  

---

## 🖌️ Design System

- Tailwind + Storybook  
- Theming system supports dynamic UI styles by **pricing tier**:  
  - Each tier gets a colour scheme (e.g. teal for small orgs, gold for large, red for commercial)  
- Responsive across mobile, tablet, desktop  
- WCAG AA compliant  
- Lucide icons  

---

## ⚙️ Technical

- **Frontend:** Vite + React + TypeScript  
- **Backend:** Supabase (DB, Auth, Storage)  
- **Payments:** Stripe  
- **File Upload:** Supabase or signed S3  

---

## ✅ Done When...

- CSVs are uploaded and parsed  
- Users can pay and access only entitled roles  
- Charts and filters function with comparison views  
- Anonymous paywall gates deeper data access  
- Admins can manage roles, filters, and user access  

---

## 🗘️ Roadmap (Post-MVP)

- Multi-role comparison across different accounts  
- Year-on-year visual analysis widgets  
- Embedded feedback collection  
- Notifications for new data releases  
- Bulk purchase + invoice billing support  