"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FcGoogle } from "react-icons/fc";
import { useTranslation } from "@/i18n";
import { useToast } from "@/components/Toast";
import { useUserStore } from "@/store/userStore";
import {
  listenAuthState,
  registerWithEmail,
  resolvePostAuthRoute,
  signInWithEmail,
  signInWithGoogle,
} from "@/lib/auth";

type AuthFormProps = {
  mode: "login" | "signup";
};

export default function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const { addToast } = useToast();
  const t = useTranslation();
  const user = useUserStore((state) => state.user);
  const [bootstrapped, setBootstrapped] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");

  useEffect(() => {
    const unsubscribe = listenAuthState(() => setBootstrapped(true));
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!bootstrapped || !user) return;
    router.replace(resolvePostAuthRoute(user));
  }, [bootstrapped, router, user]);

  const handleGoogleSignIn = async () => {
    setSubmitting(true);
    try {
      const profile = await signInWithGoogle();
      addToast(mode === "login" ? t.auth.loginSuccess : t.auth.registerSuccess, "success");
      router.replace(resolvePostAuthRoute(profile));
    } catch (error) {
      console.error(error);
      addToast(t.auth.genericError, "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      if (mode === "login") {
        const profile = await signInWithEmail(email, password);
        addToast(t.auth.loginSuccess, "success");
        router.replace(resolvePostAuthRoute(profile));
        return;
      }

      if (!displayName.trim()) {
        addToast(t.auth.displayNameRequired, "error");
        setSubmitting(false);
        return;
      }

      const profile = await registerWithEmail(email, password, displayName.trim());
      addToast(t.auth.registerSuccess, "success");
      router.replace(resolvePostAuthRoute(profile));
    } catch (error) {
      console.error(error);
      addToast(t.auth.genericError, "error");
    } finally {
      setSubmitting(false);
    }
  };

  const title = mode === "login" ? t.auth.loginTitle : t.auth.registerTitle;
  const primaryButton = mode === "login" ? t.auth.loginButton : t.auth.registerButton;
  const switchHref = mode === "login" ? "/signup" : "/login";
  const switchLabel = mode === "login" ? t.auth.noAccount : t.auth.haveAccount;

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.18),transparent_30%),linear-gradient(180deg,#020617_0%,#0f172a_100%)] px-4 py-8 text-white">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-md items-center justify-center">
        <div className="w-full rounded-[2rem] border border-white/10 bg-slate-950/80 p-6 shadow-2xl shadow-black/40 backdrop-blur-xl sm:p-8">
          <div className="mb-6 space-y-2">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-300">FoodTour</p>
            <h1 className="text-2xl font-bold text-white">{title}</h1>
            <p className="text-sm leading-6 text-slate-400">
              {mode === "login"
                ? "Đăng nhập để tiếp tục và xem giao diện phù hợp với vai trò của bạn."
                : "Tạo tài khoản mới rồi chuyển sang onboarding để chọn ngôn ngữ và bật GPS."}
            </p>
          </div>

          <div className="space-y-4">
            {mode === "signup" && (
              <input
                type="text"
                placeholder={t.auth.displayNamePlaceholder}
                value={displayName}
                onChange={(event) => setDisplayName(event.target.value)}
                className="w-full rounded-2xl border border-slate-800 bg-slate-900/80 px-4 py-3 text-white outline-none transition-colors placeholder:text-slate-500 focus:border-emerald-500"
              />
            )}

            <input
              type="email"
              placeholder={t.auth.emailPlaceholder}
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-2xl border border-slate-800 bg-slate-900/80 px-4 py-3 text-white outline-none transition-colors placeholder:text-slate-500 focus:border-emerald-500"
            />

            <input
              type="password"
              placeholder={t.auth.passwordPlaceholder}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-2xl border border-slate-800 bg-slate-900/80 px-4 py-3 text-white outline-none transition-colors placeholder:text-slate-500 focus:border-emerald-500"
            />

            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="flex h-12 w-full items-center justify-center rounded-2xl bg-emerald-600 px-4 font-semibold text-white transition-colors hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? "..." : primaryButton}
            </button>

            <div className="flex items-center gap-3 py-2 text-sm text-slate-500">
              <div className="h-px flex-1 bg-slate-800" />
              <span>{t.auth.or}</span>
              <div className="h-px flex-1 bg-slate-800" />
            </div>

            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={submitting}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl border border-slate-800 bg-slate-900/80 px-4 font-semibold text-white transition-colors hover:border-emerald-500/50 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <FcGoogle className="h-5 w-5" />
              {t.auth.googleSignIn}
            </button>
          </div>

          <div className="mt-6 text-center text-sm text-slate-400">
            <Link href={switchHref} className="font-semibold text-emerald-300 hover:text-emerald-200">
              {switchLabel}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
