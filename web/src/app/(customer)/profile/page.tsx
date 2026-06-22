"use client";

import React, { useState } from "react";
import { Globe, HelpCircle, Info, Shield, Check, X, LogOut, Store, User, Mail, Pencil, KeyRound } from "lucide-react";
import { useUserStore } from "@/store/userStore";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/i18n";
import { authApi } from "@/lib/api/auth";
import { moderationApi } from "@/lib/api/moderation";
import { useToast } from "@/components/Toast";
import Header from "@/components/Layout/Header";
import LanguageSwitcher from "@/components/Common/LanguageSwitcher";

export default function SettingsPage() {
  const { user, language, setLanguage, updateUser, logout } = useUserStore();
  const { addToast } = useToast();
  const [isUpdating, setIsUpdating] = useState(false);
  const [isRequestingUpgrade, setIsRequestingUpgrade] = useState(false);
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [profileForm, setProfileForm] = useState({
    fullName: user?.fullName || user?.displayName || "",
    email: user?.email || "",
  });
  const [passwordForm, setPasswordForm] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  const router = useRouter();
  const t = useTranslation();
  const displayName = user?.fullName || user?.displayName || "Người dùng FoodTour";
  const displayEmail = user?.email || "Chưa có email";
  const displayRole = user?.role || "USER";

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

  const openEditModal = () => {
    setProfileForm({
      fullName: user?.fullName || user?.displayName || "",
      email: user?.email || "",
    });
    setPasswordForm({ newPassword: "", confirmPassword: "" });
    setShowEditModal(true);
  };

  const handleUpdateProfile = async () => {
    if (!user) return;

    setIsUpdating(true);
    try {
      const result = await authApi.updateProfile({
        fullName: profileForm.fullName.trim(),
        email: profileForm.email.trim(),
      });

      if (result.success) {
        updateUser({
          fullName: profileForm.fullName.trim(),
          displayName: profileForm.fullName.trim(),
          email: profileForm.email.trim(),
        });
        addToast("Đã cập nhật thông tin cá nhân", "success");
      } else {
        addToast(result.message || "Không thể cập nhật thông tin", "error");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      addToast("Không thể cập nhật thông tin", "error");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordForm.newPassword.length < 6) {
      addToast("Mật khẩu mới cần ít nhất 6 ký tự", "error");
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      addToast("Mật khẩu xác nhận không khớp", "error");
      return;
    }

    setIsUpdating(true);
    try {
      const result = await authApi.changePassword({ newPassword: passwordForm.newPassword });
      if (result.success) {
        setPasswordForm({ newPassword: "", confirmPassword: "" });
        addToast("Đã đổi mật khẩu", "success");
      } else {
        addToast(result.message || "Không thể đổi mật khẩu", "error");
      }
    } catch (error) {
      console.error("Error changing password:", error);
      addToast("Không thể đổi mật khẩu", "error");
    } finally {
      setIsUpdating(false);
    }
  };

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
      <Header title={t.profile.title} showBack onBack={() => router.push("/home")} />

      <div className="p-4 space-y-8 pb-24 h-[calc(100vh-100px)] overflow-y-auto">
        {/* USER INFO Card */}
        <div className="bg-secondary border border-zinc-800 rounded-3xl p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex min-w-0 items-center gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400">
                <User className="h-7 w-7" />
              </div>
                  <div className="min-w-0">
                    <p className="truncate text-lg font-semibold text-white">{displayName}</p>
                    <div className="mt-1 flex min-w-0 items-center gap-2 text-sm text-zinc-400">
                      <Mail className="h-4 w-4 shrink-0" />
                      <span className="truncate">{displayEmail}</span>
                    </div>
                    <span className="mt-3 inline-flex rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-300">
                      {displayRole}
                    </span>
                  </div>
            </div>
            <button
              type="button"
              onClick={openEditModal}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-zinc-700 bg-zinc-800 text-zinc-300 transition-colors hover:border-emerald-500/50 hover:text-emerald-300"
              aria-label="Sửa thông tin cá nhân"
            >
              <Pencil className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* GENERAL Section */}
        <div>
          <h3 className="text-zinc-500 text-xs font-semibold uppercase tracking-widest px-2 mb-4">{t.settings.sectionGeneral}</h3>
          
          <div className="space-y-3">
            {/* Language - Click to open modal */}
            <button
              type="button"
              onClick={() => setShowLanguageModal(true)}
              className="w-full bg-secondary border border-zinc-800 hover:border-zinc-700 rounded-3xl p-5 flex items-center justify-between transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-2xl bg-zinc-700 flex items-center justify-center">
                  <Globe className="w-5 h-5 text-emerald-300" />
                </div>
                <p className="font-medium">{t.settings.language}</p>
              </div>
            </button>
            <LanguageSwitcher
              isOpen={showLanguageModal}
              onClose={() => setShowLanguageModal(false)}
            />

            {/* <div className="bg-secondary border border-zinc-800 rounded-3xl p-5">
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
            <button className="w-full bg-secondary border border-zinc-800 hover:border-zinc-700 rounded-3xl p-5 flex items-center justify-between transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-2xl bg-zinc-700 flex items-center justify-center">
                  <HelpCircle className="w-5 h-5" />
                </div>
                <p className="font-medium">{t.settings.helpCenter}</p>
              </div>
              <span className="text-zinc-500">›</span>
            </button>

            <button className="w-full bg-secondary border border-zinc-800 hover:border-zinc-700 rounded-3xl p-5 flex items-center justify-between transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-2xl bg-zinc-700 flex items-center justify-center">
                  <Info className="w-5 h-5" />
                </div>
                <p className="font-medium">{t.settings.aboutApp}</p>
              </div>
              <span className="text-zinc-500">›</span>
            </button>

            <button className="w-full bg-secondary border border-zinc-800 hover:border-zinc-700 rounded-3xl p-5 flex items-center justify-between transition-colors">
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
              className="w-full bg-secondary border border-zinc-800 hover:border-orange-500/50 rounded-3xl p-5 flex items-center justify-between transition-all group active:scale-[0.985]"
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
          className="w-full h-14 bg-secondary/70 hover:bg-red-500/10 border border-zinc-800 hover:border-red-500/50 text-zinc-400 hover:text-red-400 rounded-3xl transition-all font-medium flex items-center justify-center gap-3 text-lg mt-6"
        >
          <LogOut className="w-5 h-5" />
          {t.settings.logOut}
        </button>
      </div>

      {/* ==================== EDIT PROFILE MODAL ==================== */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center" onClick={() => setShowEditModal(false)}>
          <div className="bg-zinc-900 w-full max-w-md sm:rounded-3xl rounded-t-3xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b border-zinc-800">
              <h2 className="text-xl font-semibold">{t.profile.editTitle}</h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="p-2 hover:bg-zinc-800 rounded-full transition-colors"
              >
                <X className="w-6 h-6 text-zinc-400" />
              </button>
            </div>

            <div className="max-h-[70vh] overflow-y-auto p-6 space-y-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-sm font-semibold uppercase tracking-widest text-zinc-500">
                  <User className="h-4 w-4" />
                  {t.profile.sectionInfo}
                </div>
                <label className="block space-y-2">
                  <span className="text-sm text-zinc-400">{t.profile.fullName}</span>
                  <input
                    value={profileForm.fullName}
                    onChange={(event) => setProfileForm((current) => ({ ...current, fullName: event.target.value }))}
                    className="w-full rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-white outline-none transition-colors focus:border-emerald-500"
                    placeholder={t.profile.placeholderFullName}
                  />
                </label>
                <label className="block space-y-2">
                  <span className="text-sm text-zinc-400">{t.profile.email}</span>
                  <input
                    type="email"
                    value={profileForm.email}
                    onChange={(event) => setProfileForm((current) => ({ ...current, email: event.target.value }))}
                    className="w-full rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-white outline-none transition-colors focus:border-emerald-500"
                    placeholder={t.profile.placeholderEmail}
                  />
                </label>
                <button
                  type="button"
                  onClick={handleUpdateProfile}
                  disabled={isUpdating}
                  className="w-full rounded-2xl bg-emerald-600 px-4 py-3 font-semibold text-white transition-colors hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {t.profile.saveInfo}
                </button>
              </div>

              <div className="h-px bg-zinc-800" />

              <div className="space-y-4">
                <div className="flex items-center gap-3 text-sm font-semibold uppercase tracking-widest text-zinc-500">
                  <KeyRound className="h-4 w-4" />
                  {t.profile.sectionPassword}
                </div>
                <label className="block space-y-2">
                  <span className="text-sm text-zinc-400">{t.profile.newPassword}</span>
                  <input
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={(event) => setPasswordForm((current) => ({ ...current, newPassword: event.target.value }))}
                    className="w-full rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-white outline-none transition-colors focus:border-orange-500"
                    placeholder={t.profile.placeholderPasswordMin}
                  />
                </label>
                <label className="block space-y-2">
                  <span className="text-sm text-zinc-400">{t.profile.confirmPassword}</span>
                  <input
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={(event) => setPasswordForm((current) => ({ ...current, confirmPassword: event.target.value }))}
                    className="w-full rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-white outline-none transition-colors focus:border-orange-500"
                    placeholder={t.profile.placeholderConfirmPassword}
                  />
                </label>
                <button
                  type="button"
                  onClick={handleChangePassword}
                  disabled={isUpdating}
                  className="w-full rounded-2xl bg-orange-600 px-4 py-3 font-semibold text-white transition-colors hover:bg-orange-500 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {t.profile.changePassword}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
