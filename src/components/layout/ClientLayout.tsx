"use client";

import React, { useEffect, useRef, useState } from "react";
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
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const sidebarRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!isSidebarOpen) return;
    const sidebar = sidebarRef.current;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    sidebar?.querySelector<HTMLElement>("button, a[href]")?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setIsSidebarOpen(false);
      }
      if (event.key !== "Tab" || !sidebar) return;
      const focusable = Array.from(sidebar.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'));
      if (!focusable.length) return;
      const first = focusable[0], last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    const onResize = () => { if (window.innerWidth >= 1024) setIsSidebarOpen(false); };
    document.addEventListener("keydown", onKeyDown);
    window.addEventListener("resize", onResize);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("resize", onResize);
      if (window.innerWidth < 1024) menuButtonRef.current?.focus();
    };
  }, [isSidebarOpen]);

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
            <Header menuButtonRef={menuButtonRef} isSidebarOpen={isSidebarOpen} onMenuClick={() => setIsSidebarOpen((open) => !open)} />
            <div className="flex min-h-[calc(100vh-73px)]">
              <Sidebar sidebarRef={sidebarRef} isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
              <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
            </div>
            <Footer />
          </div>
        </ProtectedRoute>
      )}
    </AuthProvider>
  );
}
