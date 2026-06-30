# JanAushadhi Smart Medicine – Developer Guide

**Project:** Smart Medicine Availability & Intelligent Janaushadhi Recommendation System  
**Stack:** React 18 · Vite 5 · Tailwind CSS 3 · React Router DOM 6 · Axios · React Icons · Leaflet  
**Future Backend:** FastAPI · MongoDB · JWT Authentication

---

## Table of Contents

1. [Quick Start](#1-quick-start)
2. [Folder Structure](#2-folder-structure)
3. [Environment Configuration](#3-environment-configuration)
4. [Service Architecture](#4-service-architecture)
5. [API Integration Guide](#5-api-integration-guide)
6. [Mock Data Usage](#6-mock-data-usage)
7. [Authentication Flow](#7-authentication-flow)
8. [Route Protection](#8-route-protection)
9. [State Management](#9-state-management)
10. [FastAPI Connection Points](#10-fastapi-connection-points)
11. [Testing Guide](#11-testing-guide)
12. [Known Limitations & Recommendations](#12-known-limitations--recommendations)

---

## 1. Quick Start

```bash
# Install dependencies
npm install

# Start development server (mock mode)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

Development server runs at: **http://localhost:5173**

**Demo credentials:**
| Role | Email | Password |
|---|---|---|
| User | user@demo.com | Demo@1234 |
| Pharmacy Owner | pharmacy@demo.com | Demo@1234 |
| Admin | admin@demo.com | Demo@1234 |
| Mock OTP | — | 123456 |

---

## 2. Folder Structure

```
src/
├── App.jsx                    # Root – provider tree
├── main.jsx                   # ReactDOM entry point
│
├── components/
│   ├── common/                # Reusable UI primitives
│   │   ├── Button.jsx         # 5 variants, loading state, icons
│   │   ├── Input.jsx          # Accessible labelled input
│   │   ├── Modal.jsx          # Focus-trapped dialog
│   │   ├── Toast.jsx          # ToastProvider + useToast hook
│   │   ├── ConfirmDialog.jsx  # Danger confirmation modal
│   │   ├── Pagination.jsx     # Accessible page navigation
│   │   ├── Breadcrumb.jsx     # Route-aware breadcrumb
│   │   ├── EmptyState.jsx     # No-data placeholder
│   │   ├── ErrorState.jsx     # Error placeholder with retry
│   │   ├── ErrorBoundary.jsx  # React error boundary
│   │   ├── Loader.jsx         # Spinner (fullscreen or inline)
│   │   ├── SkeletonLoader.jsx # Animated content placeholders
│   │   ├── SearchBar.jsx      # Debounced autocomplete search
│   │   └── ProfileDropdown.jsx# Authenticated user account menu
│   ├── dashboard/
│   │   └── DashboardCard.jsx  # Stat/metric card with trends
│   ├── layout/
│   │   ├── Navbar.jsx         # Top navigation bar
│   │   ├── Sidebar.jsx        # Role-aware dashboard sidebar
│   │   └── Footer.jsx         # Public page footer
│   ├── medicine/
│   │   └── MedicineCard.jsx   # Medicine summary card (card/list)
│   ├── notifications/
│   │   └── NotificationCard.jsx
│   └── pharmacy/
│       └── PharmacyCard.jsx
│
├── config/
│   └── constants.js           # All app-wide constants (single source of truth)
│
├── contexts/
│   ├── AuthContext.jsx        # User auth state + apiClient wiring
│   ├── ThemeContext.jsx       # Light/dark/system theme
│   ├── NotificationContext.jsx# In-app notification state
│   └── MedicineContext.jsx    # Watchlist + recent search state
│
├── layouts/
│   ├── MainLayout.jsx         # Public pages (Navbar + Footer)
│   ├── AuthLayout.jsx         # Auth pages (centred card)
│   └── DashboardLayout.jsx    # Dashboards (Navbar + Sidebar)
│
├── mocks/
│   ├── medicines.js           # Medicine catalogue mock data
│   └── userProfile.js         # Profile, settings, activity mock data
│
├── pages/
│   ├── auth/                  # Login, Register, OTP, Forgot/Reset PW
│   ├── public/                # HomePage, MedicinesPage, MedicineDetailPage
│   ├── dashboard/user/        # User dashboard modules (7 pages)
│   ├── NotFoundPage.jsx       # 404
│   └── UnauthorizedPage.jsx   # 401/403
│
├── routes/
│   ├── AppRoutes.jsx          # Full route tree (lazy-loaded)
│   ├── RouteGuard.jsx         # Redirects unauthenticated → /login
│   └── RoleGuard.jsx          # Redirects wrong-role → own dashboard
│
├── services/
│   ├── apiClient.js           # Singleton Axios instance + interceptors
│   ├── authService.js         # Auth CRUD (login, register, OTP…)
│   ├── medicineService.js     # Medicine CRUD + search
│   ├── pharmacyService.js     # Pharmacy locator + owner ops
│   ├── notificationService.js # Notification CRUD + preferences
│   ├── userService.js         # User profile + watchlist
│   ├── adminService.js        # Admin platform ops
│   └── index.js               # Barrel export
│
├── styles/
│   └── index.css              # Tailwind base + custom utilities
│
└── utils/
    └── authValidation.js      # Pure validation functions
```

---

## 3. Environment Configuration

### Files

| File | Purpose |
|---|---|
| `.env` | Shared defaults (fallback) |
| `.env.development` | Local dev – mock mode ON |
| `.env.production` | Production – real API, mock OFF |

### Variables

| Variable | Type | Description |
|---|---|---|
| `VITE_API_BASE_URL` | string | FastAPI base URL |
| `VITE_USE_MOCK` | boolean | `"true"` enables mock data |
| `VITE_MOCK_DELAY_MS` | number | Simulated API delay (ms) |
| `VITE_APP_TITLE` | string | Browser tab title |
| `VITE_APP_VERSION` | string | App version string |
| `VITE_ENABLE_DEV_TOOLS` | boolean | Enable React DevTools hints |
| `VITE_DEFAULT_SEARCH_RADIUS` | number | Default pharmacy search radius |

### Usage in code

```js
import { API_BASE_URL, USE_MOCK } from '../config/constants'
```

Never read `import.meta.env` directly — always use `constants.js`.

---

## 4. Service Architecture

All services follow this pattern:

```js
export async function myOperation(params) {
  if (USE_MOCK) {
    await delay(MOCK_DELAY_MS)   // simulate network latency
    return mockData              // return mock response
  }
  // Real FastAPI call:
  const { data } = await apiClient.post('/endpoint', params)
  return data
}
```

### apiClient.js

- Singleton Axios instance with `baseURL`, `timeout`, and `Content-Type` header.
- **Request interceptor:** attaches `Authorization: Bearer <token>` from storage.
- **Response interceptor:** handles 401 (auto-logout) and 5xx (console log + normalize).
- **Error normalizer:** converts all errors to `{ message, status, code, data }` shape.
- **Token getter pattern:** `setTokenGetter(fn)` called by `AuthContext` on mount so the interceptor always reads the freshest token without circular imports.

---

## 5. API Integration Guide

### To connect a service to FastAPI

1. Set `VITE_USE_MOCK=false` in `.env.production`
2. Set `VITE_API_BASE_URL=https://your-api.domain.com/api/v1`
3. In the service file, the real axios call is already written — just ensure the endpoint path matches your FastAPI router.

### FastAPI endpoint conventions expected

```
POST   /auth/login
POST   /auth/register
POST   /auth/send-otp
POST   /auth/verify-otp
POST   /auth/forgot-password
POST   /auth/reset-password

GET    /medicines?q=&category=&page=&pageSize=
GET    /medicines/:id
GET    /medicines/:id/alternatives
POST   /medicines               (admin/owner)
PUT    /medicines/:id           (admin/owner)

GET    /pharmacies?lat=&lng=&radius=
GET    /pharmacies/:id
POST   /pharmacies              (owner registration)
PUT    /pharmacies/:id          (owner update)
PUT    /pharmacies/:id/inventory/:medicineId

GET    /users/me
PUT    /users/me
POST   /users/me/avatar
GET    /users/me/watchlist
POST   /users/me/watchlist
DELETE /users/me/watchlist/:id

GET    /notifications
PUT    /notifications/:id/read
PUT    /notifications/read-all
DELETE /notifications/:id

GET    /admin/stats
GET    /admin/users
PUT    /admin/users/:id/status
GET    /admin/pharmacies
POST   /admin/pharmacies/:id/verify
GET    /admin/health
```

### FastAPI CORS setup needed

```python
from fastapi.middleware.cors import CORSMiddleware
app.add_middleware(CORSMiddleware,
    allow_origins=["http://localhost:5173", "https://your-frontend.com"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

## 6. Mock Data Usage

### Switching between mock and real

```bash
# Mock mode (development)
VITE_USE_MOCK=true   # in .env.development

# Real API mode (production)
VITE_USE_MOCK=false  # in .env.production
```

### Mock data files

| File | Contains |
|---|---|
| `src/mocks/medicines.js` | 12 medicines, Jan Aushadhi alternatives, categories, health tips |
| `src/mocks/userProfile.js` | Profile, settings, notification prefs, sessions, activity, notifications |
| Inline in `pharmacyService.js` | 8 mock pharmacies with lat/lng |
| Inline in `adminService.js` | 50 mock users |

### Adding new mock data

Add to the relevant mocks file. The service function checks `USE_MOCK` before
deciding which branch to take — so mock data is automatically used when the flag is on.

---

## 7. Authentication Flow

### Current (mock mode)

```
User submits login form
  → authService.login() → mock validates email/password
  → Returns { user, token }
  → AuthContext.login(user, token, rememberMe)
    → Stores in sessionStorage (default) or localStorage (rememberMe)
    → apiClient.setTokenGetter wired on mount
  → Navigate to role dashboard
```

### Future (FastAPI JWT)

```
POST /auth/login → { access_token, refresh_token, user }
  → Store access_token in sessionStorage
  → Store refresh_token in localStorage (httpOnly cookie preferred)
  → apiClient.setTokenGetter returns access_token
  → On 401: try POST /auth/refresh → new access_token
  → On refresh fail: logout + redirect /login
```

### Token storage keys (from constants.js)

| Constant | Key | Storage |
|---|---|---|
| `TOKEN_KEY` | `"auth_token"` | session/local |
| `USER_KEY` | `"auth_user"` | session/local |
| `REFRESH_TOKEN_KEY` | `"auth_refresh_token"` | localStorage |

---

## 8. Route Protection

| Route type | Guard | Behaviour |
|---|---|---|
| Public | None | Accessible to all |
| Auth pages | None (but redirects if already logged in) | /login → dashboard if authenticated |
| Protected | `RouteGuard` | → /login?redirect=… if not authenticated |
| Role-restricted | `RoleGuard` | → own dashboard or /unauthorized |

```jsx
// Adding a new protected route
<Route
  path="new-page"
  element={
    <RouteGuard>
      <RoleGuard allowedRoles={['admin']}>
        <NewPage />
      </RoleGuard>
    </RouteGuard>
  }
/>
```

---

## 9. State Management

| Context | State | Actions |
|---|---|---|
| `AuthContext` | user, token, role, isAuthenticated, isLoading | login, logout, updateUser |
| `ThemeContext` | theme ('light'/'dark') | toggleTheme, setTheme |
| `NotificationContext` | notifications[], unreadCount | addNotification, markRead, markAllRead, removeNotification |
| `MedicineContext` | medicines[], watchlist[], recentSearches[] | toggleWatchlist, addRecentSearch, clearRecentSearches |
| `ToastProvider` | (internal) | useToast().toast(message, { variant }) |

All contexts are pure React `useReducer` — no Redux, no Zustand.

---

## 10. FastAPI Connection Points

### Step-by-step migration

1. **Backend ready:** FastAPI server running at `http://localhost:8000`
2. **Set env:** `VITE_USE_MOCK=false` and `VITE_API_BASE_URL=http://localhost:8000/api/v1`
3. **JWT tokens:** Update `AuthContext.login()` to store real tokens from FastAPI response
4. **Refresh logic:** Add refresh token interceptor to `apiClient.js` (stub already present)
5. **Test each service:** Each service file has the real axios call already written — just verify the endpoint path matches your router
6. **Push notifications:** Implement `NotificationService.requestPushPermission()` using Web Notifications API

### No frontend code changes needed for

- Search/filter logic (UI-side) — works identically with real API
- Watchlist toggle — just swap `MedicineContext` state sync with `userService.addToWatchlist()`
- Notification marking — `notificationService.markNotificationRead()` is already written
- Form validation — all validation is frontend-only (`authValidation.js`)

---

## 11. Testing Guide

### Running the project

```bash
npm install          # install dependencies
npm run dev          # start dev server → http://localhost:5173
npm run build        # production build
npm run preview      # preview production build → http://localhost:4173
```

### Manual testing checklist

| Page | Test | Expected |
|---|---|---|
| Home | Load / | Hero section, search bar, features, stats visible |
| Home | Search "Paracetamol" | Navigates to /medicines?q=Paracetamol |
| Login | Submit user@demo.com / Demo@1234 | Redirects to /dashboard/user |
| Login | Wrong password | Inline "Invalid email or password." error |
| Register | Empty form submit | All field errors shown |
| Register | Valid data | Redirects to /verify-otp |
| OTP | Enter 123456 | Redirects to /dashboard/user |
| OTP | Wrong OTP | Error message shown |
| Forgot PW | Any email | Success message shown |
| Medicines | Search "Metformin" | Shows filtered results |
| Medicines | Filter by Antidiabetics | Shows only antidiabetics |
| Medicines | Toggle list layout | Cards become list rows |
| Medicine Detail | Click Metformin 500mg | Shows detail, price comparison, alternatives |
| Medicine Detail | Add to Watchlist | Heart turns red, Toast shown |
| Medicine Detail | Click "Why this recommendation?" | Modal opens with explanation |
| User Dashboard | Log in as user@demo.com | Welcome banner, stats, quick actions visible |
| Watchlist | Remove a medicine | ConfirmDialog appears, removes on confirm |
| Notifications | Mark all as read | Badge resets to 0 |
| Profile | Edit and save | Toast "Profile updated successfully" |
| Settings | Toggle dark mode | Page switches to dark theme |
| Activity | Filter by Searches | Only search activities shown |
| Pharmacy Owner | Log in as pharmacy@demo.com | Placeholder dashboard shown |
| Admin | Log in as admin@demo.com | Placeholder dashboard shown |
| 404 | Navigate to /xyz | NotFoundPage shown |
| Unauthorised | User accessing /dashboard/admin | Redirects to /dashboard/user |

### Browser compatibility

Test on: Chrome 120+ · Firefox 120+ · Edge 120+ · Safari 17+ (mobile)

### Responsive breakpoints

| Label | Width | Layout |
|---|---|---|
| Mobile | 320–639 px | Single column, hamburger nav |
| Tablet | 640–1023 px | 2 columns, condensed sidebar |
| Laptop | 1024–1279 px | 3 columns, persistent sidebar |
| Desktop | 1280 px+ | Full multi-column layout |

### Console verification checklist

- [ ] No `console.error` messages
- [ ] No React `key` prop warnings
- [ ] No missing module errors
- [ ] No hook rules violations
- [ ] Network tab: no failed requests in mock mode

---

## 12. Known Limitations & Recommendations

### Not yet implemented (placeholders)

| Module | Route | Status |
|---|---|---|
| Pharmacy Locator | /pharmacy-locator | Placeholder — awaiting Leaflet integration |
| Pharmacy Owner Dashboard | /dashboard/owner/* | Placeholder — Phase 10 scope |
| Admin Dashboard | /dashboard/admin/* | Placeholder — Phase 11 scope |
| About / Contact / FAQs | Static pages | Placeholder — content needed |

### Recommendations before backend integration

1. **Refresh token interceptor** — add silent refresh logic to `apiClient.js` to avoid forcing re-login on every tab switch.
2. **httpOnly cookies** — for production JWT, store `access_token` in an httpOnly cookie (managed by the FastAPI server) instead of localStorage for XSS protection.
3. **Input sanitisation** — although frontend validation is in place, ensure FastAPI validates all inputs server-side as well.
4. **Watchlist persistence** — current watchlist is in-memory (React state). Before backend integration, add localStorage fallback or sync with `/users/me/watchlist` on login.
5. **Image upload** — avatar upload is a FileReader preview only. Wire `userService.uploadAvatar()` to a multipart FastAPI endpoint.
6. **Leaflet bundle** — ensure Leaflet CSS is imported before the map renders to avoid marker icon issues.
7. **Bundle size** — `authService.js` chunk includes mock Axios at ~49 kB. In production mode this will shrink as mock branches are tree-shaken.
8. **Error boundary** — consider adding per-route error boundaries in addition to the top-level one to limit blast radius.
