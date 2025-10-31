/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";

interface UserProfile {
  user: {
    id: string;
    nome: string;
    username: string;
    tipo: string;
    ativo: boolean;
    nif: string;
    email: string;
    telefone: string;
    morada: string | null;
    telemovel: string;
    display_name: string;
    cliente_id: string;
    cliente_nome: string;
    criado_em: string;
    imagem_id: string;
    tipo_utilizador: string;
  };
  session_id: string | null;
}

export function useUserProfile(initialData?: UserProfile) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [initialProfile, setInitialProfile] = useState<UserProfile | null>(
    initialData || null
  );

  const [hasChanges, setHasChanges] = useState(false);
  const [loading, setLoading] = useState(!initialData);
  const [error, setError] = useState<null | string>(null);

  // ✅ Carrega perfil: localStorage -> session (/api/auth/session)
  useEffect(() => {
    if (typeof window === "undefined") return; // SSR check

    const tryLoadLocal = (): UserProfile | null => {
      // chaves possíveis onde o app possa ter salvo o usuário
      const keysToTry = ["user", "profile", "userProfile"];
      for (const key of keysToTry) {
        const raw = localStorage.getItem(key);
        if (!raw) continue;
        try {
          const parsed = JSON.parse(raw) as unknown;
          // pode vir como UserProfile direto
          if (parsed && typeof parsed === 'object' && 'user' in (parsed as Record<string, unknown>)) {
            return parsed as UserProfile;
          }
          // ou apenas o objeto user sem wrapper
          if (parsed && typeof parsed === 'object' && 'tipo_utilizador' in (parsed as Record<string, unknown>)) {
            return { user: parsed as UserProfile['user'], session_id: null } as UserProfile;
          }
        } catch {
          // ignora e tenta próxima chave
        }
      }
      return null;
    };

    const load = async () => {
      setLoading(true);
      const local = tryLoadLocal();
      if (local) {
        setProfile(local);
        setInitialProfile(local);
        setError(null);
        setLoading(false);
        return;
      }

      // Fallback: tenta sessão do NextAuth
      try {
        const res = await fetch('/api/auth/session', { cache: 'no-store' });
        if (res.ok) {
          const data = (await res.json()) as { user?: unknown };
          if (data?.user && typeof data.user === 'object') {
            const u = data.user as Record<string, unknown>;
            // mapeia para UserProfile esperado se possível
            if ('tipo_utilizador' in u) {
              const mapped: UserProfile = {
                user: {
                  id: String(u['id'] ?? ''),
                  nome: String(u['nome'] ?? ''),
                  username: String(u['username'] ?? ''),
                  tipo: String(u['tipo'] ?? ''),
                  ativo: Boolean(u['ativo'] ?? true),
                  nif: String(u['nif'] ?? ''),
                  email: String(u['email'] ?? ''),
                  telefone: String(u['telefone'] ?? ''),
                  morada: (u['morada'] as string) ?? null,
                  telemovel: String(u['telemovel'] ?? ''),
                  display_name: String(u['display_name'] ?? ''),
                  cliente_id: String(u['cliente_id'] ?? ''),
                  cliente_nome: String(u['cliente_nome'] ?? ''),
                  criado_em: String(u['criado_em'] ?? ''),
                  imagem_id: String(u['imagem_id'] ?? ''),
                  tipo_utilizador: String(u['tipo_utilizador'] ?? ''),
                },
                session_id: null,
              };
              setProfile(mapped);
              setInitialProfile(mapped);
              setError(null);
              setLoading(false);
              return;
            }
          }
        }
        setError("Dados do usuário não encontrados.");
      } catch {
        setError("Erro ao carregar dados do usuário.");
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, []);

  // ✅ Detecta mudanças entre profile atual e original
  useEffect(() => {
    if (profile && initialProfile) {
      const changed = Object.keys(profile).some(
        (key) =>
          profile[key as keyof UserProfile] !==
          initialProfile[key as keyof UserProfile]
      );
      setHasChanges(changed);
    } else {
      setHasChanges(false);
    }
  }, [profile, initialProfile]);


  
  const updateProfile = (newProfile: UserProfile) => {
    setProfile(newProfile);
  };

  const resetChanges = () => {
    if (initialProfile) {
      setProfile(initialProfile);
      setHasChanges(false);
    }
  };

  const saveChanges = () => {
    if (profile) {
      setInitialProfile(profile);
      setHasChanges(false);
    }
  };

  return {
    profile,
    initialProfile,
    loading,
    error,
    hasChanges,
    updateProfile,
    resetChanges,
    saveChanges,
  };
}
