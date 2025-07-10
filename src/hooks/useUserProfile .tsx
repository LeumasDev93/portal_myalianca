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

  // ✅ Pega dados direto do localStorage (já armazenados no login)
  useEffect(() => {
    if (typeof window === "undefined") return; // SSR check

    const storedUser = localStorage.getItem("user");

    if (!storedUser) {
      setError("Dados do usuário não encontrados no localStorage.");
      setLoading(false);
      return;
    }

    try {
      const user: UserProfile = JSON.parse(storedUser);
      setProfile(user);
      setInitialProfile(user);
      setError(null);
    } catch (err: any) {
      console.error("Erro ao processar dados do usuário:", err);
      setError("Erro ao carregar dados do usuário.");
    } finally {
      setLoading(false);
    }
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
