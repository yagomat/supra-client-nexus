
import { Routes, Route } from "react-router-dom";
import Index from "@/pages/Index";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import ListaClientes from "@/pages/ListaClientes";
import CadastrarCliente from "@/pages/CadastrarCliente";
import EditarCliente from "@/pages/EditarCliente";
import BancoDados from "@/pages/BancoDados";
import Configuracoes from "@/pages/Configuracoes";
import AlterarSenha from "@/pages/AlterarSenha";
import Cadastro from "@/pages/Cadastro";
import NotFound from "@/pages/NotFound";
import Templates from "@/pages/Templates";
import MigracaoDados from "@/pages/MigracaoDados";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

const AppRoutes = () => {
  return (
    <Routes>
      {/* Rotas públicas */}
      <Route path="/" element={<Index />} />
      <Route path="/login" element={<Login />} />
      <Route path="/cadastro" element={<Cadastro />} />
      
      {/* Rotas protegidas */}
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      } />
      <Route path="/clientes" element={
        <ProtectedRoute>
          <ListaClientes />
        </ProtectedRoute>
      } />
      <Route path="/clientes/cadastrar" element={
        <ProtectedRoute>
          <CadastrarCliente />
        </ProtectedRoute>
      } />
      <Route path="/clientes/editar/:id" element={
        <ProtectedRoute>
          <EditarCliente />
        </ProtectedRoute>
      } />
      <Route path="/banco-dados" element={
        <ProtectedRoute>
          <BancoDados />
        </ProtectedRoute>
      } />
      <Route path="/configuracoes" element={
        <ProtectedRoute>
          <Configuracoes />
        </ProtectedRoute>
      } />
      <Route path="/alterar-senha" element={
        <ProtectedRoute>
          <AlterarSenha />
        </ProtectedRoute>
      } />
      <Route path="/templates" element={
        <ProtectedRoute>
          <Templates />
        </ProtectedRoute>
      } />
      <Route path="/migracao-dados" element={
        <ProtectedRoute>
          <MigracaoDados />
        </ProtectedRoute>
      } />
      
      {/* Rota 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
