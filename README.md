# Krishi Khata PWA (Frontend)

A mobile-first, high-performance Progressive Web Application designed specifically for Indian farmers. Krishi Khata (Agroo) provides an intuitive, offline-capable interface for managing farms, tracking finances (Khata), checking real-time Mandi prices, and connecting with the local farming community.

## ✨ Core Features

- **Mobile-First UX/UI:** Designed with a warm, "soil and clay" aesthetic, tailored for mobile devices with a persistent bottom navigation bar.
- **Offline-Ready PWA:** Leverages Vite PWA plugins to cache assets and provide a seamless experience even in low-connectivity rural areas.
- **Frictionless Onboarding:** "Ghost Auth" flow allowing users to enter with minimal friction (Name + PIN) while maintaining security.
- **Smart Dashboard:** Context-aware dashboard that adapts to the currently active farm, showing relevant weather, mandi prices, and quick ledger actions.
- **Digital Khata:** A robust ledger system for tracking agricultural expenses and income.
- **Chaupal (Community):** A vibrant community forum for farmers to share knowledge and media.
- **Multi-language Support:** Built with `i18next` to easily support multiple regional languages.

## 🛠️ Technology Stack

- **Framework:** React 19
- **Build Tool:** Vite
- **Styling:** Tailwind CSS v4
- **State & Data Fetching:** TanStack Query (React Query) v5
- **Routing:** React Router v7
- **Icons:** Lucide React
- **Authentication/Backend Integration:** Axios & Firebase

## 📋 Prerequisites

- Node.js (v18 or higher recommended)
- npm or yarn

## ⚙️ Installation & Setup

1. **Navigate to the frontend directory:**
   ```bash
   cd agroo/client
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Environment Configuration:**
   Create a `.env` file in the root of the `client` directory to define your API URL and any required keys:
   ```env
   VITE_API_BASE_URL=http://localhost:8001
   ```

## 🚀 Running the Application

**Development Server:**
```bash
npm run dev
```
The application will be served at `http://localhost:5173`.

**Production Build:**
```bash
npm run build
npm run preview
```

## 📁 Folder Structure

```text
client/
├── public/               # Static assets and PWA manifest
├── src/
│   ├── components/       # Reusable UI components (Modals, TopBar, Empty States)
│   ├── context/          # React Context providers (e.g., ActiveFarmContext)
│   ├── hooks/            # Custom React hooks (useGhostAuth, useFarm, etc.)
│   ├── pages/            # Main route components (Dashboard, Khata, Community, etc.)
│   ├── App.jsx           # Root layout and authentication routing gate
│   ├── main.jsx          # React entry point
│   └── index.css         # Tailwind directives and custom CSS variables
├── package.json          # Project metadata and scripts
├── vite.config.js        # Vite & PWA configuration
└── eslint.config.js      # Linting rules
```

## 🎨 Design Philosophy

The application utilizes a curated color palette inspired by nature (deep forest greens, warm stone, and clay backgrounds) to create a premium, accessible, and culturally resonant experience for farmers. Animations are kept subtle yet responsive to ensure a high-quality feel without compromising performance on lower-end devices.

## 🤝 Contributing

1. Create a feature branch (`git checkout -b feature/ui-enhancement`)
2. Commit your changes (`git commit -m 'Enhance dashboard UI'`)
3. Push to the branch (`git push origin feature/ui-enhancement`)
4. Open a Pull Request

## 📄 License

This project is proprietary and confidential.
