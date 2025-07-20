# 1stlab MCP Admin Panel

A React + TypeScript admin panel for managing the 1stlab MCP directory.

## Features

- 🔐 Secure login with environment variable password
- 📊 Dashboard with overview statistics
- 📁 Project management (approve, reject, feature)
- 🏷️ Category management
- 📱 Responsive design for mobile devices
- 🔗 Integration with 1stlab-mcp Supabase backend

## Setup

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Environment Configuration:**
   
   Copy `.env.example` to `.env` and configure:
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with your values:
   ```
   VITE_ADMIN_PASSWORD=your-secure-admin-password
   VITE_SUPABASE_URL=your-supabase-url
   VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

The admin panel will be available at `http://localhost:5173`.

## Usage

### Login
- Navigate to `/login`
- Enter the password set in `VITE_ADMIN_PASSWORD`

### Managing Projects
- **Dashboard**: Overview of project statistics
- **Projects**: View, approve, reject, or feature submitted projects
- **Categories**: Manage project categories

## Development

### Project Structure
```
src/
├── contexts/          # React contexts
├── layouts/           # Layout components
├── pages/             # Page components
├── services/          # API services
├── types/             # TypeScript types
├── App.tsx            # Main application component
└── main.tsx           # Entry point
```

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Security

- **Authentication**: Protected routes require login
- **Password**: Configured via environment variable
- **Session**: Stored in localStorage
EOF < /dev/null