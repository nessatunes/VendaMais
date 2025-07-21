import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import { Toaster } from "@/components/ui/toaster";
import Layout from "@/components/Layout";
import Dashboard from "@/pages/Dashboard";
import Clientes from "@/pages/Clientes";
import Produtos from "@/pages/Produtos";
import Vendas from "@/pages/Vendas";
import Relatorios from "@/pages/Relatorios";
import Estoque from "@/pages/Estoque";
import Login from "@/pages/Login";
import { AuthProvider } from "@/contexts/AuthContext";
import { useAuth } from "@/hooks/useAuth";
import ProtectedRoute from "@/components/ProtectedRoute";

function AppRoutes() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/" /> : <Login />}
      />
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <Layout>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/clientes" element={<Clientes />} />
                <Route path="/produtos" element={<Produtos />} />
                <Route path="/vendas" element={<Vendas />} />
                <Route path="/relatorios" element={<Relatorios />} />
                <Route path="/estoque" element={<Estoque />} />
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </Layout>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Helmet>
        <title>VendasPro - Sistema de Gestão</title>
        <meta
          name="description"
          content="Sistema de gestão de vendas com clientes, produtos e relatórios avançados"
        />
      </Helmet>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
      <Toaster />
    </AuthProvider>
  );
}

export default App;
