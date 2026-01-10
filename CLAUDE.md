# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

OrderEase (订单管理系统) is a Vue 3 admin dashboard for a food delivery order management system. It supports two user roles: **Admin** (full access) and **Shop Owner** (shop-scoped access).

**Tech Stack**: Vue 3 (Composition API) + Vite + Element Plus + Pinia + Axios

## Development Commands

```bash
# Development server (runs on http://0.0.0.0:3000)
npm run dev

# Production build
npm run build

# Preview production build
npm run preview
```

## Environment Configuration

The `.env` file in the project root configures the API:

```bash
VITE_API_BASE_URL=http://127.0.0.1:8080
VITE_API_PREFIX=/api/order-ease/v1
```

All API requests are proxied during development via `vite.config.js`.

## Base Path

The application is deployed at `/order-ease-adminiui/` base path. This is configured in:
- `vite.config.js`: `base: '/order-ease-adminiui/'`
- `src/router/index.js`: `createWebHistory('/order-ease-adminiui/')`

## Architecture

### Directory Structure

```
src/
├── api/              # API service modules (auth, order, product, shop, tag, user)
├── components/       # Reusable Vue components (organized by domain)
├── config/           # Configuration exports (API_BASE_URL, API_PREFIX, API_TIMEOUT)
├── layout/           # Main layout component with sidebar navigation
├── router/           # Vue Router configuration with auth guards
├── utils/            # Utilities (request.js, auth.js, orderStatus.js)
├── views/            # Page-level components (login, order, product, shop, tag, user, migration)
├── App.vue           # Root component with SSE integration
└── main.js           # Entry point
```

### Request Handling Pattern (`src/utils/request.js`)

The axios instance has sophisticated interceptors:

1. **Token Management**: JWT auto-attach, refresh before expiry (10min threshold), request queuing during refresh, 401 auto-retry
2. **Shop ID Injection**: Automatically injects `shop_id` from localStorage into:
   - Request body (for JSON requests with body data)
   - Query params (for FormData or requests without body)
   - Skips if `shop_id` already present in body/params
3. **Role-based Paths**: API functions append `/admin/` or `/shopOwner/` based on user role

### Authentication Flow

- JWT-based with token + refresh token pattern
- CAPTCHA verification (canvas-based, 4-char random rotation)
- Password requirements: 8+ chars, uppercase, lowercase, number, special char (@#$%^&*)
- Auto-refresh 10 minutes before token expiry
- User info stored in `localStorage.getItem('admin')`

### State Management

- **Pinia**: Initialized but minimal usage
- **Primary**: localStorage for auth state and current shop context
  - `admin`: { token, refreshToken, role, ... }
  - `currentShopId`: number (selected shop)
  - `migration_switch`: '0' or '1' (hidden feature toggle)

### Real-time Communication (SSE)

Implemented in `App.vue`:
- Uses `event-source-polyfill` for Server-Sent Events
- Listens for `new_order` events
- Auto-reconnects on disconnect (5s delay)
- Shop-specific connections via `shop_id` query param
- Token-based authentication via headers
- Dispatches `new-order-received` custom event for order page refresh

### Order Status Management

Dynamic per-shop status workflows configured via `src/utils/orderStatus.js`:
- Default flow: Pending (0) -> Accepted (1) -> Complete (10) / Cancelled (11)
- Each shop can customize allowed state transitions
- Status-specific styling (warning/primary/success/info)

### Route Structure

**Public**: `/login`

**Protected** (nested under layout):
- `/user` - User management (admin only)
- `/order` - Order management with tabs
- `/order/:id` - Order details
- `/product` - Product management
- `/product/:id` - Product details
- `/shop` - Shop management (admin only)
- `/shop/:id` - Shop details with status flow config
- `/tag` - Tag management
- `/tag/:id` - Tag details with product binding
- `/migration` - Data migration (hidden feature)

**Route Guards**:
- Auth check via `localStorage.getItem('admin')`
- Role-based redirect (admin -> /shop, shop owner -> /order)
- Auto-redirect logged-in users from login page

### Component Patterns

All components use:
- `<script setup>` syntax (Composition API)
- `ref()` and `reactive()` for reactivity
- Element Plus for UI components
- Props for data passing, emits for events

Key reusable components:
- `ProductForm.vue` - Product CRUD with option categories
- `ShopForm.vue` - Shop CRUD with owner account
- `OrderForm.vue` - Order creation/editing
- `OrderStatusFlow.vue` - Status workflow configuration
- `SmartImage.vue` - Image with error handling

### Hidden Features

Data Migration feature is controlled by `localStorage`:
- Enable: `localStorage.setItem('migration_switch', '1')`
- Disable: `localStorage.setItem('migration_switch', '0')`
- The layout component checks this to conditionally show the menu item

### Docker Deployment

- `Dockerfile`: Multi-stage build (Node.js -> Nginx)
- `docker-compose.yaml`: Single service, port 3000:80
- Deploy path: `/usr/share/nginx/html/order-ease-adminiui/`

## API Module Structure

Each API module exports functions that:
1. Check user role via `isAdminRole()` from `src/utils/auth.js`
2. Append `/admin/` or `/shopOwner/` to the endpoint
3. Use the shared axios instance from `src/utils/request.js`
4. Return response data directly (interceptor unwraps)

Example: `src/api/order.js` -> `getOrderList()`, `createOrder()`, `toggleOrderStatus()`, etc.
