import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface Profile {
  id: string;
  email: string;
  full_name?: string;
  role?: 'admin' | 'client';
}

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  isAdmin: boolean;
  isClient: boolean;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<any>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(() => {
    // Initialize profile from localStorage if available
    const stored = localStorage.getItem('user_profile');
    return stored ? JSON.parse(stored) : null;
  });
  const [loading, setLoading] = useState(true);
  const lastFetchedUserId = React.useRef<string | null>(null);

  const fetchProfile = async (currentSession: Session | null) => {
    const currentUserId = currentSession?.user?.id;

    // Always update session and user state
    setSession(currentSession);
    setUser(currentSession?.user ?? null);

    // If no user, clear profile and return
    if (!currentUserId) {
      setProfile(null);
      localStorage.removeItem('user_profile');
      lastFetchedUserId.current = null;
      setLoading(false);
      return;
    }

    // If we already fetched for this user, just ensure loading is false
    if (lastFetchedUserId.current === currentUserId) {
      setLoading(false);
      return;
    }

    lastFetchedUserId.current = currentUserId;

    try {
      const { data: profileData, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', currentUserId)
        .single();

      if (profileData && !error) {
        console.log('Profile loaded:', profileData.role);
        const newProfile = {
          id: profileData.id,
          email: profileData.email,
          full_name: profileData.full_name,
          role: profileData.role as 'admin' | 'client'
        };
        setProfile(newProfile);
        localStorage.setItem('user_profile', JSON.stringify(newProfile));
      } else {
        console.warn('Profile fetch failed or empty, using fallback logic.', { error, profileData });

        // Try to recover from localStorage first if it matches current user
        const stored = localStorage.getItem('user_profile');
        if (stored) {
          const storedProfile = JSON.parse(stored);
          if (storedProfile.id === currentUserId) {
            console.log('Recovered profile from localStorage');
            setProfile(storedProfile);
            setLoading(false);
            return;
          }
        }

        // Check if email belongs to a known admin (fallback for demo/dev)
        const email = currentSession.user.email || '';
        const isKnownAdmin = email === 'sarah.davis@example.com' || email === 'mary.lopez@example.com';

        const fallbackProfile = {
          id: currentUserId,
          email: email,
          full_name: currentSession.user.user_metadata?.full_name || email.split('@')[0],
          role: (isKnownAdmin ? 'admin' : 'client') as 'admin' | 'client'
        };
        setProfile(fallbackProfile);
      }
    } catch (error) {
      console.error('Error in auth state change:', error);

      // Try to recover from localStorage first
      const stored = localStorage.getItem('user_profile');
      if (stored) {
        const storedProfile = JSON.parse(stored);
        if (storedProfile.id === currentUserId) {
          setProfile(storedProfile);
          setLoading(false);
          return;
        }
      }

      // Fallback to basic user info if profile fetch fails completely
      if (currentSession?.user) {
        const email = currentSession.user.email || '';
        const isKnownAdmin = email === 'sarah.davis@example.com' || email === 'mary.lopez@example.com';

        setProfile({
          id: currentUserId,
          email: email,
          full_name: email.split('@')[0],
          role: isKnownAdmin ? 'admin' : 'client'
        });
      } else {
        setProfile(null);
        localStorage.removeItem('user_profile');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (mounted) {
        fetchProfile(session);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email, password) => {
    return await supabase.auth.signInWithPassword({
      email,
      password,
    });
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setProfile(null);
    localStorage.removeItem('user_profile');
  };

  const value = {
    session,
    user,
    profile,
    isAdmin: profile?.role === 'admin',
    isClient: profile?.role === 'client',
    loading,
    signIn,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
