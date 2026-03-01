'use client';

import {
  createContext,
  startTransition,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { useRouter } from 'next/navigation';
import type { Viewer } from '@/lib/domain/types';
import { createClient } from '@/lib/supabase/client';

type AuthSessionContextValue = {
  viewer: Viewer;
  signInWithMagicLink: (email: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
};

const AuthSessionContext = createContext<AuthSessionContextValue | undefined>(undefined);

export function AuthSessionProvider({
  children,
  initialViewer,
}: {
  children: ReactNode;
  initialViewer: Viewer;
}) {
  const router = useRouter();
  const supabase = createClient();
  const [viewer, setViewer] = useState(initialViewer);

  useEffect(() => {
    setViewer(initialViewer);
  }, [initialViewer]);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      startTransition(() => {
        router.refresh();
      });
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router, supabase.auth]);

  async function signInWithMagicLink(email: string) {
    const origin = window.location.origin;
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${origin}/auth/callback`,
      },
    });

    if (error) {
      return { error: error.message };
    }

    return {};
  }

  async function signOut() {
    await supabase.auth.signOut();
    startTransition(() => {
      setViewer(null);
      router.push('/');
      router.refresh();
    });
  }

  return (
    <AuthSessionContext.Provider
      value={{
        viewer,
        signInWithMagicLink,
        signOut,
      }}
    >
      {children}
    </AuthSessionContext.Provider>
  );
}

export function useAuthSession() {
  const context = useContext(AuthSessionContext);

  if (!context) {
    throw new Error('useAuthSession must be used within AuthSessionProvider');
  }

  return context;
}
