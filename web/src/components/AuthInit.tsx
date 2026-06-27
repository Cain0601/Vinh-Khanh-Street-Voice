"use client";

import { useAuthInit } from "@/lib/useAuthInit";

/**
 * Small client‑side component whose sole purpose is to run the authentication
 * initialization hook. It renders nothing.
 */
export default function AuthInit() {
  useAuthInit();
  return null;
}
