import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { DollarSign, User, Calendar, ShoppingCart } from "lucide-react";

function VendaDetails({ venda }) {
  if (!venda) return null;

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <ShoppingCart className="w-5 h-5 text-purple-400" />
          <span className="font-semibold text-white">Venda #{venda.id}</span>
        </div>
        <div className="flex items-center space-x-2">
          <User className="w-4 h-4 text-blue-400" />
          <span className="text-gray-300">
            {venda.clientes?.nome || "Cliente Desconhecido"}
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <Calendar className="w-4 h-4 text-gray-400" />
          <span className="text-gray-400">
            {new Date(venda.data_venda).toLocaleDateString("pt-BR")}
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <DollarSign className="w-4 h-4 text-gray-400" />
          <span className="text-gray-400">
            Total: R$ {venda.total.toFixed(2)}
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-gray-400">
            Método: {venda.metodo_pagamento}
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-gray-400">Status: {venda.status}</span>
        </div>
        {venda.observacoes && (
          <div className="text-gray-400">Observações: {venda.observacoes}</div>
        )}
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-300 mb-2">
          Itens da Venda
        </h3>
        <div className="space-y-2">
          {venda.itens?.map((item, index) => (
            <Card key={index} className="bg-white/5">
              <CardContent className="p-4">
                <div className="flex justify-between">
                  <div>
                    <span className="font-semibold text-white">
                      {item.produto_nome}
                    </span>
                    <div className="text-gray-400 text-sm">
                      Quantidade: {item.quantidade} | Preço: R${" "}
                      {item.preco.toFixed(2)} | Subtotal: R${" "}
                      {item.subtotal.toFixed(2)}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

export default VendaDetails;
