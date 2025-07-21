import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, Search, Edit, Trash2, Mail, Phone, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabaseClient";
// Importa funções de formatação
import {
  formatCPF,
  formatTelefone,
  formatCEP,
  removeFormatacao,
} from "../utils/formatters";

function Clientes() {
  const [clientes, setClientes] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCliente, setEditingCliente] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    cpf: "",
    telefone: "",
    cep: "",
    cidade: "",
    endereco: "",
    numero: "",
    bairro: "",
  });
  const { toast } = useToast();

  const resetForm = () => {
    setFormData({
      nome: "",
      email: "",
      cpf: "",
      telefone: "",
      cep: "",
      cidade: "",
      endereco: "",
      numero: "",
      bairro: "",
    });
    setEditingCliente(null);
  };

  // Carregar clientes do Supabase

  const carregarClientes = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("clientes")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        throw error;
      }
      console.log("Clientes carregados:", data);
      setClientes(data || []);
    } catch (error) {
      console.error("Erro ao carregar clientes:", error);
      toast({
        title: "Erro",
        description: "Erro ao carregar clientes do banco de dados.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarClientes();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.nome) {
      toast({
        title: "Erro",
        description: "Nome é obrigatórios!",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);

    try {
      if (editingCliente) {
        // Atualizar cliente existente
        const { error } = await supabase
          .from("clientes")
          .update({
            nome: formData.nome,
            email: formData.email,
            cpf: formData.cpf,
            telefone: formData.telefone,
            cep: formData.cep,
            cidade: formData.cidade,
            endereco: formData.endereco,
            numero: formData.numero,
            bairro: formData.bairro,
          })
          .eq("id", editingCliente.id);

        if (error) throw error;

        toast({
          title: "Sucesso!",
          description: "Cliente atualizado com sucesso!",
        });
      } else {
        // Inserir novo cliente
        const { error } = await supabase.from("clientes").insert([
          {
            nome: formData.nome,
            email: formData.email,
            cpf: formData.cpf,
            telefone: formData.telefone,
            cep: formData.cep,
            cidade: formData.cidade,
            endereco: formData.endereco,
            numero: formData.numero,
            bairro: formData.bairro,
          },
        ]);

        if (error) throw error;

        toast({
          title: "Sucesso!",
          description: "Cliente adicionado com sucesso!",
        });
      }

      // Recarregar a lista de clientes
      await carregarClientes();
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error("Erro ao salvar cliente:", error);
      toast({
        title: "Erro",
        description: "Erro ao salvar cliente no banco de dados.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (cliente) => {
    setEditingCliente(cliente);
    setFormData({
      nome: cliente.nome || "",
      email: cliente.email || "",
      cpf: cliente.cpf || "",
      telefone: cliente.telefone || "",
      cep: cliente.cep || "",
      cidade: cliente.cidade || "",
      endereco: cliente.endereco || "",
      numero: cliente.numero || "",
      bairro: cliente.bairro || "",
    });
    setIsDialogOpen(true);
  };

  // Função para deletar cliente
  const handleDelete = async (id) => {
    try {
      const { error } = await supabase.from("clientes").delete().eq("id", id);

      if (error) throw error;

      toast({
        title: "Cliente removido",
        description: "Cliente foi removido com sucesso!",
      });

      // Recarregar a lista de clientes
      await carregarClientes();
    } catch (error) {
      console.error("Erro ao deletar cliente:", error);
      toast({
        title: "Erro",
        description: "Erro ao remover cliente do banco de dados.",
        variant: "destructive",
      });
    }
  };

  const filteredClientes = clientes.filter(
    (cliente) =>
      cliente.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cliente.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  console.log("Estado atual:", {
    loading,
    clientesLength: clientes.length,
    filteredLength: filteredClientes.length,
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-4xl font-bold gradient-text">Clientes</h1>
          <p className="text-gray-400">Gerencie sua base de clientes</p>
        </div>

        <Dialog
          open={isDialogOpen}
          onOpenChange={(isOpen) => {
            setIsDialogOpen(isOpen);
            if (!isOpen) resetForm();
          }}
        >
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
              <Plus className="w-4 h-4 mr-2" />
              Novo Cliente
            </Button>
          </DialogTrigger>
          <DialogContent className="glass-effect border-white/20 max-w-2xl">
            <DialogHeader>
              <DialogTitle className="gradient-text">
                {editingCliente ? "Editar Cliente" : "Novo Cliente"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="nome">Nome *</Label>
                  <Input
                    id="nome"
                    value={formData.nome}
                    onChange={(e) =>
                      setFormData({ ...formData, nome: e.target.value })
                    }
                    className="bg-white/5 border-white/20"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="bg-white/5 border-white/20"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="cpf">CPF</Label>
                  <Input
                    id="cpf"
                    value={formatCPF(formData.cpf)}
                    onChange={(e) => {
                      const numbersOnly = removeFormatacao(e.target.value);
                      if (numbersOnly.length <= 11) {
                        setFormData({ ...formData, cpf: numbersOnly });
                      }
                    }}
                    className="□ bg-white/5 □ border-white/20"
                  />
                </div>
                <div>
                  <Label htmlFor="telefone">Telefone</Label>
                  <Input
                    id="telefone"
                    value={formatTelefone(formData.telefone)}
                    onChange={(e) => {
                      const numbersOnly = removeFormatacao(e.target.value);
                      if (numbersOnly.length <= 11) {
                        setFormData({ ...formData, telefone: numbersOnly });
                      }
                    }}
                    className="□ bg-white/5 □ border-white/20"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="cep">CEP</Label>
                  <Input
                    id="cep"
                    value={formatCEP(formData.cep)}
                    onChange={(e) => {
                      const numbersOnly = removeFormatacao(e.target.value);
                      if (numbersOnly.length <= 8) {
                        setFormData({ ...formData, cep: numbersOnly });
                      }
                    }}
                    className="□ bg-white/5 □ border-white/20"
                  />
                </div>
                <div>
                  <Label htmlFor="cidade">Cidade</Label>
                  <Input
                    id="cidade"
                    value={formData.cidade}
                    onChange={(e) =>
                      setFormData({ ...formData, cidade: e.target.value })
                    }
                    className="bg-white/5 border-white/20"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <Label htmlFor="endereco">Endereço</Label>
                  <Input
                    id="endereco"
                    value={formData.endereco}
                    onChange={(e) =>
                      setFormData({ ...formData, endereco: e.target.value })
                    }
                    className="bg-white/5 border-white/20"
                  />
                </div>
                <div>
                  <Label htmlFor="numero">Número</Label>
                  <Input
                    id="numero"
                    value={formData.numero}
                    onChange={(e) =>
                      setFormData({ ...formData, numero: e.target.value })
                    }
                    className="bg-white/5 border-white/20"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="bairro">Bairro</Label>
                <Input
                  id="bairro"
                  value={formData.bairro}
                  onChange={(e) =>
                    setFormData({ ...formData, bairro: e.target.value })
                  }
                  className="bg-white/5 border-white/20"
                />
              </div>
              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  className="border-white/20 hover:bg-white/5"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                >
                  {editingCliente ? "Atualizar" : "Salvar"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          placeholder="Buscar clientes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 bg-white/5 border-white/20"
        />
      </div>

      <Card>
        <CardHeader>
          <div className="hidden md:grid md:grid-cols-10 gap-4 font-semibold text-gray-400 px-6">
            <div className="col-span-3">Nome</div>
            <div className="col-span-3">Email</div>
            <div className="col-span-2">Telefone</div>
            <div className="col-span-2 text-right">Ações</div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {filteredClientes.map((cliente, index) => (
              <motion.div
                key={cliente.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="grid grid-cols-1 md:grid-cols-10 gap-4 items-center p-4 md:px-6 bg-white/5 rounded-lg hover:bg-white/10 transition-colors duration-200"
              >
                <div className="md:col-span-3 font-semibold text-white flex items-center">
                  <span className="md:hidden font-bold text-gray-400 mr-2">
                    Nome:{" "}
                  </span>
                  {cliente.nome}
                </div>
                <div className="md:col-span-3 text-blue-400 flex items-center">
                  <Mail className="w-4 h-4 mr-2 md:hidden" />
                  <span className="md:hidden font-bold text-gray-400 mr-2">
                    Email:{" "}
                  </span>
                  {cliente.email}
                </div>
                <div className="md:col-span-2 text-green-400 flex items-center">
                  <Phone className="w-4 h-4 mr-2 md:hidden" />
                  <span className="md:hidden font-bold text-gray-400 mr-2">
                    Telefone:{" "}
                  </span>
                  {cliente.telefone ? formatTelefone(cliente.telefone) : "N/A"}
                </div>
                <div className="md:col-span-2 flex justify-end space-x-2">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleEdit(cliente)}
                    className="h-8 w-8 hover:bg-blue-500/20"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleDelete(cliente.id)}
                    className="h-8 w-8 hover:bg-red-500/20 text-red-400"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {filteredClientes.length === 0 && (
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-300 mb-2">
            {searchTerm
              ? "Nenhum cliente encontrado"
              : "Nenhum cliente cadastrado"}
          </h3>
          <p className="text-gray-400">
            {searchTerm
              ? "Tente buscar com outros termos"
              : "Comece adicionando seu primeiro cliente"}
          </p>
        </div>
      )}
    </div>
  );
}

export default Clientes;
