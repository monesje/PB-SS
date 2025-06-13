# Bolt Project Launch Prompt: PBA Salary Survey Portal

You are starting a new full-stack web project named:

🧩 **PBA Salary Survey Portal**

This is a monetised data explorer platform for HR professionals in the Australian not-for-profit sector to explore structured, filterable salary benchmarking data across 41 roles. The project replaces a PDF with an interactive, authenticated web experience. Below are the functional and technical requirements.

---

## 1. CORE FUNCTIONALITY

### 🧠 Custom Role System

- A user selects a base role (e.g. “CEO”) and creates a custom label (e.g. “2025 Strategy Lead”)
- System appends MM/YY (e.g. "(06/25)") and saves as a persistent benchmark comparison context
- Each custom role stores: base role, filters, timestamp, user ID
- Users can manage multiple custom roles

---

### 📦 Data Model

All data shown in the platform is sourced from a single uploaded CSV per year. This CSV acts as the **source of truth** for all role-based statistics, filters, metadata and comparative metrics. Bolt must construct the database schema, filtering logic, and UI views entirely based on the structure of this file.

#### 🔄 Record Structure

Each row in the CSV represents one survey response. Bolt must ingest all rows, clean nulls, and standardise values to create a filterable dataset. Each visualisation, comparison or role-specific summary is built by aggregating these rows using the following fields:

---

#### 🏢 Organisation Metadata (Core Filters)

These fields must be filterable individually or in combination in the Data Explorer:

- **Sector**  
  → `What area of the Not for Profit sector would be the most appropriate to describe your organisation?`
- **Specialisation** *(Optional)*  
  → `If selected Multidisciplinary or Other, please specify:`
- **Operating Budget**  
  → `What is your organisation’s total operating budget for this financial year?`
- **Organisation Size (FTE)**  
  → `How many employees (full time equivalent) are in your organisation?`
- **Geographic Reach**  
  → `What geographical area does your organisation cover?`
- **State/Territory**  
  → `What is the location of your organisation or the National head office?`

---

#### 👤 Respondent Demographics *(Optional but Filterable)*

- **Gender**  
  → `What is your gender?`
- **Age Group**  
  → `What is your age group?`

---

#### 🧭 Sentiment & Culture (Optional Filters)

- **Mental health support rating**  
  → `Limited mental health support or wellbeing initiatives`
- **Workplace Development Support**  
  → `I feel my organisation develops me to do my job.`
- **Likelihood to leave**  
  → `How often do you consider leaving this organisation to work somewhere else?`
- **Likelihood to leave (2025)**  
  → `How likely are you to leave your present employment in 2025?`
- **Likelihood to recommend organisation**  
  → `How likely are you to recommend this organisation to a friend seeking employment?`

---

#### 📅 Metadata

- **Year** – from file or upload metadata
- **Respondent ID** – optional
- **Upload timestamp** – auto-captured

---

#### 🧰 Ingestion Requirements

- `scripts/parse-csv.ts` must ingest and normalise the schema
- Admin dashboard must support CSV uploads
- Upload must validate columns and flag errors

---

#### 🔍 Filtering Logic

- All listed fields must be filterable individually and in combination
- Filters must persist across “My Benchmarks”
- Available in single- and multi-role views

---

### 📊 Data Explorer (Main Product Experience)

- **Filters**:  
  Sector, Operating Budget, Organisation Size (FTE), State/Territory, Tax Status, Year

- **Charts**:
  - Percentile salary cards (25th, 50th, 75th, mean)
  - Year-on-Year trendline (Base Salary)
  - Bar charts (Sector, Budget, Org Size, State, Tax)
  - Stacked column charts (Allowances: car, phone, bonus, etc.)
  - Optional heatmaps (e.g. Salary vs Org Size)

- **Comparison Features**:
  - Multi-role, multi-year
  - “My Benchmarks” with save/export
  - Export views to image/PDF
  - Compare against national median

- **Low-Response Handling**:
  - Flag roles with <5 responses
  - Suppress percentiles if needed

---

### 🧾 Access Control & Licensing

- Public access shows highlights only
- Paywall activates on first comparison/filter action

#### Licensing

- **Full Report Access** (based on org size):
  - 1–50 employees — $359
  - 51–100 employees — $489
  - Over 100 / Consultants — $689

- **Individual Role Access**:
  - $150 per role/year
  - $75 for historical roles

- Licences are permanent (not subscriptions)

---

### 👥 Auth

- Supabase Auth: Google login + email/password
- Admins gated by domain (e.g. `@yourorg.com`) with dev override

---

### 🛒 Stripe Integration

- Product SKUs:
  - Per role/year
  - Full-year bundles
  - Historical bundles
- PDF receipt + onboarding email
- Coupons supported
- Webhook: grant access on payment

---

## 2. ADMIN & USAGE

### Admin Dashboard

- Upload CSV (per year)
- Assign access to users and teams
- Track and export:
  - Custom roles created (with base role, user, timestamp)
  - Filters saved as “My Benchmarks”
  - Export/download activity
  - Most compared roles
  - Session logs
- **Manage Pricing via UI**:
  - Modify pricing tiers
  - Update per-role/year pricing
  - Trigger Stripe product updates

---

## 3. UI & UX

### Anonymous/Public Mode

- Own visual theme
- Foreword + key insights visible
- Paywall on comparison start

### Theme by Tier

- Themed colour sets per pricing tier:
  - Small: Teal
  - Medium: Purple
  - Large: Gold
  - Commercial: Red

---

## 4. TECH STACK

- **Frontend**: Vite + React + TypeScript
- **Styling**: Tailwind + Storybook + Lucide icons
- **Backend**: Supabase (Auth, DB, Storage, RLS)
- **Payments**: Stripe
- **Self-hosting**: Not required

---

## 5. INITIAL SETUP & FILES

- `.env.local` file with key validations
- `src/lib/supabase.ts` config
- `scripts/parse-csv.ts` for admin ingestion
- Components:
  - `KpiCard`, `BarChart`, `LineChart`, `Heatmap`, `FilterPanel`, `ExportButton`
- Pages:
  - `/` → Landing
  - `/compare/:roleId` → Data view
  - `/admin` → Admin dashboard

---

## 6. DELIVERABLES & COMPLETION

Bolt should scaffold:

- Project structure
- Component shells and routing
- Auth + RBAC logic
- Stripe product/webhook setup
- CSV ingestion and tracking layer

✅ End with:  
`✓ Done – see preview at <dev URL>`