/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";

interface UserProfile {
  id: string;
  nome: string;
  username: string;
  tipo: string;
  ativo: true;
  nif: string;
  email: string;
  token: string;
  cliente_id: string;
  cliente_nome: string;
  criado_em: string;
  session_id: string;
}

export function useUserProfile(initialData?: UserProfile) {
  const [profile, setProfile] = useState<UserProfile | null>(
    initialData || null
  );
  const [initialProfile, setInitialProfile] = useState<UserProfile | null>(
    initialData || null
  );
  const [hasChanges, setHasChanges] = useState(false);
  const [loading, setLoading] = useState(!initialData);
  const [error, setError] = useState<null | string>(null);

  // ✅ Fetch profile from API using localStorage user_id
  useEffect(() => {
    const fetchProfile = async () => {
      if (typeof window === "undefined") return; // SSR protection

      const user = localStorage.getItem("user");
      //console.log("Stored user_id:", user);

      const userId = user ? JSON.parse(user).id : null;

      if (!userId) {
        setError("user_id not found in localStorage");
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`/api/profile?user=${userId}`);
        if (!res.ok) {
          throw new Error(`Failed to fetch profile: ${res.status}`);
        }

        const data = await res.json();
        setProfile(data);
        setInitialProfile(data);
        setError(null);
      } catch (err: any) {
        console.error("Profile fetch error:", err);
        setError(err.message || "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  // ✅ Detect changes between current and initial profile
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
