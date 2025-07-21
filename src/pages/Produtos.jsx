import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, Search, Edit, Trash2, Package, DollarSign } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import GerenciarCategoriasDialog from "@/components/produtos/GerenciarCategoriasDialog";
import { supabase } from "@/lib/supabaseClient";
import { v4 as uuidv4 } from "uuid";

const defaultCategorias = [];

function Produtos() {
  const [produtos, setProdutos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduto, setEditingProduto] = useState(null);
  const [formData, setFormData] = useState({
    id: "",
    created_at: "",
    nome: "",
    descricao: "",
    preco: "",
    categoria: "",
    estoque: "",
    codigoBarras: "",
  });
  const { toast } = useToast();

  // Fetch products and categories from Supabase
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch products
        const { data: produtosData, error: produtosError } = await supabase
          .from("produtos")
          .select("*");
        if (produtosError) throw produtosError;
        setProdutos(produtosData || []);

        // Fetch categories
        const { data: categoriasData, error: categoriasError } = await supabase
          .from("categorias")
          .select("categoria");
        if (categoriasError) throw categoriasError;
        const categoriasList =
          categoriasData?.map((cat) => cat.categoria) || defaultCategorias;
        setCategorias(categoriasList);
      } catch (error) {
        toast({
          title: "Erro",
          description: "Erro ao carregar dados: " + error.message,
          variant: "destructive",
        });
      }
    };
    fetchData();
  }, []);

  const saveCategorias = async (newCategorias) => {
    try {
      // Delete existing categories
      await supabase.from("categorias").delete().gte("id", 0);
      // Insert new categories
      await supabase.from("categorias").insert(
        newCategorias.map((categoria) => ({
          id: uuidv4(),
          categoria,
          created_at: new Date().toISOString(),
        }))
      );
      setCategorias(newCategorias);
      toast({
        title: "Sucesso!",
        description: "Categorias atualizadas com sucesso!",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao salvar categorias: " + error.message,
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.nome || !formData.preco || !formData.categoria) {
      toast({
        title: "Erro",
        description: "Nome, preço e categoria são obrigatórios!",
        variant: "destructive",
      });
      return;
    }

    const newProduto = {
      ...formData,
      preco: parseFloat(formData.preco),
      estoque: parseInt(formData.estoque) || 0,
      created_at: editingProduto
        ? editingProduto.created_at
        : new Date().toISOString(),
    };

    try {
      let updatedProdutos;
      if (editingProduto) {
        const { error } = await supabase
          .from("produtos")
          .update(newProduto)
          .eq("id", editingProduto.id);
        if (error) throw error;
        updatedProdutos = produtos.map((p) =>
          p.id === editingProduto.id
            ? {
                ...newProduto,
                id: editingProduto.id,
                created_at: editingProduto.created_at,
              }
            : p
        );
        toast({
          title: "Sucesso!",
          description: "Produto atualizado com sucesso!",
        });
      } else {
        const { data, error } = await supabase
          .from("produtos")
          .insert({ ...newProduto, id: uuidv4() })
          .select()
          .single();
        if (error) throw error;
        updatedProdutos = [...produtos, data];
        toast({
          title: "Sucesso!",
          description: "Produto adicionado com sucesso!",
        });
      }
      setProdutos(updatedProdutos);
      setIsDialogOpen(false);
      setEditingProduto(null);
      setFormData({
        nome: "",
        descricao: "",
        preco: "",
        categoria: "",
        estoque: "",
        codigoBarras: "",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao salvar produto: " + error.message,
        variant: "destructive",
      });
    }
  };

  const handleEdit = (produto) => {
    setEditingProduto(produto);
    setFormData({
      ...produto,
      preco: produto.preco.toString(),
      estoque: produto.estoque.toString(),
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      const { error } = await supabase.from("produtos").delete().eq("id", id);
      if (error) throw error;
      const updatedProdutos = produtos.filter((p) => p.id !== id);
      setProdutos(updatedProdutos);
      toast({
        title: "Produto removido",
        description: "Produto foi removido com sucesso!",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao remover produto: " + error.message,
        variant: "destructive",
      });
    }
  };

  const filteredProdutos = produtos.filter(
    (produto) =>
      produto.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      produto.categoria.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStockStatus = (estoque) => {
    if (estoque === 0)
      return { text: "Sem estoque", color: "bg-red-500/20 text-red-400" };
    if (estoque < 10)
      return {
        text: "Estoque baixo",
        color: "bg-yellow-500/20 text-yellow-400",
      };
    return { text: "Em estoque", color: "bg-green-500/20 text-green-400" };
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-4xl font-bold gradient-text">Produtos</h1>
          <p className="text-gray-400">Gerencie seu catálogo de produtos</p>
        </div>
        <div className="flex space-x-2">
          <GerenciarCategoriasDialog
            categorias={categorias}
            setCategorias={saveCategorias}
          />
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                Novo Produto
              </Button>
            </DialogTrigger>
            <DialogContent className="glass-effect border-white/20 max-w-2xl">
              <DialogHeader>
                <DialogTitle className="gradient-text">
                  {editingProduto ? "Editar Produto" : "Novo Produto"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="nome">Nome do Produto *</Label>
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
                    <Label htmlFor="categoria">Categoria *</Label>
                    <Select
                      value={formData.categoria}
                      onValueChange={(value) =>
                        setFormData({ ...formData, categoria: value })
                      }
                    >
                      <SelectTrigger className="bg-white/5 border-white/20">
                        <SelectValue placeholder="Selecione uma categoria" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-white/20">
                        {categorias.map((cat) => (
                          <SelectItem key={cat} value={cat}>
                            {cat}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="descricao">Descrição</Label>
                  <Input
                    id="descricao"
                    value={formData.descricao}
                    onChange={(e) =>
                      setFormData({ ...formData, descricao: e.target.value })
                    }
                    className="bg-white/5 border-white/20"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="preco">Preço *</Label>
                    <Input
                      id="preco"
                      type="number"
                      step="0.01"
                      value={formData.preco}
                      onChange={(e) =>
                        setFormData({ ...formData, preco: e.target.value })
                      }
                      className="bg-white/5 border-white/20"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="estoque">Estoque</Label>
                    <Input
                      id="estoque"
                      type="number"
                      value={formData.estoque}
                      onChange={(e) =>
                        setFormData({ ...formData, estoque: e.target.value })
                      }
                      className="bg-white/5 border-white/20"
                    />
                  </div>
                  <div>
                    <Label htmlFor="codigoBarras">Código de Barras</Label>
                    <Input
                      id="codigoBarras"
                      value={formData.codigoBarras}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          codigoBarras: e.target.value,
                        })
                      }
                      className="bg-white/5 border-white/20"
                    />
                  </div>
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
                    className="bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700"
                  >
                    {editingProduto ? "Atualizar" : "Salvar"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
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
          <div className="hidden md:grid md:grid-cols-12 gap-4 font-semibold text-gray-400 px-6">
            <div className="col-span-4">Produto</div>
            <div className="col-span-2">Categoria</div>
            <div className="col-span-2">Preço</div>
            <div className="col-span-2">Estoque</div>
            <div className="col-span-2 text-right">Ações</div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {filteredProdutos.map((produto, index) => {
              const stockStatus = getStockStatus(produto.estoque);
              return (
                <motion.div
                  key={produto.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center p-4 md:px-6 bg-white/5 rounded-lg hover:bg-white/10 transition-colors duration-200"
                >
                  <div className="md:col-span-4 font-semibold text-white">
                    <span className="md:hidden font-bold text-gray-400 mr-2">
                      Produto:{" "}
                    </span>
                    {produto.nome}
                  </div>
                  <div className="md:col-span-2 text-blue-400">
                    <span className="md:hidden font-bold text-gray-400 mr-2">
                      Categoria:{" "}
                    </span>
                    {produto.categoria}
                  </div>
                  <div className="md:col-span-2 text-green-400 font-bold flex items-center">
                    <DollarSign className="w-4 h-4 mr-2 md:hidden" />
                    <span className="md:hidden font-bold text-gray-400 mr-2">
                      Preço:{" "}
                    </span>
                    R$ {produto.preco.toFixed(2)}
                  </div>
                  <div className="md:col-span-2 flex items-center">
                    <span className="md:hidden font-bold text-gray-400 mr-2">
                      Estoque:{" "}
                    </span>
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${stockStatus.color}`}
                    >
                      {produto.estoque} - {stockStatus.text}
                    </span>
                  </div>
                  <div className="md:col-span-2 flex justify-end space-x-2">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleEdit(produto)}
                      className="h-8 w-8 hover:bg-blue-500/20"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleDelete(produto.id)}
                      className="h-8 w-8 hover:bg-red-500/20 text-red-400"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {filteredProdutos.length === 0 && (
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-gradient-to-r from-green-500/20 to-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Package className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-300 mb-2">
            {searchTerm
              ? "Nenhum produto encontrado"
              : "Nenhum produto cadastrado"}
          </h3>
          <p className="text-gray-400">
            {searchTerm
              ? "Tente buscar com outros termos"
              : "Comece adicionando seu primeiro produto"}
          </p>
        </div>
      )}
    </div>
  );
}

export default Produtos;
