"use client";

import React from "react";
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
  const isLoginPage = pathname === "/login" || pathname === "/admin/login";

  return (
    <AuthProvider>
      {isLoginPage ? (
        // Login page - no sidebar/header
        <>{children}</>
      ) : (
        // Protected pages with admin layout
        <ProtectedRoute>
          <div className="flex flex-col min-h-screen">
            <Header />
            <div className="flex flex-1">
              <Sidebar />
              <main className="flex-1 p-6 bg-gray-50">{children}</main>
            </div>
            <Footer />
          </div>
        </ProtectedRoute>
      )}
    </AuthProvider>
  );
}
