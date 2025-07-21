import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import {
  Plus,
  Trash2,
  DollarSign,
  CreditCard,
  QrCode,
  Search,
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

function NovaVendaForm({ onSaleCreated }) {
  const [clientes, setClientes] = useState([]);
  const [produtos, setProdutos] = useState([]);
  const [searchCliente, setSearchCliente] = useState("");
  const [filteredClientes, setFilteredClientes] = useState([]);
  const [formData, setFormData] = useState({
    clienteId: "",
    itens: [{ produtoId: "", quantidade: 1, preco: 0, produtoNome: "" }],
    desconto: 0,
    acrescimo: 0,
    metodoPagamento: "À vista",
    observacoes: "",
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  // Carregar clientes e produtos do Supabase
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Carregar clientes
        const { data: clientesData, error: clientesError } = await supabase
          .from("clientes")
          .select("id, nome, email")
          .order("nome");

        if (clientesError) throw clientesError;
        setClientes(clientesData || []);

        // Carregar produtos
        const { data: produtosData, error: produtosError } = await supabase
          .from("produtos")
          .select("id, nome, preco")
          .order("nome");

        if (produtosError) throw produtosError;
        setProdutos(produtosData || []);
      } catch (error) {
        console.error("Erro ao carregar dados:", error.message);
        toast({
          title: "Erro",
          description: "Erro ao carregar clientes ou produtos.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [toast]);

  // Filtrar clientes com base no termo de busca
  useEffect(() => {
    setFilteredClientes(
      clientes.filter((cliente) =>
        cliente.nome.toLowerCase().includes(searchCliente.toLowerCase())
      )
    );
  }, [searchCliente, clientes]);

  // Atualizar formData quando um produto é selecionado
  const handleProdutoChange = (index, produtoId) => {
    const produto = produtos.find((p) => p.id === produtoId);
    const newItens = [...formData.itens];
    newItens[index] = {
      ...newItens[index],
      produtoId,
      produtoNome: produto?.nome || "",
      preco: produto?.preco || 0,
    };
    setFormData({ ...formData, itens: newItens });
  };

  // Adicionar novo item
  const addItem = () => {
    setFormData({
      ...formData,
      itens: [
        ...formData.itens,
        { produtoId: "", quantidade: 1, preco: 0, produtoNome: "" },
      ],
    });
  };

  // Remover item
  const removeItem = (index) => {
    setFormData({
      ...formData,
      itens: formData.itens.filter((_, i) => i !== index),
    });
  };

  // Atualizar quantidade ou preço
  const updateItem = (index, field, value) => {
    const newItens = [...formData.itens];
    newItens[index] = {
      ...newItens[index],
      [field]: parseFloat(value) || (field === "quantidade" ? 1 : 0),
    };
    setFormData({ ...formData, itens: newItens });
  };

  // Calcular total
  const calculateTotal = () => {
    const subtotal = formData.itens.reduce(
      (sum, item) => sum + item.quantidade * item.preco,
      0
    );
    return (
      subtotal -
      (parseFloat(formData.desconto) || 0) +
      (parseFloat(formData.acrescimo) || 0)
    );
  };

  // Submeter formulário
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (submitting) return;

    if (!formData.clienteId) {
      toast({
        title: "Erro",
        description: "Selecione um cliente.",
        variant: "destructive",
      });
      return;
    }

    if (
      formData.itens.length === 0 ||
      formData.itens.some((item) => !item.produtoId)
    ) {
      toast({
        title: "Erro",
        description: "Adicione pelo menos um produto válido.",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);

    try {
      // Calcular valores
      const subtotal = formData.itens.reduce(
        (sum, item) => sum + item.quantidade * item.preco,
        0
      );
      const total = calculateTotal();

      // Inserir venda (deixar o Supabase gerar o UUID automaticamente)
      const { data: novaVenda, error: vendaError } = await supabase
        .from("vendas")
        .insert({
          cliente_id: formData.clienteId,
          data_venda: new Date().toISOString(),
          subtotal,
          desconto: formData.desconto || 0,
          acrescimo: formData.acrescimo || 0,
          total,
          metodo_pagamento: formData.metodoPagamento,
          observacoes: formData.observacoes || null,
          status: "Concluída",
        })
        .select()
        .single();

      if (vendaError) {
        console.error("Erro ao inserir venda:", vendaError);
        throw vendaError;
      }

      console.log("Venda criada:", novaVenda);

      // Inserir itens da venda
      const itensVenda = formData.itens.map((item) => ({
        venda_id: novaVenda.id,
        produto_id: item.produtoId,
        produto_nome: item.produtoNome,
        quantidade: item.quantidade,
        preco: item.preco,
        subtotal: item.quantidade * item.preco,
      }));

      const { error: itensError } = await supabase
        .from("itens_venda")
        .insert(itensVenda);

      if (itensError) {
        console.error("Erro ao inserir itens:", itensError);
        throw itensError;
      }

      toast({
        title: "Sucesso!",
        description: "Venda registrada com sucesso!",
      });

      // Chamar callback para atualizar a lista de vendas
      if (onSaleCreated) {
        onSaleCreated(formData, total);
      }

      // Reset do formulário
      setFormData({
        clienteId: "",
        itens: [{ produtoId: "", quantidade: 1, preco: 0, produtoNome: "" }],
        desconto: 0,
        acrescimo: 0,
        metodoPagamento: "À vista",
        observacoes: "",
      });
      setSearchCliente("");
    } catch (error) {
      console.error("Erro ao criar venda:", error);
      toast({
        title: "Erro",
        description: `Erro ao registrar venda: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
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
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <Label htmlFor="cliente">Cliente *</Label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            id="cliente"
            placeholder="Buscar cliente..."
            value={searchCliente}
            onChange={(e) => setSearchCliente(e.target.value)}
            className="pl-10 bg-white/5 border-white/20"
          />
        </div>
        {searchCliente && filteredClientes.length > 0 && (
          <div className="mt-2 max-h-40 overflow-y-auto bg-white/5 border border-white/20 rounded-md">
            {filteredClientes.map((cliente) => (
              <div
                key={cliente.id}
                onClick={() => {
                  setFormData({ ...formData, clienteId: cliente.id });
                  setSearchCliente(cliente.nome);
                }}
                className="p-2 hover:bg-white/10 cursor-pointer"
              >
                {cliente.nome} - {cliente.email}
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <div className="flex justify-between items-center mb-4">
          <Label>Itens da Venda *</Label>
          <Button
            type="button"
            onClick={addItem}
            size="sm"
            variant="outline"
            className="border-white/20"
          >
            <Plus className="w-4 h-4 mr-1" />
            Adicionar Item
          </Button>
        </div>
        <div className="space-y-4">
          {formData.itens.map((item, index) => (
            <div
              key={index}
              className="grid grid-cols-1 md:grid-cols-5 gap-4 p-4 bg-white/5 rounded-lg border border-white/10"
            >
              <div className="md:col-span-2">
                <Label>Produto</Label>
                <Select
                  value={item.produtoId}
                  onValueChange={(value) => handleProdutoChange(index, value)}
                >
                  <SelectTrigger className="bg-white/5 border-white/20">
                    <SelectValue placeholder="Selecione um produto" />
                  </SelectTrigger>
                  <SelectContent className="bg-white/10 border-white/20 text-white">
                    {produtos.map((produto) => (
                      <SelectItem key={produto.id} value={produto.id}>
                        {produto.nome} - R$ {produto.preco.toFixed(2)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Quantidade</Label>
                <Input
                  type="number"
                  min="1"
                  value={item.quantidade}
                  onChange={(e) =>
                    updateItem(
                      index,
                      "quantidade",
                      parseInt(e.target.value) || 1
                    )
                  }
                  className="bg-white/5 border-white/20"
                />
              </div>
              <div>
                <Label>Preço Unit.</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={item.preco}
                  onChange={(e) =>
                    updateItem(index, "preco", parseFloat(e.target.value) || 0)
                  }
                  className="bg-white/5 border-white/20"
                />
              </div>
              <div className="flex items-end">
                <Button
                  type="button"
                  onClick={() => removeItem(index)}
                  variant="outline"
                  size="sm"
                  className="border-red-500/50 text-red-400 hover:bg-red-500/20"
                  disabled={formData.itens.length === 1}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="desconto">Desconto (R$)</Label>
          <Input
            id="desconto"
            type="number"
            step="0.01"
            value={formData.desconto}
            onChange={(e) =>
              setFormData({
                ...formData,
                desconto: parseFloat(e.target.value) || 0,
              })
            }
            className="bg-white/5 border-white/20"
          />
        </div>
        <div>
          <Label htmlFor="acrescimo">Acréscimo (R$)</Label>
          <Input
            id="acrescimo"
            type="number"
            step="0.01"
            value={formData.acrescimo}
            onChange={(e) =>
              setFormData({
                ...formData,
                acrescimo: parseFloat(e.target.value) || 0,
              })
            }
            className="bg-white/5 border-white/20"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="metodoPagamento">Método de Pagamento *</Label>
        <Select
          value={formData.metodoPagamento}
          onValueChange={(value) =>
            setFormData({ ...formData, metodoPagamento: value })
          }
        >
          <SelectTrigger className="bg-white/5 border-white/20">
            <SelectValue placeholder="Selecione um método" />
          </SelectTrigger>
          <SelectContent className="bg-white/10 border-white/20 text-white">
            <SelectItem value="À vista">
              <div className="flex items-center">
                <DollarSign className="w-4 h-4 mr-2" />À vista
              </div>
            </SelectItem>
            <SelectItem value="Cartão">
              <div className="flex items-center">
                <CreditCard className="w-4 h-4 mr-2" />
                Cartão
              </div>
            </SelectItem>
            <SelectItem value="Pix">
              <div className="flex items-center">
                <QrCode className="w-4 h-4 mr-2" />
                Pix
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="observacoes">Observações</Label>
        <Input
          id="observacoes"
          value={formData.observacoes}
          onChange={(e) =>
            setFormData({ ...formData, observacoes: e.target.value })
          }
          className="bg-white/5 border-white/20"
          placeholder="Observações sobre a venda..."
        />
      </div>

      <div className="flex justify-between items-center pt-4 border-t border-white/10">
        <div className="text-xl font-bold">
          Total:{" "}
          <span className="text-green-400">
            R$ {calculateTotal().toFixed(2)}
          </span>
        </div>
        <Button
          type="submit"
          disabled={submitting}
          className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 disabled:opacity-50"
        >
          {submitting ? "Salvando..." : "Finalizar Venda"}
        </Button>
      </div>
    </form>
  );
}

export default NovaVendaForm;
