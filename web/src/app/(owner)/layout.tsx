"use client";

import { useEffect } from "react";
import OwnerSidebar from "./components/OwnerSidebar";
import OwnerTopbar from "./components/OwnerTopbar";
import { useUserStore } from "@/store/userStore";
import { useRouter } from "next/navigation";

export default function OwnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, token } = useUserStore();
  const router = useRouter();

  // useEffect(() => {
  //   if (!token || !user || (user.role !== "OWNER" && user.role !== "ADMIN")) {
  //     router.push("/login");
  //   }
  // }, [token, user, router]);

  // if (!token || !user) return null;

  return (
    <div className="flex h-screen bg-gray-50/50 dark:bg-gray-950 font-sans text-gray-900 dark:text-gray-100">
      <OwnerSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <OwnerTopbar />
        <main className="flex-1 overflow-y-auto bg-blue-50 p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
