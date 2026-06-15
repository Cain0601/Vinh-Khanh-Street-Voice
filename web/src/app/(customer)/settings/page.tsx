"use client";

import React, { useState } from "react";
import { Globe, HelpCircle, Info, Shield, Check, X, LogOut, Store } from "lucide-react";
import { useUserStore } from "@/store/userStore";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/i18n";
import { authApi } from "@/lib/api/auth";
import { moderationApi } from "@/lib/api/moderation";
import { useToast } from "@/components/Toast";

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
  { id: "ja", name: "日本語", flag: "🇯🇵", label: "Japanese" },
  { id: "ko", name: "한국어", flag: "🇰🇷", label: "Korean" },
  { id: "de", name: "Deutsch", flag: "🇩🇪", label: "German" },
  { id: "it", name: "Italiano", flag: "🇮🇹", label: "Italian" },
  { id: "th", name: "ภาษาไทย", flag: "🇹🇭", label: "Thai" },
];

export default function SettingsPage() {
  const { user, language, setLanguage, updateUser, logout } = useUserStore();
  const { addToast } = useToast();
  const [isUpdating, setIsUpdating] = useState(false);
  const [isRequestingUpgrade, setIsRequestingUpgrade] = useState(false);
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const router = useRouter();
  const t = useTranslation();

  const handleLanguageChange = async (langId: string) => {
    setLanguage(langId);
    if (!user) {
      setShowLanguageModal(false);
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
      setShowLanguageModal(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  // const handleUpdateProfile = async () => {
  //   if (!user) return;

  //   setIsUpdating(true);
  //   try {
  //     const result = await api.patch('/auth/profile', profileForm);
      
  //     if (result.data) {
  //       updateUser(profileForm);
  //       setIsEditingProfile(false);
  //     } else {
  //       console.error("Failed to update profile on backend");
  //     }
  //   } catch (error) {
  //     console.error("Error updating profile:", error);
  //   } finally {
  //     setIsUpdating(false);
  //   }
  // };

  const handleRequestOwnerUpgrade = async () => {
    if (!user || user.role !== 'USER') return;

    setIsRequestingUpgrade(true);
    try {
      const result = await moderationApi.requestUpgrade();
      if (result.success) {
        addToast('Yêu cầu nâng cấp lên Owner đã được gửi. Admin sẽ xem xét trong thời gian sớm nhất.', 'success');
      } else {
        addToast(result.message || 'Không thể gửi yêu cầu nâng cấp', 'error');
      }
    } catch (error) {
      console.error('Failed to request owner upgrade:', error);
      addToast('Không thể gửi yêu cầu nâng cấp', 'error');
    } finally {
      setIsRequestingUpgrade(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-white flex flex-col">
      {/* Header */}
      <div className="p-6 flex items-center gap-4 border-b border-zinc-900 sticky top-0 bg-zinc-950/90 backdrop-blur-md z-10">
        <h1 className="text-2xl font-bold">{t.settings.title}</h1>
      </div>

      <div className="p-6 space-y-8 pb-24 h-[calc(100vh-100px)] overflow-y-auto">
        {/* GENERAL Section */}
        <div>
          <h3 className="text-zinc-500 text-xs font-semibold uppercase tracking-widest px-2 mb-4">{t.settings.sectionGeneral}</h3>
          
          <div className="space-y-3">
            {/* Language - Click to open modal */}
            <button 
              onClick={() => setShowLanguageModal(true)}
              className="w-full bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-3xl p-5 flex items-center justify-between transition-all active:scale-[0.985]"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 flex items-center justify-center">
                  <Globe className="w-5 h-5 text-emerald-400" />
                </div>
                <div className="text-left">
                  <p className="font-medium">{t.settings.language}</p>
                  <p className="text-sm text-zinc-400">
                    {languages.find(l => l.id === language)?.name || "Tiếng Việt"}
                  </p>
                </div>
              </div>
              <div className="text-emerald-400 text-xl">›</div>
            </button>

            {/* <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 flex items-center justify-center">
                  <Globe className="w-5 h-5 text-emerald-400" />
                </div>
                <p className="font-medium">{t.settings.discoveryRadius}</p>
              </div>
              
              <div className="flex gap-2">
                {["50m", "100m", "200m"].map((radius) => (
                  <button
                    key={radius}
                    onClick={() => setSelectedRadius(radius)}
                    className={`flex-1 py-3 rounded-2xl text-sm font-medium transition-all ${
                      selectedRadius === radius 
                        ? "bg-emerald-600 text-white" 
                        : "bg-zinc-800 hover:bg-zinc-700 text-zinc-400"
                    }`}
                  >
                    {radius}
                  </button>
                ))}
              </div>
            </div> */}
          </div>
        </div>

        {/* SUPPORT Section */}
        <div>
          <h3 className="text-zinc-500 text-xs font-semibold uppercase tracking-widest px-2 mb-4">{t.settings.sectionSupport}</h3>
          
          <div className="space-y-3">
            <button className="w-full bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-3xl p-5 flex items-center justify-between transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-2xl bg-zinc-700 flex items-center justify-center">
                  <HelpCircle className="w-5 h-5" />
                </div>
                <p className="font-medium">{t.settings.helpCenter}</p>
              </div>
              <span className="text-zinc-500">›</span>
            </button>

            <button className="w-full bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-3xl p-5 flex items-center justify-between transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-2xl bg-zinc-700 flex items-center justify-center">
                  <Info className="w-5 h-5" />
                </div>
                <p className="font-medium">{t.settings.aboutApp}</p>
              </div>
              <span className="text-zinc-500">›</span>
            </button>

            <button className="w-full bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-3xl p-5 flex items-center justify-between transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-2xl bg-zinc-700 flex items-center justify-center">
                  <Shield className="w-5 h-5" />
                </div>
                <p className="font-medium">{t.settings.termsOfService}</p>
              </div>
              <span className="text-zinc-500">›</span>
            </button>
          </div>
        </div>

        {/* PARTNERSHIP Section */}
        {user?.role === 'USER' && (<div>
          <h3 className="text-zinc-500 text-xs font-semibold uppercase tracking-widest px-2 mb-4">{t.settings.sectionPartnership}</h3>
          
          <div className="space-y-3">
            <button 
              onClick={handleRequestOwnerUpgrade}
              disabled={isRequestingUpgrade}
              className="w-full bg-zinc-900 border border-zinc-800 hover:border-orange-500/50 rounded-3xl p-5 flex items-center justify-between transition-all group active:scale-[0.985]"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-2xl bg-orange-500/10 flex items-center justify-center group-hover:bg-orange-500/20 transition-colors">
                  <Store className="w-5 h-5 text-orange-400" />
                </div>
                <div className="text-left">
                  <p className="font-medium text-white">{t.settings.becomeOwner}</p>
                  <p className="text-sm text-zinc-400">{t.settings.becomeOwnerSub}</p>
                </div>
              </div>
              <div className="text-orange-400 text-xl group-hover:translate-x-1 transition-transform">›</div>
            </button>
          </div>
        </div>)}

        {/* Log Out */}
        <button 
          onClick={handleLogout}
          className="w-full h-14 bg-zinc-900/70 hover:bg-red-500/10 border border-zinc-800 hover:border-red-500/50 text-zinc-400 hover:text-red-400 rounded-3xl transition-all font-medium flex items-center justify-center gap-3 text-lg mt-6"
        >
          <LogOut className="w-5 h-5" />
          {t.settings.logOut}
        </button>
      </div>

      {/* ==================== LANGUAGE MODAL ==================== */}
      {showLanguageModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center" onClick={() => setShowLanguageModal(false)}>
          <div className="bg-zinc-900 w-full max-w-md sm:rounded-3xl rounded-t-3xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-zinc-800">
              <h2 className="text-xl font-semibold">{t.settings.chooseLanguage}</h2>
              <button 
                onClick={() => setShowLanguageModal(false)}
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
                onClick={() => setShowLanguageModal(false)}
                className="w-full py-4 text-zinc-400 hover:text-white font-medium transition-colors"
              >
                {t.settings.cancel}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
