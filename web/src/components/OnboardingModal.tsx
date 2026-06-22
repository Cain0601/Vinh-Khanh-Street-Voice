// src/components/OnboardingModal.tsx
import { useEffect, useState } from "react";
import { useUserStore } from "@/store/userStore";
import { useTranslation } from "@/i18n";
import { authApi } from "@/lib/api/auth";

export default function OnboardingModal({ onComplete }: { onComplete?: () => void }) {
  const { setLocationPermission, setLanguage, language, updateUser } = useUserStore();
  const t = useTranslation();
  const [gpsRequested, setGpsRequested] = useState(false);
  const [selectedLang, setSelectedLang] = useState(language);

  // Request GPS permission when modal opens
  useEffect(() => {
    if (!gpsRequested) {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          () => {
            setLocationPermission(true);
            setGpsRequested(true);
          },
          () => {
            setLocationPermission(false);
            setGpsRequested(true);
          }
        );
      } else {
        setLocationPermission(false);
        setGpsRequested(true);
      }
    }
  }, [gpsRequested, setLocationPermission]);

  const handleSave = async () => {
    const nextLanguage = selectedLang || 'vi';

    setLanguage(nextLanguage);
    updateUser({ language: nextLanguage, isOnboarded: true });
    try {
      await authApi.updateProfile({ language: nextLanguage, isOnboarded: true });
    } catch (e) {
      console.error(e);
    }
    if (onComplete) onComplete();
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-zinc-900 p-6 rounded-2xl w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">{t.onboarding.title}</h2>
        <p className="mb-4">{t.onboarding.gpsPrompt}</p>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">{t.onboarding.selectLanguage}</label>
          <select
            value={selectedLang}
            onChange={(e) => setSelectedLang(e.target.value)}
            className="w-full rounded-md bg-zinc-800 border border-zinc-700 p-2 text-white"
          >
            <option value="vi">Tiếng Việt</option>
            <option value="en">English</option>
            <option value="es">Español</option>
          </select>
        </div>
        <button
          onClick={handleSave}
          className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 rounded-md transition-colors"
        >
          {t.onboarding.continue}
        </button>
      </div>
    </div>
  );
}
