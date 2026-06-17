"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

// Get user role from localStorage (for dev/testing) or cookies
function getUserRole(): string | null {
  try {
    if (typeof window !== "undefined") {
      // Try localStorage first (for dev testing)
      const stored = localStorage.getItem("admin_role");
      if (stored) return stored;

      // Try from cookies
      const cookies = document.cookie.split(";").map((c) => c.trim());
      const roleCookie = cookies.find((c) => c.startsWith("admin_role="));
      if (roleCookie) return decodeURIComponent(roleCookie.split("=")[1]);
    }
  } catch (e) {
    // ignore
  }
  return null;
}

export default function AuthGuard({
  children,
  allowedRoles,
}: {
  children: React.ReactNode;
  allowedRoles: string[];
}) {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const role = getUserRole();
    if (!role) {
      console.warn(
        'No auth role found. For testing, set: localStorage.setItem("admin_role", "ADMIN")',
      );
      // In production, redirect to login. For testing, allow bypass
      if (process.env.NODE_ENV === "production") {
        router.push("/");
        return;
      }
      // Dev mode: warn but don't redirect yet
      setReady(true);
      setAuthorized(false);
      return;
    }
    setAuthorized(allowedRoles.includes(role));
    setReady(true);
  }, [allowedRoles, router]);

  if (!ready) return <div className="p-4">Checking permissions...</div>;
  if (!authorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="max-w-md text-center">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p className="text-muted-foreground mb-4">
            You don't have permission to access this page.
          </p>
          <div className="bg-secondary/50 border border-white/[0.06] rounded-xl p-4 text-sm text-left mb-4">
            <p className="font-mono text-xs mb-2">For testing, run in browser console:</p>
            <code className="text-emerald-400">localStorage.setItem('admin_role', 'ADMIN')</code>
            <p className="text-xs text-muted-foreground mt-2">Then refresh the page</p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors">
            Reload Page
          </button>
        </div>
      </div>
    );
  }
  return <>{children}</>;
}
