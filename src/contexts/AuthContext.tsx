import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { mockUsers, credentials } from '@/data/mockData';

interface User {
  id: string;
  email: string;
  full_name: string;
  role: 'admin' | 'client';
}

interface AuthContextType {
  user: User | null;
  profile: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  isAdmin: boolean;
  isClient: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem('mockUser');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const signIn = async (email: string, password: string) => {
    const validCredentials = Object.values(credentials).find(
      cred => cred.email === email && cred.password === password
    );

    if (validCredentials) {
      const foundUser = mockUsers.find(u => u.email === email);
      if (foundUser) {
        setUser(foundUser);
        localStorage.setItem('mockUser', JSON.stringify(foundUser));
        navigate('/');
        return { error: null };
      }
    }

    return { error: { message: 'Invalid credentials' } };
  };

  const signOut = async () => {
    setUser(null);
    localStorage.removeItem('mockUser');
    navigate('/login');
  };

  const isAdmin = user?.role === 'admin';
  const isClient = user?.role === 'client';

  return (
    <AuthContext.Provider
      value={{
        user,
        profile: user,
        loading,
        signIn,
        signOut,
        isAdmin,
        isClient,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
