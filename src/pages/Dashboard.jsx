import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  TrendingUp,
  Users,
  Package,
  ShoppingCart,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
} from "recharts";
import { supabase } from "@/lib/supabaseClient";

const salesData = [
  { month: "Jan", vendas: 4000, lucro: 2400 },
  { month: "Fev", vendas: 3000, lucro: 1398 },
  { month: "Mar", vendas: 2000, lucro: 9800 },
  { month: "Abr", vendas: 2780, lucro: 3908 },
  { month: "Mai", vendas: 1890, lucro: 4800 },
  { month: "Jun", vendas: 2390, lucro: 3800 },
];

const productData = [
  { name: "Eletrônicos", value: 400, color: "#8884d8" },
  { name: "Roupas", value: 300, color: "#82ca9d" },
  { name: "Casa", value: 200, color: "#ffc658" },
  { name: "Esportes", value: 100, color: "#ff7c7c" },
];

function Dashboard() {
  const [stats, setStats] = useState({
    totalVendas: 0,
    totalClientes: 0,
    totalProdutos: 0,
    receitaTotal: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Aqui você substituiria pelas chamadas reais ao Supabase:
        const { data: vendas } = await supabase.from("vendas").select("*");
        const { data: clientes } = await supabase.from("clientes").select("*");
        const { data: produtos } = await supabase.from("produtos").select("*");

        const receitaTotal = vendas.reduce(
          (total, venda) => total + venda.total,
          0
        );

        setStats({
          totalVendas: vendas.length,
          totalClientes: clientes.length,
          totalProdutos: produtos.length,
          receitaTotal,
        });
      } catch (error) {
        console.error("Erro ao carregar dados do dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const statCards = [
    {
      title: "Receita Total",
      value: `R$ ${stats.receitaTotal.toLocaleString("pt-BR", {
        minimumFractionDigits: 2,
      })}`,
      icon: DollarSign,
      change: "+12.5%",
      positive: true,
      color: "from-green-500 to-emerald-600",
    },
    {
      title: "Total de Vendas",
      value: stats.totalVendas.toString(),
      icon: ShoppingCart,
      change: "+8.2%",
      positive: true,
      color: "from-blue-500 to-cyan-600",
    },
    {
      title: "Clientes",
      value: stats.totalClientes.toString(),
      icon: Users,
      change: "+15.3%",
      positive: true,
      color: "from-purple-500 to-pink-600",
    },
    {
      title: "Produtos",
      value: stats.totalProdutos.toString(),
      icon: Package,
      change: "+5.1%",
      positive: true,
      color: "from-orange-500 to-red-600",
    },
  ];

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
          <span className="ml-3 text-white">Carregando dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col space-y-2">
        <h1 className="text-4xl font-bold gradient-text">Dashboard</h1>
        <p className="text-gray-400">Visão geral do seu negócio</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="card-hover">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-400">
                        {stat.title}
                      </p>
                      <p className="text-2xl font-bold text-white mt-2">
                        {stat.value}
                      </p>
                      <div className="flex items-center mt-2">
                        {stat.positive ? (
                          <ArrowUpRight className="w-4 h-4 text-green-400" />
                        ) : (
                          <ArrowDownRight className="w-4 h-4 text-red-400" />
                        )}
                        <span
                          className={`text-sm ml-1 ${
                            stat.positive ? "text-green-400" : "text-red-400"
                          }`}
                        >
                          {stat.change}
                        </span>
                      </div>
                    </div>
                    <div
                      className={`w-12 h-12 bg-gradient-to-r ${stat.color} rounded-xl flex items-center justify-center`}
                    >
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Chart */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5 text-blue-400" />
                <span>Vendas Mensais</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="month" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1F2937",
                      border: "1px solid #374151",
                      borderRadius: "8px",
                    }}
                  />
                  <Bar dataKey="vendas" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Product Distribution */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Package className="w-5 h-5 text-purple-400" />
                <span>Distribuição de Produtos</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={productData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                  >
                    {productData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Revenue Trend */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <DollarSign className="w-5 h-5 text-green-400" />
              <span>Tendência de Receita</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="month" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1F2937",
                    border: "1px solid #374151",
                    borderRadius: "8px",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="lucro"
                  stroke="#10B981"
                  strokeWidth={3}
                  dot={{ fill: "#10B981", strokeWidth: 2, r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

export default Dashboard;
