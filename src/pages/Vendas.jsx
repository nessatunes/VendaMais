import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Plus,
  Search,
  Eye,
  Trash2,
  ShoppingCart,
  Calendar,
  DollarSign,
  User,
  CreditCard,
  QrCode,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabaseClient";
import NovaVendaForm from "@/components/vendas/NovaVendaForm";
import VendaDetails from "@/components/vendas/VendaDetails";

function Vendas() {
  const [vendas, setVendas] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isNewSaleDialogOpen, setIsNewSaleDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedVenda, setSelectedVenda] = useState(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Carregar vendas do Supabase
  const carregarVendas = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("vendas")
        .select(
          `
        id,
        cliente_id,
        data_venda,
        subtotal,
        desconto,
        acrescimo,
        total,
        metodo_pagamento,
        observacoes,
        status,
        clientes (nome)
      `
        )
        .order("data_venda", { ascending: false });

      if (error) throw error;

      console.log("Vendas carregadas:", data);
      setVendas(data || []);
    } catch (error) {
      console.error("Erro ao carregar vendas:", error);
      toast({
        title: "Erro",
        description: "Erro ao carregar vendas do banco de dados.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarVendas();
  }, []);

  // Callback para quando uma venda é criada - apenas recarregar a lista
  const handleSaleCreated = async () => {
    await carregarVendas();
    setIsNewSaleDialogOpen(false);
    toast({
      title: "Sucesso!",
      description: "Venda registrada com sucesso!",
    });
  };

  // Deletar venda
  const handleDelete = async (id) => {
    if (!confirm("Tem certeza que deseja excluir esta venda?")) {
      return;
    }

    try {
      // Deletar itens da venda primeiro
      const { error: itensError } = await supabase
        .from("itens_venda")
        .delete()
        .eq("venda_id", id);

      if (itensError) throw itensError;

      // Deletar venda
      const { error: vendaError } = await supabase
        .from("vendas")
        .delete()
        .eq("id", id);

      if (vendaError) throw vendaError;

      toast({
        title: "Venda removida",
        description: "Venda foi removida com sucesso!",
      });

      // Recarregar vendas
      await carregarVendas();
    } catch (error) {
      console.error("Erro ao deletar venda:", error);
      toast({
        title: "Erro",
        description: "Erro ao remover venda do banco de dados.",
        variant: "destructive",
      });
    }
  };

  // Visualizar venda
  const handleView = async (venda) => {
    try {
      // Carregar itens da venda
      const { data: itens, error: itensError } = await supabase
        .from("itens_venda")
        .select("*")
        .eq("venda_id", venda.id);

      if (itensError) throw itensError;

      setSelectedVenda({ ...venda, itens });
      setIsViewDialogOpen(true);
    } catch (error) {
      console.error("Erro ao carregar detalhes da venda:", error);
      toast({
        title: "Erro",
        description: "Erro ao carregar detalhes da venda.",
        variant: "destructive",
      });
    }
  };

  // Filtrar vendas
  const filteredVendas = vendas.filter(
    (venda) =>
      (venda.clientes?.nome || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      venda.id.toString().includes(searchTerm)
  );

  const PaymentIcon = ({ method, className }) => {
    switch (method) {
      case "À vista":
        return <DollarSign className={className} />;
      case "Cartão":
        return <CreditCard className={className} />;
      case "Pix":
        return <QrCode className={className} />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-4xl font-bold gradient-text">Vendas</h1>
          <p className="text-gray-400">Gerencie suas vendas e pedidos</p>
        </div>

        <Dialog
          open={isNewSaleDialogOpen}
          onOpenChange={setIsNewSaleDialogOpen}
        >
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700">
              <Plus className="w-4 h-4 mr-2" />
              Nova Venda
            </Button>
          </DialogTrigger>
          <DialogContent className="glass-effect border-white/20 max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="gradient-text">Nova Venda</DialogTitle>
            </DialogHeader>
            <NovaVendaForm onSaleCreated={handleSaleCreated} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          placeholder="Buscar vendas por cliente ou ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 bg-white/5 border-white/20"
        />
      </div>

      <div className="space-y-4">
        {filteredVendas.map((venda, index) => (
          <motion.div
            key={venda.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <Card className="card-hover">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-4 lg:space-y-0">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <ShoppingCart className="w-5 h-5 text-purple-400" />
                        <span className="font-semibold text-white">
                          Venda #{venda.id.toString().slice(-8)}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <User className="w-4 h-4 text-blue-400" />
                        <span className="text-gray-300">
                          {venda.clientes?.nome || "Cliente Desconhecido"}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4" />
                        <span>
                          {new Date(venda.data_venda).toLocaleDateString(
                            "pt-BR"
                          )}
                        </span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <DollarSign className="w-4 h-4" />
                        <span>R$ {venda.total.toFixed(2)}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <PaymentIcon
                          method={venda.metodo_pagamento}
                          className="w-4 h-4"
                        />
                        <span>{venda.metodo_pagamento}</span>
                      </div>
                      <div className="px-2 py-1 bg-green-500/20 text-green-400 rounded-full text-xs">
                        {venda.status}
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleView(venda)}
                      className="border-white/20 hover:bg-blue-500/20"
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      Ver Detalhes
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(venda.id)}
                      className="border-red-500/50 text-red-400 hover:bg-red-500/20"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="glass-effect border-white/20 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="gradient-text">
              Detalhes da Venda #{selectedVenda?.id.toString().slice(-8)}
            </DialogTitle>
          </DialogHeader>
          <VendaDetails venda={selectedVenda} />
        </DialogContent>
      </Dialog>

      {filteredVendas.length === 0 && (
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShoppingCart className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-300 mb-2">
            {searchTerm
              ? "Nenhuma venda encontrada"
              : "Nenhuma venda registrada"}
          </h3>
          <p className="text-gray-400">
            {searchTerm
              ? "Tente buscar com outros termos"
              : "Comece registrando sua primeira venda"}
          </p>
        </div>
      )}
    </div>
  );
}

export default Vendas;
