import React, { useState, useEffect } from "react";
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
import { Plus, Edit, Trash2 } from "lucide-react";
import { supabase } from "@/lib/supabaseClient"; // ajuste o caminho conforme seu projeto

const GerenciarCategoriasDialog = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [categorias, setCategorias] = useState([]);
  const [editingCategory, setEditingCategory] = useState(null);
  const [categoryName, setCategoryName] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    fetchCategorias();
  }, []);

  const fetchCategorias = async () => {
    const { data, error } = await supabase
      .from("categorias")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast({
        title: "Erro ao carregar categorias",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setCategorias(data);
    }
  };

  const handleAddOrUpdate = async () => {
    const nome = categoryName.trim();
    if (!nome) {
      return toast({
        title: "Erro",
        description: "Nome não pode ser vazio",
        variant: "destructive",
      });
    }

    if (editingCategory) {
      // 🔁 Atualizar no Supabase
      const { error } = await supabase
        .from("categorias")
        .update({ categoria: nome })
        .eq("id", editingCategory.id);

      if (error) {
        return toast({
          title: "Erro ao atualizar",
          description: error.message,
          variant: "destructive",
        });
      }

      toast({ title: "Categoria atualizada com sucesso" });
    } else {
      // ➕ Adicionar no Supabase
      const { error } = await supabase
        .from("categorias")
        .insert({ categoria: nome })
        .select(); // para pegar o `id` gerado

      if (error) {
        return toast({
          title: "Erro ao adicionar",
          description: error.message,
          variant: "destructive",
        });
      }

      toast({ title: "Categoria adicionada com sucesso" });
    }

    setCategoryName("");
    setEditingCategory(null);
    fetchCategorias(); // 🔁 Recarregar lista

    console.log("ID para atualizar:", editingCategory?.id);
  };

  const handleDelete = async (id) => {
    const { error } = await supabase.from("categorias").delete().eq("id", id);
    if (error) {
      return toast({
        title: "Erro ao remover",
        description: error.message,
        variant: "destructive",
      });
    }

    toast({ title: "Categoria removida com sucesso" });
    fetchCategorias();
  };

  const startEdit = (categoria) => {
    setEditingCategory(categoria);
    setCategoryName(categoria.categoria);

    console.log("ID para deletar:", id);
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="border-white/20 hover:bg-white/5">
          Gerenciar Categorias
        </Button>
      </DialogTrigger>
      <DialogContent className="glass-effect border-white/20">
        <DialogHeader>
          <DialogTitle className="gradient-text">
            Gerenciar Categorias
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex space-x-2">
            <Input
              placeholder={
                editingCategory ? "Editar categoria..." : "Nova categoria..."
              }
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              className="bg-white/5 border-white/20"
            />
            <Button
              onClick={handleAddOrUpdate}
              className="bg-gradient-to-r from-blue-500 to-purple-600"
            >
              {editingCategory ? "Salvar" : <Plus className="w-4 h-4" />}
            </Button>
          </div>
          <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
            {categorias.length > 0 ? (
              categorias.map((cat) => (
                <div
                  key={cat.id}
                  className="flex items-center justify-between p-2 bg-white/5 rounded-md"
                >
                  <span>{cat.categoria}</span>
                  <div className="space-x-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => startEdit(cat)}
                      className="h-8 w-8 hover:bg-blue-500/20"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleDelete(cat.id)}
                      className="h-8 w-8 hover:bg-red-500/20 text-red-400"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-400 py-4">
                Nenhuma categoria cadastrada.
              </p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default GerenciarCategoriasDialog;
