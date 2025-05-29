// hooks/use-user-profile.ts
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/auth-context";

interface UserProfile {
  nome: string;
  data_nascimento: string;
  nif: number;
  email: string | null;
  telefone: number;
  telemovel: number;
  bi_cni: number;
  passaporte: string;
  username: number;
  tipo_utilizador: string;
  tipo_cliente: string;
  ativo: boolean;
  criado_em: string;
}

export function useUserProfile() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [initialProfile, setInitialProfile] = useState<UserProfile | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user?.id) return;

      try {
        setLoading(true);
        const response = await fetch(`/api/profile?user_id=${user.id}`);

        if (!response.ok) {
          throw new Error(`Erro ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();

        if (data.get_profile_by_user_id_element) {
          const profileData = data.get_profile_by_user_id_element;
          setProfile(profileData);
          setInitialProfile(profileData);
        } else {
          throw new Error("Estrutura de dados inesperada da API");
        }
      } catch (err) {
        console.error("Erro ao buscar perfil:", err);
        setError(err instanceof Error ? err.message : "Erro desconhecido");
        toast({
          title: "Erro",
          description: "Falha ao carregar dados do perfil",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user?.id, toast]);

  useEffect(() => {
    if (profile && initialProfile) {
      const changesExist = Object.keys(profile).some(
        (key) =>
          profile[key as keyof UserProfile] !==
          initialProfile[key as keyof UserProfile]
      );
      setHasChanges(changesExist);
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
    if (initialProfile && profile) {
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
