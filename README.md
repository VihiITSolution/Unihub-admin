# Unihub.lk Admin Panel

A modern, responsive admin panel for managing the Unihub.lk platform built with Next.js 16, TypeScript, and Tailwind CSS.

## 🚀 Quick Start

### Prerequisites
- Node.js 18.x or higher
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone https://github.com/VihiITSolution/Unihub-admin.git
cd Unihub-admin
```

2. Install dependencies
```bash
npm install
```

3. Run the development server
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## 📦 Available Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build the production application
- `npm run start` - Start the production server

## 🏗️ Project Structure

```
src/
├── app/                    # Next.js app directory (App Router)
│   ├── layout.tsx         # Root layout with Header, Sidebar, Footer
│   ├── page.tsx           # Dashboard page
│   ├── users/             # Users management
│   ├── universities/      # Universities management
│   ├── courses/           # Courses management
│   ├── analytics/         # Analytics and reports
│   └── settings/          # Settings
├── components/
│   ├── layout/           # Layout components
│   └── ui/               # Reusable UI components
├── constants/            # Application constants
├── types/                # TypeScript type definitions
└── utils/                # Utility functions
```

## 📄 Pages

1. **Dashboard (/)** - Overview with statistics and recent activities
2. **Users (/users)** - Manage registered users
3. **Universities (/universities)** - Manage university listings
4. **Courses (/courses)** - Manage available courses
5. **Analytics (/analytics)** - Platform analytics and insights
6. **Settings (/settings)** - Application settings

## 🎨 Features

- ✨ Modern and clean UI with Tailwind CSS
- 📱 Fully responsive design
- 🎯 Type-safe with TypeScript
- 🧩 Reusable component architecture
- 🎨 Customizable theme colors
- 📊 Statistics dashboard
- 📋 Data tables with filtering
- ⚙️ Settings management

## 🛠️ Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4
- **Components:** Custom React components

## 📚 Documentation

For detailed documentation about the project structure, components, and development guidelines, see [DOCUMENTATION.md](./DOCUMENTATION.md)

## 🔒 Security

No security vulnerabilities detected (verified with CodeQL).

## 📝 License

ISC

## 👥 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

© 2026 Unihub.lk. All rights reserved.
