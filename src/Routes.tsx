
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

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/login" element={<Login />} />
      <Route path="/cadastro" element={<Cadastro />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/clientes" element={<ListaClientes />} />
      <Route path="/clientes/cadastrar" element={<CadastrarCliente />} />
      <Route path="/clientes/editar/:id" element={<EditarCliente />} />
      <Route path="/banco-dados" element={<BancoDados />} />
      <Route path="/configuracoes" element={<Configuracoes />} />
      <Route path="/alterar-senha" element={<AlterarSenha />} />
      <Route path="/templates" element={<Templates />} />
      <Route path="/migracao-dados" element={<MigracaoDados />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
