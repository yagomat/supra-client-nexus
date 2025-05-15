
import { Cliente, Pagamento, DashboardStats, ValoresPredefinidos, PaymentStatus } from "@/types";

// Este arquivo irá interagir com o Supabase uma vez que a integração esteja feita
// Por enquanto, usaremos dados mock para desenvolver a interface

// Dados mock para desenvolvimento
const clientes: Cliente[] = [
  {
    id: "1",
    created_at: "2023-01-15T10:30:00Z",
    nome: "João Silva",
    telefone: "(11) 98765-4321",
    uf: "SP",
    servidor: "Servidor A",
    dia_vencimento: 10,
    valor_plano: 49.90,
    dispositivo_smart: "Smart TV Samsung",
    aplicativo: "NetflixHD",
    usuario_aplicativo: "joao.silva",
    senha_aplicativo: "senha123",
    data_licenca_aplicativo: "2024-01-10",
    possui_tela_adicional: true,
    dispositivo_smart_2: "Smartphone",
    aplicativo_2: "MAX",
    usuario_2: "joao.max",
    senha_2: "max123",
    data_licenca_2: "2024-01-15",
    observacoes: "Cliente antigo, prefere contato por WhatsApp",
    status: "ativo"
  },
  {
    id: "2",
    created_at: "2023-03-20T14:15:00Z",
    nome: "Maria Oliveira",
    telefone: "(21) 99876-5432",
    uf: "RJ",
    servidor: "Servidor B",
    dia_vencimento: 15,
    valor_plano: 59.90,
    dispositivo_smart: "Amazon Fire Stick",
    aplicativo: "DisneyPlus",
    usuario_aplicativo: "maria.oliveira",
    senha_aplicativo: "disney123",
    data_licenca_aplicativo: "2024-02-15",
    possui_tela_adicional: false,
    dispositivo_smart_2: null,
    aplicativo_2: null,
    usuario_2: null,
    senha_2: null,
    data_licenca_2: null,
    observacoes: null,
    status: "ativo"
  },
  {
    id: "3",
    created_at: "2023-05-05T09:45:00Z",
    nome: "Pedro Santos",
    telefone: "(31) 97654-3210",
    uf: "MG",
    servidor: "Servidor C",
    dia_vencimento: 5,
    valor_plano: 39.90,
    dispositivo_smart: "Chromecast",
    aplicativo: "PrimeVideo",
    usuario_aplicativo: "pedro.santos",
    senha_aplicativo: "prime123",
    data_licenca_aplicativo: "2024-03-05",
    possui_tela_adicional: false,
    dispositivo_smart_2: null,
    aplicativo_2: null,
    usuario_2: null,
    senha_2: null,
    data_licenca_2: null,
    observacoes: "Contato apenas após às 18h",
    status: "inativo"
  },
  {
    id: "4",
    created_at: "2023-08-12T11:20:00Z",
    nome: "Ana Costa",
    telefone: "(41) 98765-1234",
    uf: "PR",
    servidor: "Servidor A",
    dia_vencimento: 20,
    valor_plano: 49.90,
    dispositivo_smart: "Smart TV LG",
    aplicativo: "HBO Max",
    usuario_aplicativo: "ana.costa",
    senha_aplicativo: "hbo123",
    data_licenca_aplicativo: "2024-04-20",
    possui_tela_adicional: true,
    dispositivo_smart_2: "iPad",
    aplicativo_2: "NetflixHD",
    usuario_2: "ana.netflix",
    senha_2: "netflix123",
    data_licenca_2: "2024-04-25",
    observacoes: null,
    status: "ativo"
  },
  {
    id: "5",
    created_at: "2024-04-18T16:40:00Z",
    nome: "Lucas Mendes",
    telefone: "(51) 99876-4321",
    uf: "RS",
    servidor: "Servidor D",
    dia_vencimento: 25,
    valor_plano: 69.90,
    dispositivo_smart: "Apple TV",
    aplicativo: "Star+",
    usuario_aplicativo: "lucas.mendes",
    senha_aplicativo: "star123",
    data_licenca_aplicativo: "2024-04-25",
    possui_tela_adicional: false,
    dispositivo_smart_2: null,
    aplicativo_2: null,
    usuario_2: null,
    senha_2: null,
    data_licenca_2: null,
    observacoes: "Cliente novo",
    status: "ativo"
  }
];

