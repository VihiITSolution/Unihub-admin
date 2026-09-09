"use client";

import React, { useState } from "react";
import { usePathname } from "next/navigation";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import Footer from "@/components/layout/Footer";

interface ClientLayoutProps {
  children: React.ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const isLoginPage = pathname === "/login" || pathname === "/admin/login";

  return (
    <AuthProvider>
      {isLoginPage ? (
        // Login page - no sidebar/header
        <>{children}</>
      ) : (
        // Protected pages with admin layout
        <ProtectedRoute>
          <div className="min-h-screen bg-slate-50">
            <Header onMenuClick={() => setIsSidebarOpen((open) => !open)} />
            <div className="flex min-h-[calc(100vh-73px)]">
              <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
              <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
            </div>
            <Footer />
          </div>
        </ProtectedRoute>
      )}
    </AuthProvider>
  );
}
