
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./contexts/AuthContext";
import Login from "./pages/Login";
import Cadastro from "./pages/Cadastro";
import AlterarSenha from "./pages/AlterarSenha";
import Dashboard from "./pages/Dashboard";
import CadastrarCliente from "./pages/CadastrarCliente";
import EditarCliente from "./pages/EditarCliente";
import ListaClientes from "./pages/ListaClientes";
import GestaoPagamentos from "./pages/GestaoPagamentos";
import BancoDados from "./pages/BancoDados";
import WhatsappMessenger from "./pages/WhatsappMessenger";
import NotFound from "./pages/NotFound";
import { SessionExpireAlert } from "./components/SessionExpireAlert";

interface PrivateRouteProps {
  children: React.ReactNode;
}

const PrivateRoute = ({ children }: PrivateRouteProps) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (!user) {
    // Save the attempted url for redirecting after login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  return (
    <>
      {children}
      <SessionExpireAlert />
    </>
  );
};

export const AppRoutes = () => {
  const { user, loading } = useAuth();

  return (
    <Routes>
      <Route path="/" element={<Navigate to={user ? "/dashboard" : "/login"} replace />} />
      <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <Login />} />
      <Route path="/cadastro" element={user ? <Navigate to="/dashboard" replace /> : <Cadastro />} />
      
      <Route path="/alterar-senha" element={<PrivateRoute><AlterarSenha /></PrivateRoute>} />
      <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
      <Route path="/clientes" element={<PrivateRoute><ListaClientes /></PrivateRoute>} />
      <Route path="/clientes/cadastrar" element={<PrivateRoute><CadastrarCliente /></PrivateRoute>} />
      <Route path="/clientes/editar/:id" element={<PrivateRoute><EditarCliente /></PrivateRoute>} />
      <Route path="/pagamentos" element={<PrivateRoute><GestaoPagamentos /></PrivateRoute>} />
      <Route path="/whatsapp" element={<PrivateRoute><WhatsappMessenger /></PrivateRoute>} />
      <Route path="/banco-dados" element={<PrivateRoute><BancoDados /></PrivateRoute>} />
      
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};
