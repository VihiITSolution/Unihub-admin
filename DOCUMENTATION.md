# Unihub.lk Admin Panel

A modern, responsive admin panel for managing the Unihub.lk platform built with Next.js 14, TypeScript, and Tailwind CSS.

## Features

- 🎨 Modern and clean UI with Tailwind CSS
- 📱 Fully responsive design
- 🔐 Role-based access control ready
- 📊 Dashboard with analytics and statistics
- 👥 User management
- 🏫 University management
- 📚 Course management
- 📈 Analytics and reporting
- ⚙️ Settings and configuration

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **UI Components:** Custom components built with Tailwind

## Project Structure

```
src/
├── app/                      # Next.js app directory (App Router)
│   ├── layout.tsx           # Root layout with Header, Sidebar, Footer
│   ├── page.tsx             # Dashboard page (homepage)
│   ├── users/               # Users management pages
│   ├── universities/        # Universities management pages
│   ├── courses/             # Courses management pages
│   ├── analytics/           # Analytics and reports pages
│   └── settings/            # Settings pages
│
├── components/              # Reusable React components
│   ├── layout/             # Layout components
│   │   ├── Header.tsx      # Top navigation header
│   │   ├── Sidebar.tsx     # Side navigation menu
│   │   └── Footer.tsx      # Footer component
│   └── ui/                 # UI components
│       ├── Button.tsx      # Button component with variants
│       ├── Card.tsx        # Card container component
│       ├── Table.tsx       # Data table component
│       └── StatCard.tsx    # Statistics card for dashboard
│
├── constants/              # Application constants
│   └── index.ts           # Routes, roles, status constants
│
├── hooks/                 # Custom React hooks (empty for now)
│
├── lib/                   # Library code and configurations (empty for now)
│
├── styles/               # Global styles
│   └── globals.css      # Tailwind CSS imports and global styles
│
├── types/               # TypeScript type definitions
│   └── index.ts        # Common interfaces and types
│
└── utils/              # Utility functions
    └── helpers.ts     # Helper functions for formatting, etc.
```

## Getting Started

### Prerequisites

- Node.js 18.x or higher
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd Unihub-admin
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build the production application
- `npm run start` - Start the production server
- `npm run lint` - Run ESLint to check code quality

## Folder Structure Explanation

### `/app` Directory
Contains all pages and routes using Next.js App Router. Each folder represents a route, and `page.tsx` files define the page content.

### `/components` Directory
Reusable React components organized by function:
- **layout/**: Components that form the app structure (Header, Sidebar, Footer)
- **ui/**: Reusable UI components (Buttons, Cards, Tables, etc.)

### `/constants` Directory
Application-wide constants like routes, user roles, and status values.

### `/types` Directory
TypeScript type definitions and interfaces for type safety.

### `/utils` Directory
Utility functions for common tasks like date formatting, string manipulation, etc.

### `/hooks` Directory
Custom React hooks for reusable logic (currently empty, ready for future additions).

### `/lib` Directory
Configuration files and third-party library setups (currently empty, ready for API clients, etc.).

## Pages Overview

1. **Dashboard (/)** - Main overview with statistics and recent activities
2. **Users (/users)** - Manage registered users
3. **Universities (/universities)** - Manage university listings
4. **Courses (/courses)** - Manage available courses
5. **Analytics (/analytics)** - View platform analytics and insights
6. **Settings (/settings)** - Configure application settings

## Customization

### Colors
Primary colors can be customized in `tailwind.config.ts` under the `theme.extend.colors.primary` section.

### Components
All UI components in `/components/ui` are designed to be customizable through props and Tailwind classes.

## Future Enhancements

- [ ] Add authentication and authorization
- [ ] Integrate with backend API
- [ ] Add form validation
- [ ] Implement data fetching and state management
- [ ] Add charts and visualization libraries
- [ ] Implement search and filtering
- [ ] Add pagination
- [ ] Implement CRUD operations
- [ ] Add toast notifications
- [ ] Implement file upload functionality

## Contributing

Please read CONTRIBUTING.md for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the ISC License.
