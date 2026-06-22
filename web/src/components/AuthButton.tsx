"use client";

import { LogIn } from "lucide-react";
import { useRouter } from "next/navigation";

type AuthButtonProps = {
  className?: string;
};

export default function AuthButton({ className = "" }: AuthButtonProps) {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() => router.push("/login")}
      className={`inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-5 py-3 font-semibold text-white transition-colors hover:bg-emerald-500 ${className}`}
    >
      <LogIn className="h-4 w-4" />
      Đăng nhập ngay
    </button>
  );
}
