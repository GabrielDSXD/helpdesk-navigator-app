import React from "react";
import LoginForm from "@/components/auth/LoginForm";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";

const Login: React.FC = () => {
  const { user, loading } = useAuth();

  // Redirecionamento para home se já estiver autenticado
  if (!loading && user) {
    return <Navigate to="/" replace />;
  }

  // Mostrar carregamento
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Carregando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-secondary">
      <LoginForm />
    </div>
  );
};

export default Login;
