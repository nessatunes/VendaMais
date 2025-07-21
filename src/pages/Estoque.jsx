import React, { useState, useEffect } from "react";
import { Package, Search } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

// Componentes UI simplificados (mantendo o estilo original)
const Card = ({ children, className = "" }) => (
  <div
    className={`bg-white/10 backdrop-blur-md rounded-xl border border-white/20 ${className}`}
  >
    {children}
  </div>
);

const CardContent = ({ children, className = "" }) => (
  <div className={`p-6 ${className}`}>{children}</div>
);

const CardHeader = ({ children, className = "" }) => (
  <div className={`px-6 py-4 border-b border-white/10 ${className}`}>
    {children}
  </div>
);

const CardTitle = ({ children, className = "" }) => (
  <h3 className={`text-lg font-semibold text-white ${className}`}>
    {children}
  </h3>
);

const Input = ({ className = "", ...props }) => (
  <input
    {...props}
    className={`w-full px-4 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 ${className}`}
  />
);

function Estoque() {
  const [produtos, setProdutos] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulando busca no Supabase (substitua pela sua implementação)
    const fetchProdutos = async () => {
      setLoading(true);
      try {
        const { data } = await supabase.from("produtos").select("*");

        setProdutos(data || []);
      } catch (error) {
        console.error("Erro ao buscar produtos:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProdutos();
  }, []);

  const getStockStatus = (estoque) => {
    if (estoque === 0)
      return {
        text: "Sem estoque",
        color: "bg-red-500/20 text-red-400",
        level: 0,
      };
    if (estoque < 10)
      return {
        text: "Estoque baixo",
        color: "bg-yellow-500/20 text-yellow-400",
        level: (estoque / 10) * 50,
      };
    return {
      text: "Em estoque",
      color: "bg-green-500/20 text-green-400",
      level: Math.min(50 + (estoque - 10), 100),
    };
  };

  const filteredProdutos = produtos
    .filter(
      (produto) =>
        produto.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        produto.categoria.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => a.estoque - b.estoque);

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
          <span className="ml-3 text-white">Carregando produtos...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-4xl font-bold gradient-text">
            Controle de Estoque
          </h1>
          <p className="text-gray-400">
            Visualize os níveis de estoque dos seus produtos
          </p>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          placeholder="Buscar produtos..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 bg-white/5 border-white/20"
        />
      </div>

      <Card>
        <CardHeader>
          <div className="hidden md:grid md:grid-cols-6 gap-4 font-semibold text-gray-400 px-6">
            <div className="col-span-2">Produto</div>
            <div>Categoria</div>
            <div>Status</div>
            <div className="col-span-2">Nível de Estoque</div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredProdutos.length > 0 ? (
              filteredProdutos.map((produto) => {
                const status = getStockStatus(produto.estoque);
                return (
                  <div
                    key={produto.id}
                    className="grid grid-cols-1 md:grid-cols-6 gap-4 items-center p-4 md:px-6 bg-white/5 rounded-lg hover:bg-white/10 transition-colors duration-200"
                  >
                    <div className="col-span-2 font-semibold text-white">
                      {produto.nome}
                    </div>
                    <div className="text-blue-400">{produto.categoria}</div>
                    <div>
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${status.color}`}
                      >
                        {status.text}
                      </span>
                    </div>
                    <div className="col-span-2 flex items-center gap-4">
                      <div className="w-full bg-slate-700 rounded-full h-2.5">
                        <div
                          className="bg-gradient-to-r from-purple-500 to-blue-500 h-2.5 rounded-full"
                          style={{ width: `${status.level}%` }}
                        ></div>
                      </div>
                      <span className="font-bold text-lg w-12 text-right">
                        {produto.estoque}
                      </span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-12">
                <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-300 mb-2">
                  Nenhum produto encontrado
                </h3>
                <p className="text-gray-400">
                  Verifique sua busca ou cadastre novos produtos.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default Estoque;
