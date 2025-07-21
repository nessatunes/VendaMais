import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  BarChart3,
  TrendingUp,
  Calendar,
  Download,
  DollarSign,
  ShoppingCart,
  Users,
  Package,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart,
} from "recharts";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabaseClient";

function Relatorios() {
  const [vendas, setVendas] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [produtos, setProdutos] = useState([]);
  const [periodo, setPeriodo] = useState("30");
  const [loading, setLoading] = useState(true);
  const [relatorioData, setRelatorioData] = useState({
    vendasPorDia: [],
    produtosMaisVendidos: [],
    clientesTop: [],
    resumoFinanceiro: {},
  });
  const { toast } = useToast();

  // Buscar dados do Supabase
  const fetchData = async () => {
    try {
      setLoading(true);

      // Buscar vendas com dados dos clientes e itens
      const { data: vendasData, error: vendasError } = await supabase
        .from("vendas")
        .select(
          `
          *,
          clientes!cliente_id (nome, email),
          itens_venda!venda_id (
            quantidade,
            preco,
            subtotal,
            produto_nome
          )
        `
        )
        .order("data_venda", { ascending: false });

      if (vendasError) throw vendasError;

      // Buscar clientes
      const { data: clientesData, error: clientesError } = await supabase
        .from("clientes")
        .select("*")
        .order("nome");

      if (clientesError) throw clientesError;

      // Buscar produtos
      const { data: produtosData, error: produtosError } = await supabase
        .from("produtos")
        .select("*")
        .order("nome");

      if (produtosError) throw produtosError;

      // Transformar dados das vendas para o formato esperado
      const vendasFormatadas = vendasData.map((venda) => ({
        id: venda.id,
        dataVenda: venda.data_venda,
        clienteNome: venda.clientes?.nome || "Cliente não identificado",
        clienteEmail: venda.clientes?.email || "",
        total: venda.total,
        observacoes: venda.observacoes || "",
        itens:
          venda.itens_venda?.map((item) => ({
            produtoNome: item.produto_nome,
            quantidade: item.quantidade,
            preco: item.preco,
            subtotal: item.subtotal,
          })) || [],
      }));

      setVendas(vendasFormatadas);
      setClientes(clientesData || []);
      setProdutos(produtosData || []);
    } catch (error) {
      console.error("Erro ao buscar dados:", error);
      toast({
        title: "Erro ao carregar dados",
        description: "Não foi possível carregar os dados dos relatórios.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (vendas.length > 0) {
      generateReportData();
    }
  }, [vendas, periodo]);

  const generateReportData = () => {
    const diasAtras = parseInt(periodo);
    const dataLimite = new Date();
    dataLimite.setDate(dataLimite.getDate() - diasAtras);

    const vendasFiltradas = vendas.filter(
      (venda) => new Date(venda.dataVenda) >= dataLimite
    );

    // Vendas por dia
    const vendasPorDia = {};
    vendasFiltradas.forEach((venda) => {
      const data = new Date(venda.dataVenda).toLocaleDateString("pt-BR");
      if (!vendasPorDia[data]) {
        vendasPorDia[data] = { data, vendas: 0, receita: 0 };
      }
      vendasPorDia[data].vendas += 1;
      vendasPorDia[data].receita += venda.total;
    });

    // Produtos mais vendidos
    const produtosVendidos = {};
    vendasFiltradas.forEach((venda) => {
      venda.itens.forEach((item) => {
        if (!produtosVendidos[item.produtoNome]) {
          produtosVendidos[item.produtoNome] = {
            nome: item.produtoNome,
            quantidade: 0,
            receita: 0,
          };
        }
        produtosVendidos[item.produtoNome].quantidade += item.quantidade;
        produtosVendidos[item.produtoNome].receita += item.subtotal;
      });
    });

    // Clientes top
    const clientesVendas = {};
    vendasFiltradas.forEach((venda) => {
      if (!clientesVendas[venda.clienteNome]) {
        clientesVendas[venda.clienteNome] = {
          nome: venda.clienteNome,
          vendas: 0,
          total: 0,
        };
      }
      clientesVendas[venda.clienteNome].vendas += 1;
      clientesVendas[venda.clienteNome].total += venda.total;
    });

    // Resumo financeiro
    const totalReceita = vendasFiltradas.reduce(
      (total, venda) => total + venda.total,
      0
    );
    const totalVendas = vendasFiltradas.length;
    const ticketMedio = totalVendas > 0 ? totalReceita / totalVendas : 0;

    // Calcular crescimento comparando com período anterior
    const periodoAnteriorInicio = new Date(dataLimite);
    periodoAnteriorInicio.setDate(periodoAnteriorInicio.getDate() - diasAtras);

    const vendasPeriodoAnterior = vendas.filter((venda) => {
      const dataVenda = new Date(venda.dataVenda);
      return dataVenda >= periodoAnteriorInicio && dataVenda < dataLimite;
    });

    const receitaPeriodoAnterior = vendasPeriodoAnterior.reduce(
      (total, venda) => total + venda.total,
      0
    );
    const crescimento =
      receitaPeriodoAnterior > 0
        ? ((totalReceita - receitaPeriodoAnterior) / receitaPeriodoAnterior) *
          100
        : 0;

    setRelatorioData({
      vendasPorDia: Object.values(vendasPorDia)
        .sort(
          (a, b) =>
            new Date(a.data.split("/").reverse().join("-")) -
            new Date(b.data.split("/").reverse().join("-"))
        )
        .slice(-7), // Últimos 7 dias
      produtosMaisVendidos: Object.values(produtosVendidos)
        .sort((a, b) => b.quantidade - a.quantidade)
        .slice(0, 5),
      clientesTop: Object.values(clientesVendas)
        .sort((a, b) => b.total - a.total)
        .slice(0, 5),
      resumoFinanceiro: {
        totalReceita,
        totalVendas,
        ticketMedio,
        crescimento: parseFloat(crescimento.toFixed(1)),
      },
    });
  };

  const handleExportReport = async () => {
    try {
      // Gerar dados do relatório em formato CSV
      const csvData = [
        ["Período do Relatório:", `Últimos ${periodo} dias`],
        ["Data de Geração:", new Date().toLocaleString("pt-BR")],
        [""],
        ["RESUMO FINANCEIRO"],
        [
          "Receita Total:",
          `R$ ${
            relatorioData.resumoFinanceiro.totalReceita?.toLocaleString(
              "pt-BR",
              { minimumFractionDigits: 2 }
            ) || "0,00"
          }`,
        ],
        ["Total de Vendas:", relatorioData.resumoFinanceiro.totalVendas || 0],
        [
          "Ticket Médio:",
          `R$ ${
            relatorioData.resumoFinanceiro.ticketMedio?.toFixed(2) || "0,00"
          }`,
        ],
        ["Crescimento:", `${relatorioData.resumoFinanceiro.crescimento}%`],
        [""],
        ["PRODUTOS MAIS VENDIDOS"],
        ["Produto", "Quantidade", "Receita"],
        ...relatorioData.produtosMaisVendidos.map((produto) => [
          produto.nome,
          produto.quantidade,
          `R$ ${produto.receita.toFixed(2)}`,
        ]),
        [""],
        ["MELHORES CLIENTES"],
        ["Cliente", "Vendas", "Total Gasto"],
        ...relatorioData.clientesTop.map((cliente) => [
          cliente.nome,
          cliente.vendas,
          `R$ ${cliente.total.toFixed(2)}`,
        ]),
      ];

      // Converter para CSV
      const csvContent = csvData.map((row) => row.join(",")).join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");

      if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute(
          "download",
          `relatorio-${new Date().toISOString().split("T")[0]}.csv`
        );
        link.style.visibility = "hidden";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }

      toast({
        title: "Relatório exportado!",
        description: "O arquivo CSV foi baixado com sucesso.",
      });
    } catch (error) {
      console.error("Erro ao exportar relatório:", error);
      toast({
        title: "Erro na exportação",
        description: "Não foi possível exportar o relatório.",
        variant: "destructive",
      });
    }
  };

  const colors = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6"];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <BarChart3 className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-400">Carregando relatórios...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-4xl font-bold gradient-text">Relatórios</h1>
          <p className="text-gray-400">Análise detalhada do seu negócio</p>
        </div>

        <div className="flex space-x-4">
          <Select value={periodo} onValueChange={setPeriodo}>
            <SelectTrigger className="w-40 bg-white/5 border-white/20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-white/20">
              <SelectItem value="7">Últimos 7 dias</SelectItem>
              <SelectItem value="30">Últimos 30 dias</SelectItem>
              <SelectItem value="90">Últimos 90 dias</SelectItem>
              <SelectItem value="365">Último ano</SelectItem>
            </SelectContent>
          </Select>

          <Button
            onClick={handleExportReport}
            className="bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700"
            disabled={relatorioData.vendasPorDia.length === 0}
          >
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="card-hover">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-400">
                    Receita Total
                  </p>
                  <p className="text-2xl font-bold text-white mt-2">
                    R${" "}
                    {relatorioData.resumoFinanceiro.totalReceita?.toLocaleString(
                      "pt-BR",
                      { minimumFractionDigits: 2 }
                    ) || "0,00"}
                  </p>
                  <p
                    className={`text-sm mt-1 ${
                      relatorioData.resumoFinanceiro.crescimento >= 0
                        ? "text-green-400"
                        : "text-red-400"
                    }`}
                  >
                    {relatorioData.resumoFinanceiro.crescimento >= 0 ? "+" : ""}
                    {relatorioData.resumoFinanceiro.crescimento}%
                  </p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="card-hover">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-400">
                    Total de Vendas
                  </p>
                  <p className="text-2xl font-bold text-white mt-2">
                    {relatorioData.resumoFinanceiro.totalVendas || 0}
                  </p>
                  <p className="text-sm text-blue-400 mt-1">
                    Período selecionado
                  </p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center">
                  <ShoppingCart className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="card-hover">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-400">
                    Ticket Médio
                  </p>
                  <p className="text-2xl font-bold text-white mt-2">
                    R${" "}
                    {relatorioData.resumoFinanceiro.ticketMedio?.toFixed(2) ||
                      "0,00"}
                  </p>
                  <p className="text-sm text-purple-400 mt-1">Por venda</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card className="card-hover">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-400">
                    Clientes Ativos
                  </p>
                  <p className="text-2xl font-bold text-white mt-2">
                    {clientes.length}
                  </p>
                  <p className="text-sm text-orange-400 mt-1">
                    Total cadastrados
                  </p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-600 rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Trend */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5 text-blue-400" />
                <span>Tendência de Vendas</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={relatorioData.vendasPorDia}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="data" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1F2937",
                      border: "1px solid #374151",
                      borderRadius: "8px",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="receita"
                    stroke="#3B82F6"
                    fill="#3B82F6"
                    fillOpacity={0.3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Top Products */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Package className="w-5 h-5 text-green-400" />
                <span>Produtos Mais Vendidos</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={relatorioData.produtosMaisVendidos}
                  layout="horizontal"
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis type="number" stroke="#9CA3AF" />
                  <YAxis
                    dataKey="nome"
                    type="category"
                    stroke="#9CA3AF"
                    width={100}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1F2937",
                      border: "1px solid #374151",
                      borderRadius: "8px",
                    }}
                  />
                  <Bar
                    dataKey="quantidade"
                    fill="#10B981"
                    radius={[0, 4, 4, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Top Customers */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-purple-400" />
              <span>Melhores Clientes</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {relatorioData.clientesTop.map((cliente, index) => (
                <div
                  key={cliente.nome}
                  className="flex items-center justify-between p-4 bg-white/5 rounded-lg"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold">{index + 1}</span>
                    </div>
                    <div>
                      <p className="font-semibold text-white">{cliente.nome}</p>
                      <p className="text-sm text-gray-400">
                        {cliente.vendas} vendas
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-400">
                      R$ {cliente.total.toFixed(2)}
                    </p>
                    <p className="text-sm text-gray-400">Total gasto</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {relatorioData.vendasPorDia.length === 0 && !loading && (
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <BarChart3 className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-300 mb-2">
            Nenhum dado disponível
          </h3>
          <p className="text-gray-400">
            Registre algumas vendas para visualizar os relatórios
          </p>
        </div>
      )}
    </div>
  );
}

export default Relatorios;
