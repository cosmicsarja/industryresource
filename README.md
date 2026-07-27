# IndustryResource

IndustryResource is India's multi-city industrial marketplace, connecting customers with verified vendors and workshops instantly. This platform allows customers to browse vendors by category, capability, and zone, and securely connect with them directly—with built-in multi-lingual support.

## 🚀 Features

- **Hyper-Local Precision:** Find industrial workshops in specific zones within your city.
- **Vendor Profiles:** Browse verified listings featuring workshop details, ratings, and capabilities.
- **Machine & Material Search:** Find exactly what you need by searching for specific machine capabilities or material listings.
- **Direct WhatsApp Connect:** Instantly chat with vendors directly; no middlemen.
- **Multi-lingual Support:** First-class support for English, Kannada (ಕನ್ನಡ), Hindi (हिंदी), and Marathi (मराठी).
- **Vendor Dashboard:** Vendors can list their business, manage their profiles, and upgrade subscription plans.

## 🛠️ Tech Stack

This project is built with modern, performant web technologies:

- **Framework:** React 19 + [Vite](https://vitejs.dev/)
- **Routing & SSR:** [TanStack Router](https://tanstack.com/router/latest) & [TanStack Start](https://tanstack.com/start/latest)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/)
- **UI Components:** [shadcn/ui](https://ui.shadcn.com/) (built on Radix UI primitives)
- **Backend & Auth:** [Supabase](https://supabase.com/)
- **Forms & Validation:** React Hook Form + Zod

## 📦 Getting Started

### Prerequisites

- Node.js (v18+)
- npm or bun

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/cosmicsarja/industryresource.git
   cd industryresource
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   bun install
   ```

3. **Environment Setup**
   Copy the example environment file and configure your Supabase keys:
   ```bash
   cp .env.example .env
   ```
   Ensure you add your `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.

### Running the Development Server

Start the Vite development server:
```bash
npm run dev
```
The application will be available at `http://localhost:5173`.

### Building for Production

To create a production build:
```bash
npm run build
```

To preview the production build locally:
```bash
npm run preview
```

## 📂 Project Structure

- `src/components/` - Reusable UI components (including shadcn/ui).
- `src/routes/` - TanStack Router page components and layouts.
- `src/lib/` - Utility functions, configurations, and i18n logic.
- `src/integrations/supabase/` - Supabase client initialization and types.
- `src/hooks/` - Custom React hooks.

## 🌍 Internationalization (i18n)

The platform supports multiple languages. Language configurations and translation dictionaries are located in `src/lib/i18n.tsx`. 
Currently supported:
- `en` (English)
- `kn` (Kannada)
- `hi` (Hindi)
- `mr` (Marathi)

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](https://github.com/cosmicsarja/industryresource/issues).

## 📄 License

This project is licensed
