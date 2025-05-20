
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '@/types';
import { authService } from '@/services/authService';
import { useToast } from '@/components/ui/use-toast';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, sector: string) => Promise<void>;
  logout: () => void;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('authToken');
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        // Fetch user profile from API
        const userData = await authService.getProfile();
        setUser(userData);
      } catch (error) {
        console.error('Error loading user:', error);
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      await authService.login({ email, password });
      const userData = await authService.getProfile();
      setUser(userData);
      
      toast({
        title: "Login realizado com sucesso",
        description: `Bem-vindo(a) de volta, ${userData.name}!`
      });
    } catch (error) {
      console.error('Login failed:', error);
      toast({
        title: "Erro no login",
        description: "Email ou senha inválidos.",
        variant: "destructive"
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string, sector: string) => {
    setLoading(true);
    try {
      await authService.register({ name, email, password, sector });
      
      // Login after registration
      await authService.login({ email, password });
      const userData = await authService.getProfile();
      setUser(userData);
      
      toast({
        title: "Registro realizado com sucesso",
        description: "Sua conta foi criada com sucesso."
      });
    } catch (error) {
      console.error('Registration failed:', error);
      toast({
        title: "Erro no registro",
        description: "Não foi possível criar sua conta. Verifique seus dados.",
        variant: "destructive"
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };
  
  const logout = () => {
    authService.logout();
    setUser(null);
    toast({
      title: "Logout realizado",
      description: "Você foi desconectado com sucesso."
    });
  };

  const isAdmin = user?.role === 'admin';
  
  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        isAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