const pagamentos: Pagamento[] = [
  {
    id: "1",
    cliente_id: "1",
    mes: 4,
    ano: 2024,
    status: "pago",
    data_pagamento: "2024-04-08T10:15:00Z",
    created_at: "2024-04-08T10:15:00Z"
  },
  {
    id: "2",
    cliente_id: "1",
    mes: 3,
    ano: 2024,
    status: "pago",
    data_pagamento: "2024-03-09T14:20:00Z",
    created_at: "2024-03-09T14:20:00Z"
  },
  {
    id: "3",
    cliente_id: "2",
    mes: 4,
    ano: 2024,
    status: "pago_confianca",
    data_pagamento: "2024-04-12T09:30:00Z",
    created_at: "2024-04-12T09:30:00Z"
  },
  {
    id: "4",
    cliente_id: "2",
    mes: 3,
    ano: 2024,
    status: "pago",
    data_pagamento: "2024-03-14T16:45:00Z",
    created_at: "2024-03-14T16:45:00Z"
  },
  {
    id: "5",
    cliente_id: "3",
    mes: 4,
    ano: 2024,
    status: "nao_pago",
    data_pagamento: null,
    created_at: "2024-04-01T00:00:00Z"
  },
  {
    id: "6",
    cliente_id: "3",
    mes: 3,
    ano: 2024,
    status: "pago",
    data_pagamento: "2024-03-05T11:20:00Z",
    created_at: "2024-03-05T11:20:00Z"
  },
  {
    id: "7",
    cliente_id: "4",
    mes: 4,
    ano: 2024,
    status: "pago",
    data_pagamento: "2024-04-18T13:10:00Z",
    created_at: "2024-04-18T13:10:00Z"
  },
  {
    id: "8",
    cliente_id: "4",
    mes: 3,
    ano: 2024,
    status: "pago",
    data_pagamento: "2024-03-20T15:30:00Z",
    created_at: "2024-03-20T15:30:00Z"
  },
  {
    id: "9",
    cliente_id: "5",
    mes: 4,
    ano: 2024,
    status: "pago",
    data_pagamento: "2024-04-18T16:45:00Z",
    created_at: "2024-04-18T16:45:00Z"
  }
];

const dashboardStats: DashboardStats = {
  clientes_ativos: 4,
  clientes_inativos: 1,
  clientes_novos: 1,
  evolucao_clientes: [
    { mes: "Maio/23", quantidade: 1 },
    { mes: "Jun/23", quantidade: 1 },
    { mes: "Jul/23", quantidade: 1 },
    { mes: "Ago/23", quantidade: 2 },
    { mes: "Set/23", quantidade: 2 },
    { mes: "Out/23", quantidade: 2 },
    { mes: "Nov/23", quantidade: 3 },
    { mes: "Dez/23", quantidade: 3 },
    { mes: "Jan/24", quantidade: 3 },
    { mes: "Fev/24", quantidade: 3 },
    { mes: "Mar/24", quantidade: 4 },
    { mes: "Abr/24", quantidade: 5 }
  ],
  distribuicao_dispositivos: [
    { dispositivo: "Smart TV", quantidade: 2 },
    { dispositivo: "Fire Stick", quantidade: 1 },
    { dispositivo: "Chromecast", quantidade: 1 },
    { dispositivo: "Apple TV", quantidade: 1 }
  ],
  distribuicao_aplicativos: [
    { aplicativo: "NetflixHD", quantidade: 2 },
    { aplicativo: "DisneyPlus", quantidade: 1 },
    { aplicativo: "PrimeVideo", quantidade: 1 },
    { aplicativo: "HBO Max", quantidade: 1 },
    { aplicativo: "Star+", quantidade: 1 }
  ],
  distribuicao_ufs: [
    { uf: "SP", quantidade: 1 },
    { uf: "RJ", quantidade: 1 },
    { uf: "MG", quantidade: 1 },
    { uf: "PR", quantidade: 1 },
    { uf: "RS", quantidade: 1 }
  ],
  distribuicao_servidores: [
    { servidor: "Servidor A", quantidade: 2 },
    { servidor: "Servidor B", quantidade: 1 },
    { servidor: "Servidor C", quantidade: 1 },
    { servidor: "Servidor D", quantidade: 1 }
  ]
};

const valoresPredefinidos: ValoresPredefinidos = {
  ufs: ["AC", "AL", "AM", "AP", "BA", "CE", "DF", "ES", "GO", "MA", "MG", "MS", "MT", "PA", "PB", "PE", "PI", "PR", "RJ", "RN", "RO", "RR", "RS", "SC", "SE", "SP", "TO"],
  servidores: ["Servidor A", "Servidor B", "Servidor C", "Servidor D", "Servidor E"],
  dias_vencimento: [1, 5, 10, 15, 20, 25, 30],
  valores_plano: [29.90, 39.90, 49.90, 59.90, 69.90, 79.90, 89.90, 99.90],
  dispositivos_smart: ["Smart TV Samsung", "Smart TV LG", "Smart TV TCL", "Amazon Fire Stick", "Apple TV", "Chromecast", "Roku", "Smartphone", "Tablet", "Computador"],
  aplicativos: ["NetflixHD", "DisneyPlus", "PrimeVideo", "HBO Max", "Star+", "Paramount+", "Apple TV+", "MAX", "Globoplay"]
};

// Funções para interagir com o banco de dados
export async function getClientes(): Promise<Cliente[]> {
  // Quando integrado com Supabase, faremos a chamada real à API
  return Promise.resolve([...clientes].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()));
}

export async function getClienteById(id: string): Promise<Cliente | undefined> {
  // Quando integrado com Supabase, faremos a chamada real à API
  return Promise.resolve(clientes.find(cliente => cliente.id === id));
}

