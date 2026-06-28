"use client";

import { listenAuthState } from "@/lib/auth";
import { useAuthInit } from "@/lib/useAuthInit";
import { useEffect } from "react";

/**
 * Small client‑side component whose sole purpose is to run the authentication
 * initialization hook. It renders nothing.
 */
export default function AuthInit() {
  useEffect(() => {
      const unsubscribe = listenAuthState();
      return unsubscribe;
    }, []);
  useAuthInit();
  return null;
}
