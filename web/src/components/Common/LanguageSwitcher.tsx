"use client";

import { useState } from "react";
import { useUserStore } from "@/store/userStore";
import { Check, Globe, X } from "lucide-react";
import { useTranslation } from "@/i18n";
import { useToast } from "../Toast";
import { authApi } from "@/lib/api/auth";

// Reuse the same language list as in Settings page.
const languages = [
  { id: "en", name: "English", flag: "🇬🇧", label: "English" },
  { id: "vi", name: "Tiếng Việt", flag: "🇻🇳", label: "Vietnamese" },
  { id: "zh", name: "中文", flag: "🇨🇳", label: "Chinese (Mandarin)" },
  { id: "hi", name: "हिन्दी", flag: "🇮🇳", label: "Hindi" },
  { id: "es", name: "Español", flag: "🇪🇸", label: "Spanish" },
  { id: "fr", name: "Français", flag: "🇫🇷", label: "French" },
  { id: "ar", name: "العربية", flag: "🇸🇦", label: "Arabic" },
  { id: "pt", name: "Português", flag: "🇵🇹", label: "Portuguese" },
  { id: "ru", name: "Русский", flag: "🇷🇺", label: "Russian" },
  { id: "id", name: "Bahasa Indonesia", flag: "🇮🇩", label: "Indonesian" },
  { id: "ko", name: "한국어", flag: "🇰🇷", label: "Korean" },
  { id: "de", name: "Deutsch", flag: "🇩🇪", label: "German" },
  { id: "it", name: "Italiano", flag: "🇮🇹", label: "Italian" },
  { id: "th", name: "ภาษาไทย", flag: "🇹🇭", label: "Thai" },
];

interface LanguageSwitcherProps {
  /** Optional callback when a language is selected. Allows parent components to perform side‑effects such as persisting the choice. */
  onSelect?: (langId: string) => void;
  /** Control visibility from parent */
  isOpen?: boolean;
  /** Callback to close the modal */
  onClose?: () => void;
}

export default function LanguageSwitcher({ onSelect, isOpen = false, onClose }: LanguageSwitcherProps) {
  const { user, language, setLanguage, updateUser } = useUserStore();
  const [isUpdating, setIsUpdating] = useState(false);
  const { addToast } = useToast();

  const t = useTranslation();
  const handleLanguageChange = async (langId: string) => {
    setLanguage(langId);
    if (!user) {
      onClose?.();
      return;
    }

    setIsUpdating(true);
    try {
      const result = await authApi.updateProfile({ language: langId });
      
      if (result.success) {
        updateUser({ language: langId });
        addToast("Đã cập nhật ngôn ngữ", "success");
      } else {
        addToast(result.message || "Không thể cập nhật ngôn ngữ", "error");
      }
    } catch (error) {
      console.error("Error updating language:", error);
      addToast("Không thể cập nhật ngôn ngữ", "error");
    } finally {
      setIsUpdating(false);
      onClose?.();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center" onClick={() => onClose?.()}>
      <div className="bg-zinc-900 w-full max-w-md sm:rounded-3xl rounded-t-3xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-zinc-800">
          <h2 className="text-xl font-semibold">{t.settings.chooseLanguage}</h2>
          <button 
            onClick={() => onClose?.()}
            className="p-2 hover:bg-zinc-800 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-zinc-400" />
          </button>
        </div>

        {/* Language List */}
        <div className="p-3 max-h-[60vh] overflow-y-auto">
          {languages.map((lang) => (
            <button
              key={lang.id}
              onClick={() => handleLanguageChange(lang.id)}
              disabled={isUpdating}
              className={`w-full flex items-center justify-between p-5 rounded-2xl mb-2 transition-all ${
                language === lang.id 
                  ? "bg-orange-500/10 border border-orange-500" 
                  : "hover:bg-zinc-800 border border-transparent"
              }`}
            >
              <div className="flex items-center gap-4">
                <span className="text-3xl">{lang.flag}</span>
                <div className="text-left">
                  <p className="font-medium text-lg">{lang.name}</p>
                  <p className="text-sm text-zinc-500">{lang.label}</p>
                </div>
              </div>
              
              {language === lang.id && (
                <Check className="w-6 h-6 text-orange-500" />
              )}
            </button>
          ))}
        </div>

        {/* Modal Footer */}
        <div className="p-6 border-t border-zinc-800">
          <button 
            onClick={() => onClose?.()}
            className="w-full py-4 text-zinc-400 hover:text-white font-medium transition-colors"
          >
            {t.settings.cancel}
          </button>
        </div>
      </div>
    </div>
  );
}
