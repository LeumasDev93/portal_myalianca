"use client";
/* eslint-disable react-hooks/exhaustive-deps */
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
  tipo: "cliente" | "empresarial";
  criado_em?: string;
  ativo?: boolean;
  nif?: string;
  email?: string;
  token: string;
  session_id: string;
};

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  currentProfile: "cliente" | "empresarial";
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
    // Cookie de sessão sem max-age. 
    // SameSite=Lax para funcionar em redirects same-site (padrão)
    // Se precisar de cross-site, usar SameSite=None; Secure (requer HTTPS)
    const isSecure = typeof window !== 'undefined' && window.location.protocol === 'https:';
    const sameSite = isSecure ? 'SameSite=None; Secure' : 'SameSite=Lax';
    document.cookie = `token=${token}; path=/; ${sameSite}`;
  }; 

  const clearAuthCookies = () => {
    document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
  };

  const clearAuthData = useCallback(() => {
    sessionStorage.removeItem("user");
    sessionStorage.removeItem("token");
    setUser(null);
    setToken(null);
    clearAuthCookies();
  }, []);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const userData = sessionStorage.getItem("user");
        const authToken = sessionStorage.getItem("token");

        console.log("Initializing auth with userData:", userData);

        if (userData && authToken) {
          setUser(JSON.parse(userData));
          setToken(authToken);
          setAuthCookies(authToken);
        } else {
          // Fallback: usuário pode estar logado em outra aba (cookie presente) mas sem sessionStorage nesta aba
          const cookies = typeof document !== "undefined" ? document.cookie : "";
          const tokenFromCookie = cookies
            .split(";")
            .map((c) => c.trim())
            .find((c) => c.startsWith("token="))
            ?.split("=")[1];

          if (tokenFromCookie) {
            try {
              const res = await fetch("/api/profile", { credentials: "include" });
              if (res.ok) {
                const profile = await res.json();
                sessionStorage.setItem("user", JSON.stringify(profile));
                sessionStorage.setItem("token", tokenFromCookie);
                setUser(profile);
                setToken(tokenFromCookie);
                setAuthCookies(tokenFromCookie);
              } else {
                clearAuthCookies();
              }
            } catch {
              clearAuthCookies();
            }
          } else {
            clearAuthCookies();
          }
        }
      } catch (err) {
        console.error("Auth initialization error:", err);
        clearAuthData();
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, [clearAuthData]);

  const login = useCallback(
    async (username: string, password: string) => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await axios.post("/api/auth/login", {
          username,
          password,
        });

        const { token, ...userData } = response.data;

        sessionStorage.setItem("user", JSON.stringify(userData));

        sessionStorage.setItem("token", token);
        setUser(userData);
        setToken(token);
        setAuthCookies(token);

        router.replace("/backoffice");
      } catch (error) {
        let errorMessage = "";

        if (axios.isAxiosError(error)) {
          errorMessage =
            error.response?.data?.error || // <- aqui
            error.response?.data?.desc ||
            "Credenciais inválidas";
        } else if (error instanceof Error) {
          errorMessage = error.message;
        }

        setError(errorMessage);
        setTimeout(() => setError(null), 5000);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [router, searchParams, clearAuthData]
  );

  const logout = useCallback(async () => {
    clearAuthData();
    router.push("/login");
  }, [router, clearAuthData]);


  useEffect(() => {
    if (isLoading) return;

    const publicRoutes = ["/login", "/signup", "/recuperar-senha", "/"];
    const isPublicRoute = publicRoutes.some((route) =>
      pathname?.startsWith(route)
    );

    // Evita redirecionar para login durante o retorno do pagamento
    const hasPaymentParams = (() => {
      try {
        const sp = new URLSearchParams(window.location.search);
        return (
          sp.has("payment_status") ||
          sp.has("status") ||
          sp.has("reference") ||
          sp.has("merchantRef")
        );
      } catch {
        return false;
      }
    })();

    const hasPostPayCookie = ((): boolean => {
      try {
        return document.cookie.split(";").map(c=>c.trim()).some(c=>c.startsWith("postpay="));
      } catch {
        return false;
      }
    })();

    if (!user && !isPublicRoute) {
      if (hasPaymentParams || hasPostPayCookie) {
        // Aguarda rehidratar via cookie e deixa a página carregar
        return;
      }
      const loginUrl = new URL("/login", window.location.origin);
      loginUrl.searchParams.set("from", pathname || "/");
      router.push(loginUrl.toString());
      return;
    }

    if (user && isPublicRoute && pathname !== "/") {
      router.replace("/backoffice");
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
      currentProfile: user?.tipo || "cliente",
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