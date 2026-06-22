import { auth } from "@/firebaseConfig";
import { authApi, type AuthUserProfile } from "@/lib/api/auth";
import { useUserStore } from "@/store/userStore";
import {
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  onIdTokenChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut as firebaseSignOut,
  updateProfile as updateFirebaseProfile,
  User as FirebaseUser,
} from "firebase/auth";
import { toast } from "react-hot-toast";

const provider = new GoogleAuthProvider();

const defaultProfile = (firebaseUser: FirebaseUser): AuthUserProfile => ({
  id: firebaseUser.uid,
  email: firebaseUser.email ?? undefined,
  displayName: firebaseUser.displayName ?? undefined,
  fullName: firebaseUser.displayName ?? undefined,
  role: "USER",
  language: "vi",
  isOnboarded: false,
});

const setAuthCookies = async (firebaseUser: FirebaseUser) => {
  const idToken = await firebaseUser.getIdToken();
  const encoded = encodeURIComponent(idToken);

  if (typeof window !== "undefined") {
    document.cookie = `token=${encoded}; path=/; SameSite=Strict`;
    document.cookie = `ft_token=${encoded}; path=/; SameSite=Strict`;
  }
};

const clearAuthCookies = () => {
  if (typeof window === "undefined") return;

  document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
  document.cookie = "ft_token=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
};

const normalizeProfile = (profile?: Partial<AuthUserProfile> | null, firebaseUser?: FirebaseUser): AuthUserProfile => {
  const fallback = firebaseUser ? defaultProfile(firebaseUser) : { id: "", role: "USER", language: "vi", isOnboarded: false };

  return {
    ...fallback,
    ...profile,
    id: profile?.id ?? fallback.id,
    role: profile?.role || fallback.role,
    language: profile?.language || fallback.language,
    isOnboarded: profile?.isOnboarded ?? fallback.isOnboarded,
  };
};

const syncAuthenticatedUser = async (firebaseUser: FirebaseUser): Promise<AuthUserProfile> => {
  await setAuthCookies(firebaseUser);

  try {
    const result = await authApi.me();
    if (result.success && result.data) {
      return normalizeProfile(result.data, firebaseUser);
    }
  } catch (error) {
    console.error("Failed to hydrate auth profile:", error);
  }

  return defaultProfile(firebaseUser);
};

const applyProfileToStore = (profile: AuthUserProfile | null) => {
  const { setUser } = useUserStore.getState();
  setUser(profile);
  resolvePostAuthRoute(profile);
  return profile;
};

export const resolvePostAuthRoute = (profile?: Pick<AuthUserProfile, "role" | "isOnboarded"> | null) => {
  if (!profile || !profile.isOnboarded) {
    return "/onboarding";
  }

  switch (profile.role) {
    case "ADMIN":
      return "/admin/dashboard";
    case "OWNER":
      return "/owner/pois";
    default:
      return "/home";
  }
};

export const signInWithGoogle = async () => {
  const result = await signInWithPopup(auth, provider);
  const profile = await syncAuthenticatedUser(result.user);
  applyProfileToStore(profile);
  return profile;
};

export const signInWithEmail = async (email: string, password: string) => {
  const result = await signInWithEmailAndPassword(auth, email, password);
  const profile = await syncAuthenticatedUser(result.user);
  applyProfileToStore(profile);
  return profile;
};

export const registerWithEmail = async (email: string, password: string, displayName: string) => {
  const result = await createUserWithEmailAndPassword(auth, email, password);

  if (displayName) {
    await updateFirebaseProfile(result.user, { displayName });
  }

  try {
    const created = await authApi.register({ displayName, email, password });
    if (created.success && created.data) {
      const normalized = normalizeProfile(created.data, result.user);
      applyProfileToStore(normalized);
      await setAuthCookies(result.user);
      return normalized;
    }
  } catch (error) {
    console.error("Backend register failed, falling back to profile sync:", error);
  }

  const profile = await syncAuthenticatedUser(result.user);
  applyProfileToStore(profile);
  return profile;
};

export const signOut = async () => {
  await firebaseSignOut(auth);
  clearAuthCookies();

  const { logout } = useUserStore.getState();
  logout();

  toast.success("Đăng xuất thành công");
};

export const listenAuthState = (onReady?: () => void) => {
  let resolved = false;

  const markReady = () => {
    if (!resolved) {
      resolved = true;
      onReady?.();
    }
  };

  const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
    const { setLocationPermission } = useUserStore.getState();

    try {
      if (firebaseUser) {
        const profile = await syncAuthenticatedUser(firebaseUser);
        applyProfileToStore(profile);
      } else {
        clearAuthCookies();
        applyProfileToStore(null);
      }
    } catch (error) {
      console.error("Failed to sync auth state:", error);
      if (firebaseUser) {
        applyProfileToStore(defaultProfile(firebaseUser));
      } else {
        applyProfileToStore(null);
      }
    } finally {
      setLocationPermission(false);
      markReady();
    }
  });

  const unsubscribeToken = onIdTokenChanged(auth, async (firebaseUser) => {
    if (typeof window === "undefined") return;

    if (!firebaseUser) {
      clearAuthCookies();
      return;
    }

    try {
      await setAuthCookies(firebaseUser);
    } catch (error) {
      console.error("Failed to refresh ID token:", error);
    }
  });

  return () => {
    unsubscribeAuth();
    unsubscribeToken();
  };
};
