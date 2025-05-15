
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./contexts/AuthContext";
import Login from "./pages/Login";
import Cadastro from "./pages/Cadastro";
import Dashboard from "./pages/Dashboard";
import CadastrarCliente from "./pages/CadastrarCliente";
import ListaClientes from "./pages/ListaClientes";
import GestaoPagamentos from "./pages/GestaoPagamentos";
import BancoDados from "./pages/BancoDados";
import NotFound from "./pages/NotFound";

interface PrivateRouteProps {
  children: React.ReactNode;
}

const PrivateRoute = ({ children }: PrivateRouteProps) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

export const AppRoutes = () => {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/" element={user ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />} />
      <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <Login />} />
      <Route path="/cadastro" element={user ? <Navigate to="/dashboard" replace /> : <Cadastro />} />
      
      <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
      <Route path="/clientes" element={<PrivateRoute><ListaClientes /></PrivateRoute>} />
      <Route path="/clientes/cadastrar" element={<PrivateRoute><CadastrarCliente /></PrivateRoute>} />
      <Route path="/pagamentos" element={<PrivateRoute><GestaoPagamentos /></PrivateRoute>} />
      <Route path="/banco-dados" element={<PrivateRoute><BancoDados /></PrivateRoute>} />
      
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};