export async function createCliente(cliente: Omit<Cliente, "id" | "created_at" | "status">): Promise<Cliente> {
  // Quando integrado com Supabase, faremos a chamada real à API
  const newCliente: Cliente = {
    ...cliente,
    id: `${clientes.length + 1}`,
    created_at: new Date().toISOString(),
    status: "ativo" // Status inicial ao criar
  };
  
  clientes.push(newCliente);
  return Promise.resolve(newCliente);
}

export async function updateCliente(id: string, cliente: Partial<Cliente>): Promise<Cliente> {
  // Quando integrado com Supabase, faremos a chamada real à API
  const index = clientes.findIndex(c => c.id === id);
  if (index === -1) {
    return Promise.reject(new Error("Cliente não encontrado"));
  }
  
  const updatedCliente = { ...clientes[index], ...cliente };
  clientes[index] = updatedCliente;
  return Promise.resolve(updatedCliente);
}

export async function deleteCliente(id: string): Promise<void> {
  // Quando integrado com Supabase, faremos a chamada real à API
  const index = clientes.findIndex(c => c.id === id);
  if (index === -1) {
    return Promise.reject(new Error("Cliente não encontrado"));
  }
  
  clientes.splice(index, 1);
  return Promise.resolve();
}

export async function getPagamentos(clienteId?: string): Promise<Pagamento[]> {
  // Quando integrado com Supabase, faremos a chamada real à API
  if (clienteId) {
    return Promise.resolve(pagamentos.filter(p => p.cliente_id === clienteId));
  }
  return Promise.resolve(pagamentos);
}

export async function createPagamento(pagamento: Omit<Pagamento, "id" | "created_at">): Promise<Pagamento> {
  // Quando integrado com Supabase, faremos a chamada real à API
  const newPagamento: Pagamento = {
    ...pagamento,
    id: `${pagamentos.length + 1}`,
    created_at: new Date().toISOString()
  };
  
  pagamentos.push(newPagamento);
  
  // Atualizar status do cliente baseado no pagamento
  updateClienteStatusBasedOnPayment(pagamento.cliente_id);
  
  return Promise.resolve(newPagamento);
}

export async function updatePagamento(id: string, status: PaymentStatus): Promise<Pagamento> {
  // Quando integrado com Supabase, faremos a chamada real à API
  const index = pagamentos.findIndex(p => p.id === id);
  if (index === -1) {
    return Promise.reject(new Error("Pagamento não encontrado"));
  }
  
  const updatedPagamento = { 
    ...pagamentos[index], 
    status,
    data_pagamento: status !== "nao_pago" ? new Date().toISOString() : null
  };
  pagamentos[index] = updatedPagamento;
  
  // Atualizar status do cliente baseado no pagamento
  updateClienteStatusBasedOnPayment(updatedPagamento.cliente_id);
  
  return Promise.resolve(updatedPagamento);
}

function updateClienteStatusBasedOnPayment(clienteId: string) {
  // Esta função simula o que seria feito pelo Supabase
  // Lógica para determinar se o cliente está ativo ou inativo com base nos pagamentos
  const cliente = clientes.find(c => c.id === clienteId);
  if (!cliente) return;
  
  const clientePagamentos = pagamentos
    .filter(p => p.cliente_id === clienteId)
    .sort((a, b) => new Date(b.data_pagamento || b.created_at).getTime() - new Date(a.data_pagamento || a.created_at).getTime());
  
  if (clientePagamentos.length === 0) {
    cliente.status = "inativo";
    return;
  }
  
  const ultimoPagamento = clientePagamentos[0];
  
  // Se o último pagamento não foi pago, o cliente está inativo
  if (ultimoPagamento.status === "nao_pago") {
    cliente.status = "inativo";
    return;
  }
  
  // Verificamos se está dentro do prazo de vencimento
  const dataPagamento = new Date(ultimoPagamento.data_pagamento || ultimoPagamento.created_at);
  const dataVencimento = new Date(dataPagamento);
  dataVencimento.setMonth(dataVencimento.getMonth() + 1);
  dataVencimento.setDate(cliente.dia_vencimento);
  
  // Se hoje é antes ou igual ao dia de vencimento, o cliente está ativo
  if (new Date() <= dataVencimento) {
    cliente.status = "ativo";
  } else {
    cliente.status = "inativo";
  }
}

export async function getDashboardStats(): Promise<DashboardStats> {
  // Quando integrado com Supabase, faremos a chamada real à API
  return Promise.resolve(dashboardStats);
}

export async function getValoresPredefinidos(): Promise<ValoresPredefinidos> {
  // Quando integrado com Supabase, faremos a chamada real à API
  return Promise.resolve(valoresPredefinidos);
}

export async function updateValoresPredefinidos(campo: keyof ValoresPredefinidos, valores: string[] | number[]): Promise<ValoresPredefinidos> {
  // Quando integrado com Supabase, faremos a chamada real à API
  if (campo in valoresPredefinidos) {
    valoresPredefinidos[campo] = valores as any;
  }
  return Promise.resolve(valoresPredefinidos);
}
