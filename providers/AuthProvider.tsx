import {
  onIdTokenChanged,
  signInWithCredential,
  signInWithPopup,
  signOut,
  GoogleAuthProvider,
  type User,
} from "firebase/auth";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { Platform } from "react-native";
import { auth, googleProvider } from "@/lib/firebase";
import { isAllowedEmail } from "@/lib/domain";

type AuthContextValue = {
  user: User | null;
  role: "admin" | "user" | null;
  loading: boolean;
  roleLoading: boolean;
  signingIn: boolean;
  signingOut: boolean;
  error: string | null;
  signIn: (idToken?: string | null) => Promise<void>;
  signOutUser: () => Promise<void>;
  clearError: () => void;
  reportError: (message: string) => void;
};

const ACCESS_ERROR = "Access restricted. Please login using your official domain email.";
const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<"admin" | "user" | null>(null);
  const [loading, setLoading] = useState(true);
  const [roleLoading, setRoleLoading] = useState(false);
  const [signingIn, setSigningIn] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    let authUpdate = 0;

    const unsubscribe = onIdTokenChanged(auth, async (nextUser) => {
      const currentUpdate = ++authUpdate;

      if (nextUser && (!nextUser.emailVerified || !isAllowedEmail(nextUser.email))) {
        setUser(null);
        setRole(null);
        setRoleLoading(false);
        setError(ACCESS_ERROR);
        try {
          await signOut(auth);
        } catch (signOutError) {
          console.error("Unable to clear a disallowed Firebase session.", signOutError);
        } finally {
          if (active && currentUpdate === authUpdate) setLoading(false);
        }
        return;
      }

      if (!active) return;
      setUser(nextUser);
      setRole(null);
      setRoleLoading(Boolean(nextUser));

      try {
        if (nextUser) {
          const token = await nextUser.getIdTokenResult();
          if (!active || currentUpdate !== authUpdate) return;
          setRole(token.claims.admin === true ? "admin" : "user");
        }
      } catch (roleError) {
        console.error("Unable to load the signed-in user's role claim.", roleError);
        if (active && currentUpdate === authUpdate) {
          setError("Unable to verify your workspace role. Please sign in again.");
        }
      } finally {
        if (active && currentUpdate === authUpdate) {
          setRoleLoading(false);
          setLoading(false);
        }
      }
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  const signIn = useCallback(async (idToken?: string | null) => {
    setError(null);
    setSigningIn(true);
    try {
      if (Platform.OS === "web") {
        await signInWithPopup(auth, googleProvider);
        return;
      }
      if (!idToken) {
        throw new Error("Google did not return an ID token. Check your OAuth client configuration.");
      }
      const credential = GoogleAuthProvider.credential(idToken);
      const result = await signInWithCredential(auth, credential);
      if (!result.user.emailVerified || !isAllowedEmail(result.user.email)) {
        await signOut(auth);
        throw new Error(ACCESS_ERROR);
      }
    } catch (signInError) {
      const message = signInError instanceof Error ? signInError.message : "Google sign-in failed.";
      setError(message.includes("popup-closed-by-user") ? null : message);
      throw signInError;
    } finally {
      setSigningIn(false);
    }
  }, []);

  const signOutUser = useCallback(async () => {
    setError(null);
    setSigningOut(true);
    try {
      await signOut(auth);
    } catch (signOutError) {
      setError("Unable to log out right now. Please try again.");
      throw signOutError;
    } finally {
      setSigningOut(false);
    }
  }, []);

  const value = useMemo(() => ({
    user,
    role,
    loading,
    roleLoading,
    signingIn,
    signingOut,
    error,
    signIn,
    signOutUser,
    clearError: () => setError(null),
    reportError: setError,
  }), [user, role, loading, roleLoading, signingIn, signingOut, error, signIn, signOutUser]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider.");
  }
  return context;
}
