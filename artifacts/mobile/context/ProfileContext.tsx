import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { loadProfile, saveProfile, type StudentProfile } from '@/services/sessionStorage';

// ─────────────────────────────────────────────────────────────────
// Profile Context — student name and first-launch state
// ─────────────────────────────────────────────────────────────────

interface ProfileContextValue {
  profile: StudentProfile | null;
  isLoading: boolean;
  isFirstLaunch: boolean;
  setStudentName: (name: string) => Promise<void>;
}

const ProfileContext = createContext<ProfileContextValue>({
  profile: null,
  isLoading: true,
  isFirstLaunch: true,
  setStudentName: async () => {},
});

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadProfile().then((p) => {
      setProfile(p);
      setIsLoading(false);
    });
  }, []);

  const setStudentName = useCallback(async (name: string) => {
    const newProfile: StudentProfile = {
      name: name.trim(),
      createdAt: Date.now(),
    };
    await saveProfile(newProfile);
    setProfile(newProfile);
  }, []);

  return (
    <ProfileContext.Provider
      value={{
        profile,
        isLoading,
        isFirstLaunch: !profile && !isLoading,
        setStudentName,
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  return useContext(ProfileContext);
}
