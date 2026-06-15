"use client";

import { useUserStore } from "@/store/userStore";

const dictionaries = {
  vi: {
    settings: {
      title: "Cài đặt",
      sectionGeneral: "Chung",
      language: "Ngôn ngữ",
      discoveryRadius: "Bán kính khám phá",
      sectionSupport: "Hỗ trợ",
      helpCenter: "Trung tâm trợ giúp",
      aboutApp: "Về ứng dụng",
      termsOfService: "Điều khoản dịch vụ",
      sectionPartnership: "Đối tác",
      becomeOwner: "Trở thành chủ quán",
      becomeOwnerSub: "Gửi yêu cầu nâng cấp tài khoản",
      logOut: "Đăng xuất",
      chooseLanguage: "Chọn ngôn ngữ",
      cancel: "Hủy",
    },
  },
  en: {
    settings: {
      title: "Settings",
      sectionGeneral: "General",
      language: "Language",
      discoveryRadius: "Discovery radius",
      sectionSupport: "Support",
      helpCenter: "Help Center",
      aboutApp: "About App",
      termsOfService: "Terms of Service",
      sectionPartnership: "Partnership",
      becomeOwner: "Become an owner",
      becomeOwnerSub: "Send an account upgrade request",
      logOut: "Log out",
      chooseLanguage: "Choose language",
      cancel: "Cancel",
    },
  },
};

export type Locale = keyof typeof dictionaries;

export function useTranslation() {
  const language = useUserStore((state) => state.language);
  return dictionaries[(language as Locale) in dictionaries ? (language as Locale) : "vi"];
}
