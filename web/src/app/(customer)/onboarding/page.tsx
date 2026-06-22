"use client";

import React, { useEffect, useState } from "react";
import OnboardingModal from "@/components/OnboardingModal";
import { useUserStore } from "@/store/userStore";
import { useRouter } from "next/navigation";
import { listenAuthState, resolvePostAuthRoute } from "@/lib/auth";

export default function OnboardingPage() {
  const { user } = useUserStore();
  const router = useRouter();
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    const unsubscribe = listenAuthState(() => setAuthReady(true));
    return unsubscribe;
  }, []);

  const handleComplete = async () => {
    const { updateUser } = useUserStore.getState();
    const nextUser = { ...(user ?? {}), isOnboarded: true };

    updateUser({ isOnboarded: true });
    router.replace(resolvePostAuthRoute(nextUser));
  };

  useEffect(() => {
    if (!authReady) {
      return;
    }

    if (!user) {
      router.replace("/login");
      return;
    }

    if (user.isOnboarded) {
      router.replace(resolvePostAuthRoute(user));
    }
  }, [authReady, router, user]);

  if (!authReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-zinc-400">
        Đang tải...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-white flex items-center justify-center">
      <OnboardingModal onComplete={handleComplete} />
    </div>
  );
}
