```markdown
# Krishi Khata Frontend PWA

A mobile-first, production-ready Progressive Web Application engineered to deliver accessible digital ledger accounting, real-time market insights, and localized AI agricultural assistance to Indian farmers. This application is optimized for low-bandwidth rural connectivity, featuring an intuitive, bilingual design system that operates seamlessly across all modern screen footprints.

The client layer is compiled via Vite and deployed on **Vercel**.

---

## 🏗️ Core Engineering Highlights & Added Features

### 1. Bilingual Display Isolation Layer (i18n Integration)
*   **Decoupled State Architecture:** Implemented `i18next` and `react-i18next` to extract over 70+ user-facing strings across all modular pages. 
*   **Database-Safe Translation Map:** To protect data integrity, underlying backend database enumerations (e.g., categories like `'seeds'`, `'fertilizer'`, `'pesticide'`) remain strictly uniform in English. The frontend intercepts these strings and dynamically renders them via runtime translation hooks: `t('khata.categories.seeds')`. This protects analytical metrics and database filtering from data corruption when switching dialects.
*   **Farmer-Centric Vocabulary:** Translations discard overly formal, hyper-academic terms in favor of conversational, regionally accurate terminology (e.g., utilizing "मंडी भाव" for market price metrics and "भारी बारिश" for weather conditions).

### 2. Searchable Combobox Dropdowns & Quick-Select Hub
*   **Eliminating Typing Friction:** Replaced free-text entry parameters in the Mandi price tracker with interactive, searchable Combobox dropdown components. It fetches deduplicated, pre-sorted, and alphabetized indices dynamically from the server metadata endpoints to prevent spelling validation mismatches.
*   **Active Crop Context Binding:** Introduced a responsive **Quick-Select Crop Hub** right above the data visualization metrics. This layout automatically surfaces interactive shortcut badges of the farmer's currently sown active crops next to standard regional baselines. Clicking a crop chip instantly hooks into local state parameters, auto-populating search parameters and triggering TanStack Query refetches to render historical `recharts` trends.

### 3. Dynamic Protocol-Swapped WebSockets with Auth
*   **Automatic Environment Parsing:** Upgraded the real-time "Kisan Chaupal" community chat gateway to dynamically map server host addresses from environment parameters. It systematically transforms HTTP protocols into synchronous WebSockets (`http://` to `ws://` and `https://` to `wss://`) automatically across development and production builds.
*   **Authenticated Handshakes:** The connection setup securely isolates the active user's JWT credentials from local application contexts and appends them cleanly as encrypted query string segments (`?token=${token}`). This allows the client to seamlessly bypass strict state validation layers enforced by backend socket firewalls.

### 4. Native Runtime Locale-Aware Formatting
*   **Zero-Dependency Date Management:** Eradicated heavy string parsing packages by integrating the browser's native `Intl.DateTimeFormat` API into global utility layers. 
*   **Localized Context Refreshes:** Formatting utilities natively ingest the current active `i18n.language` status to toggle the display layout, immediately translating temporal benchmarks (e.g., transforming "31 May 2026" seamlessly into "31 मई 2026" inside Hindi render loops).

### 5. Production Routing Fixes (`vercel.json`)
*   **SPA Rewrite Architecture:** Embedded dedicated fallback rules to resolve deep-linking disruptions typical of client-side routing setups. The server forces all fallback navigation records directly back into the entry path (`index.html`), allowing React Router to maintain structural layout states upon hard browser reloads without dropping users into `404: NOT_FOUND` errors.

---

## 🛠️ Technology Stack

*   **Core Build Layer:** React, Vite Execution Engine
*   **State Hydration & Fetching:** React Context API, TanStack Query (React Query)
*   **Application Routing Router:** React Router
*   **Style Framework:** Tailwind CSS with fluid custom variables
*   **Data Visualization Engine:** Recharts (Optimized Vector Layouts)
*   **Internationalization:** `i18next`, `react-i18next`, `i18next-browser-languagedetector`
*   **Asset Management Gateway:** Axios interceptor configurations

---

## ⚙️ Installation & Workspace Setup

### Step 1: Clone and Navigate
```bash
cd agroo/client

```

### Step 2: Synchronize Target Dependencies

```bash
npm install

```

### Step 3: Configure Environment Manifests

Create an explicit configuration instance within a `.env` file located inside the root of the client folder:

```env
# Path to the active backend FastAPI microservice
VITE_API_BASE_URL=[https://your-krishi-khata-backend.onrender.com](https://your-krishi-khata-backend.onrender.com)
# For local environment operations swap to: http://localhost:8001

```

---

## 🚀 Serving and Compiling the App

### Launch Local Development Server

```bash
npm run dev

```

The application spins up locally on `http://localhost:5173`.

### Compile Minimalist Production Bundle

```bash
npm run build

```

This routine triggers asset optimizations and generates server-ready static bundles inside the `dist/` workspace directory.

---

## 📁 Updated Structural Folder Blueprint

```text
client/
├── public/                 # Static global metadata configurations and PWA manifest layouts
│   └── locales/            # Structured localization assets split across languages
│       ├── en/             # Key value dictionary translations for English interfaces
│       └── hi/             # Colloquial farmer-adapted Devanagari script translations
├── src/
│   ├── components/         # Reusable structural components (Combobox, Modals, Empty State layouts)
│   ├── context/            # React Context providers monitoring core metrics (ActiveFarm, Language states)
│   ├── features/           # Scoped business domain implementations (khata, crops, dashboard)
│   ├── hooks/              # Global extraction mechanisms (useGhostAuth, useWebSocket wrappers)
│   ├── pages/              # Main route component engines (DashboardPage, MandiDashboard, KhataPage)
│   ├── App.jsx             # Main routing gateways and baseline authentication validation layout
│   ├── i18n.js             # Centralized i18next engine bootstrapping and initialization controls
│   ├── main.jsx            # Top-level React mount lifecycle point
│   └── index.css           # Global core design configurations and Tailwind variable declarations
├── vercel.json             # Single Page Application routing rewrite configurations
└── vite.config.js          # Optimization compilation rules and caching layers

```

---

## 📄 Licensing & Security Context

This frontend source mapping, utility framework, and layout configuration are proprietary and confidential. Any unauthorized extraction, modification, or tracking across production proxies without prior agreement is strictly prohibited.

```

```
