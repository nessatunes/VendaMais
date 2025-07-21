// src/utils/formatters.js

/**
 * Formata CPF para exibição
 * @param {string} value - CPF apenas números (ex: "12345678901")
 * @returns {string} - CPF formatado (ex: "123.456.789-01")
 */
export const formatCPF = (value) => {
  if (!value) return "";

  return value
    .replace(/\D/g, "") // Remove tudo que não é dígito
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})/, "$1-$2")
    .replace(/(-\d{2})\d+?$/, "$1"); // Limita a 11 dígitos
};

/**
 * Formata telefone para exibição
 * @param {string} value - Telefone apenas números (ex: "11987654321")
 * @returns {string} - Telefone formatado (ex: "(11) 98765-4321")
 */
export const formatTelefone = (value) => {
  if (!value) return "";

  const cleaned = value.replace(/\D/g, "");

  if (cleaned.length <= 10) {
    // Telefone fixo: (00) 0000-0000
    return cleaned
      .replace(/(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{4})(\d)/, "$1-$2");
  } else {
    // Celular: (00) 00000-0000
    return cleaned
      .replace(/(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{5})(\d)/, "$1-$2")
      .replace(/(-\d{4})\d+?$/, "$1");
  }
};

/**
 * Formata CEP para exibição
 * @param {string} value - CEP apenas números (ex: "01234567")
 * @returns {string} - CEP formatado (ex: "01234-567")
 */
export const formatCEP = (value) => {
  if (!value) return "";

  return value
    .replace(/\D/g, "")
    .replace(/(\d{5})(\d)/, "$1-$2")
    .replace(/(-\d{3})\d+?$/, "$1");
};

/**
 * Remove toda formatação de um campo
 * @param {string} value - Valor com formatação
 * @returns {string} - Apenas números
 */
export const removeFormatacao = (value) => {
  if (!value) return "";
  return value.replace(/\D/g, "");
};

/**
 * Formata valor monetário
 * @param {number|string} value - Valor numérico
 * @returns {string} - Valor formatado (ex: "R$ 1.234,56")
 */
export const formatMoney = (value) => {
  if (!value && value !== 0) return "";

  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
};

/**
 * Valida CPF
 * @param {string} cpf - CPF apenas números
 * @returns {boolean} - true se válido
 */
export const validarCPF = (cpf) => {
  if (!cpf) return false;

  const cleanCPF = cpf.replace(/\D/g, "");

  if (cleanCPF.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(cleanCPF)) return false; // CPFs com todos os números iguais

  // Validação dos dígitos verificadores
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (10 - i);
  }
  let remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleanCPF.charAt(9))) return false;

  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (11 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleanCPF.charAt(10))) return false;

  return true;
};

/**
 * Valida telefone brasileiro
 * @param {string} telefone - Telefone apenas números
 * @returns {boolean} - true se válido
 */
export const validarTelefone = (telefone) => {
  if (!telefone) return false;

  const cleanTel = telefone.replace(/\D/g, "");

  // Aceita 10 dígitos (fixo) ou 11 dígitos (celular)
  return cleanTel.length === 10 || cleanTel.length === 11;
};
