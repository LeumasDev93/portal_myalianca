/* eslint-disable react-hooks/exhaustive-deps */
"use client";
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
  useMemo,
} from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import axios from "axios";

type User = {
  id: string;
  nome: string;
  username: string;
  tipo: "particular" | "empresarial";
  sessao: string;
  criado_em?: string;
  ativo?: boolean;
};

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  currentProfile: "particular" | "empresarial";
  clearError: () => void;
  token: string | null;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const setAuthCookies = (token: string) => {
    document.cookie = `token=${token}; path=/; max-age=${
      60 * 60 * 24 * 7
    }; SameSite=Lax`;
  };

  const clearAuthCookies = () => {
    document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
  };

  // Initialize auth state from storage
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const userData = localStorage.getItem("user");
        const authToken = localStorage.getItem("token");

        if (userData && authToken) {
          setUser(JSON.parse(userData));
          setToken(authToken);
          setAuthCookies(authToken);
        }
      } catch (err) {
        console.error("Auth initialization error:", err);
        clearAuthData();
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const clearAuthData = useCallback(() => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUser(null);
    setToken(null);
    clearAuthCookies();
  }, []);

  const login = useCallback(
    async (username: string, password: string) => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await axios.post("/api/auth/login", {
          username,
          password,
        });

        if (!response.data?.user?.sessao) {
          throw new Error("Invalid API response");
        }

        const { user } = response.data;
        const userToken = user.sessao;

        // Store auth data
        localStorage.setItem("user", JSON.stringify(user));
        localStorage.setItem("token", userToken);
        setUser(user);
        setToken(userToken);
        setAuthCookies(userToken);

        // Handle redirect - either to original path or dashboard
        const redirectPath =
          searchParams.get("from") ||
          (user.tipo === "particular" ? "/backoffice" : "/empresarial");
        router.replace(redirectPath);
      } catch (error) {
        let errorMessage = "Login failed";

        if (axios.isAxiosError(error)) {
          errorMessage =
            error.response?.data?.error ||
            error.response?.data?.message ||
            "Invalid credentials";
        }

        clearAuthData();
        setError(errorMessage);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [router, searchParams, clearAuthData]
  );

  const logout = useCallback(async () => {
    clearAuthData();
    clearAuthCookies();
    router.push("/login");
  }, [router]);

  // Sync auth state with route changes
  useEffect(() => {
    if (isLoading) return;

    const publicRoutes = ["/login", "/signup", "/recuperar-senha", "/"];
    const isPublicRoute = publicRoutes.some((route) =>
      pathname?.startsWith(route)
    );

    if (!user && !isPublicRoute) {
      const loginUrl = new URL("/login", window.location.origin);
      loginUrl.searchParams.set("from", pathname || "/");
      router.push(loginUrl.toString());
      return;
    }

    if (user && isPublicRoute && pathname !== "/") {
      router.replace(
        user.tipo === "particular" ? "/backoffice" : "/empresarial"
      );
    }
  }, [user, isLoading, pathname, router]);

  const contextValue = useMemo(
    () => ({
      user,
      isLoading,
      error,
      login,
      logout,
      isAuthenticated: !!user,
      currentProfile: user?.tipo || "particular",
      clearError: () => setError(null),
      token,
    }),
    [user, isLoading, error, login, logout, token]
  );

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
