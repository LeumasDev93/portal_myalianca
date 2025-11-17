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

  const STORAGE_USER_KEY = "user";
  const STORAGE_TOKEN_KEY = "token";

  const wipeClientStorage = useCallback(() => {
    try {
      sessionStorage.clear();
    } catch (error) {
      console.warn("[AUTH] Falha ao limpar sessionStorage:", error);
    }

    try {
      localStorage.clear();
    } catch (error) {
      console.warn("[AUTH] Falha ao limpar localStorage:", error);
    }
  }, []);

  const persistAuthData = useCallback((userData: User, tokenValue: string) => {
    try {
      sessionStorage.setItem(STORAGE_USER_KEY, JSON.stringify(userData));
      sessionStorage.setItem(STORAGE_TOKEN_KEY, tokenValue);
    } catch (error) {
      console.warn("[AUTH] Falha ao gravar sessionStorage:", error);
    }

    try {
      localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(userData));
      localStorage.setItem(STORAGE_TOKEN_KEY, tokenValue);
    } catch (error) {
      console.warn("[AUTH] Falha ao gravar localStorage:", error);
    }
  }, []);

  const clearAuthData = useCallback(() => {
    wipeClientStorage();
    setUser(null);
    setToken(null);
    clearAuthCookies();
  }, [wipeClientStorage]);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const userData = sessionStorage.getItem(STORAGE_USER_KEY);
        const authToken = sessionStorage.getItem(STORAGE_TOKEN_KEY);

        console.log("Initializing auth with userData:", userData);

        if (userData && authToken) {
          setUser(JSON.parse(userData));
          setToken(authToken);
          setAuthCookies(authToken);
          return;
        }

        // Fallback para localStorage (outra aba pode ter sessão ativa)
        const localUserData = localStorage.getItem(STORAGE_USER_KEY);
        const localToken = localStorage.getItem(STORAGE_TOKEN_KEY);

        if (localUserData && localToken) {
          persistAuthData(JSON.parse(localUserData), localToken);
          setUser(JSON.parse(localUserData));
          setToken(localToken);
          setAuthCookies(localToken);
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
                persistAuthData(profile, tokenFromCookie);
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
        wipeClientStorage();

        const response = await axios.post("/api/auth/login", {
          username,
          password,
        });

        const { token, ...userData } = response.data;

        persistAuthData(userData, token);
        setUser(userData);
        setToken(token);
        setAuthCookies(token);

        router.replace("/backoffice");
        // Mantém isLoading=true até a página carregar
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
        setIsLoading(false); // Só desativa loading em caso de erro
        throw error;
      }
    },
    [router, searchParams, clearAuthData, wipeClientStorage]
  );

  const logout = useCallback(async () => {
    clearAuthData();
    setIsLoading(false); // Garante que loading está desativado ao fazer logout
    router.push("/login");
  }, [router, clearAuthData]);

  useEffect(() => {
    if (isLoading) return;

    const publicRoutes = ["/login", "/signup", "/recuperar-senha", "/"];
    const isPublicRoute = publicRoutes.some((route) =>
      pathname?.startsWith(route)
    );

    // CRÍTICO: Verifica se há parâmetros do SISP - NÃO redireciona se houver
    const hasSispParams = (() => {
      try {
        const sp = new URLSearchParams(window.location.search);
        return (
          sp.has("status_code") ||
          sp.has("transaction_id") ||
          sp.has("finger_print")
        );
      } catch {
        return false;
      }
    })();

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

    // CRÍTICO: Se há parâmetros do SISP, NÃO faz NENHUM redirecionamento
    if (hasSispParams) {
      console.log("[AUTH CONTEXT] 🚨 Parâmetros SISP detectados - NÃO redirecionando");
      return;
    }

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