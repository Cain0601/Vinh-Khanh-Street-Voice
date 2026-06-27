import { useEffect } from "react";
import { auth } from "@/firebaseConfig";
import { authApi } from "@/lib/api/auth";
import { useUserStore } from "@/store/userStore";
import { toast } from "react-hot-toast";

/**
 * Helper to read a cookie value.
 */
function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
  return match ? decodeURIComponent(match[2]) : null;
}

/**
 * Attempt to fetch the current user profile using the stored token.
 * Returns the profile object on success, "EXPIRED" if the server reports an
 * authentication error, or null on other failures.
 */
async function fetchProfile(): Promise<any> {
  try {
    // authApi.me() relies on the token cookie being sent automatically.
    const result = await authApi.me();
    if (result.success && result.data) {
      return result.data;
    }
    return null;
  } catch (err: any) {
    // If the backend returns 401/403 we treat it as an expired token.
    if (err?.response?.status === 401 || err?.response?.status === 403) {
      return "EXPIRED";
    }
    console.error("Error calling /auth/me", err);
    return null;
  }
}

/**
 * Force‑refresh the Firebase ID token and update the cookie.
 */
async function refreshFirebaseToken(): Promise<string | null> {
  const currentUser = auth.currentUser;
  if (!currentUser) return null;
  try {
    const idToken = await currentUser.getIdToken(true); // force refresh
    const encoded = encodeURIComponent(idToken);
    document.cookie = `token=${encoded}; path=/; SameSite=Strict`;
    document.cookie = `ft_token=${encoded}; path=/; SameSite=Strict`;
    return idToken;
  } catch (e) {
    console.error("Failed to refresh Firebase token", e);
    return null;
  }
}

/**
 * Hook that runs once on app start. It reads the token from cookies, tries to
 * fetch the user profile, and if the token is expired it refreshes it via
 * Firebase before retrying.
 */
export function useAuthInit() {
  const { setUser, setToken, logout } = useUserStore.getState();

  useEffect(() => {
    const cookieToken = getCookie("ft_token");
    if (!cookieToken) {
      // No token – user is not logged in.
      logout();
      return;
    }

    (async () => {
      const profileOrStatus = await fetchProfile();
      if (profileOrStatus === "EXPIRED") {
        // Token expired, try to refresh via Firebase SDK.
        const newToken = await refreshFirebaseToken();
        if (newToken) {
          const refreshedProfile = await fetchProfile();
          if (refreshedProfile && refreshedProfile !== "EXPIRED") {
            setUser(refreshedProfile);
            setToken(newToken);
            return;
          }
        }
        // Still failed – log out the user.
        logout();
        toast.error("Phiên đăng nhập đã hết, vui lòng đăng nhập lại");
      } else if (profileOrStatus) {
        // Successful fetch.
        setUser(profileOrStatus);
        setToken(cookieToken);
      } else {
        // Unexpected error.
        logout();
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
