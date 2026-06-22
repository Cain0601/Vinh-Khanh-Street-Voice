import React, { useState } from "react";
import { X } from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import { signInWithGoogle, signInWithEmail, registerWithEmail } from "@/lib/auth";
import { useToast } from "@/components/Toast";
import { useTranslation } from "@/i18n";

export default function AuthModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { addToast } = useToast();
  const t = useTranslation();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");

  const handleSubmit = async () => {
    try {
      if (mode === "login") {
        await signInWithEmail(email, password);
        addToast(t.auth.loginSuccess, "success");
      } else {
        if (!displayName) {
          addToast(t.auth.displayNameRequired, "error");
          return;
        }
        await registerWithEmail(email, password, displayName);
        addToast(t.auth.registerSuccess, "success");
      }
      onClose();
    } catch (e) {
      console.error(e);
      addToast(t.auth.genericError, "error");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-zinc-900 w-full max-w-md rounded-3xl p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">
            {mode === "login" ? t.auth.loginTitle : t.auth.registerTitle}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-zinc-800 rounded-full">
            <X className="w-5 h-5 text-zinc-400" />
          </button>
        </div>
        <div className="space-y-4">
          {mode === "register" && (
            <input
              type="text"
              placeholder={t.auth.displayNamePlaceholder}
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-white placeholder-zinc-500"
            />
          )}
          <input
            type="email"
            placeholder={t.auth.emailPlaceholder}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-white placeholder-zinc-500"
          />
          <input
            type="password"
            placeholder={t.auth.passwordPlaceholder}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-white placeholder-zinc-500"
          />
          <button
            onClick={handleSubmit}
            className="w-full bg-emerald-600 rounded-2xl py-3 font-semibold text-white hover:bg-emerald-500 transition"
          >
            {mode === "login" ? t.auth.loginButton : t.auth.registerButton}
          </button>
          <div className="flex items-center justify-center gap-2 text-zinc-500">
            <span>{t.auth.or}</span>
            <button
              onClick={signInWithGoogle}
              className="flex items-center gap-2 bg-zinc-800 px-4 py-2 rounded-xl hover:bg-zinc-700 transition"
            >
              <FcGoogle className="w-5 h-5" />
              {t.auth.googleSignIn}
            </button>
          </div>
          <div className="text-center mt-2">
            <button
              type="button"
              onClick={() => setMode(mode === "login" ? "register" : "login")}
              className="text-emerald-400 hover:underline"
            >
              {mode === "login" ? t.auth.noAccount : t.auth.haveAccount}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
