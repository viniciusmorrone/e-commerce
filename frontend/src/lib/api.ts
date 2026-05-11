import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface Produto {
  id: string;
  nome: string;
  slug: string;
  descricao?: string;
  preco: number;
  ativo: boolean;
  categoria_id: string;
  criado_em: string;
  atualizado_em: string;
  variantes: Variante[];
  imagens: Imagem[];
}

export interface Variante {
  id: string;
  produto_id: string;
  tamanho?: string;
  cor?: string;
  qtd_estoque: number;
  sku: string;
  criado_em: string;
}

export interface Imagem {
  id: string;
  produto_id: string;
  url: string;
  ordem: number;
  principal: boolean;
  criado_em: string;
}

export interface Categoria {
  id: string;
  nome: string;
  slug: string;
  pai_id?: string;
  criado_em: string;
  subcategorias: Categoria[];
}

export interface ProdutoListItem {
  id: string;
  nome: string;
  slug: string;
  preco: number;
  ativo: boolean;
  imagem_principal?: string;
}

export const produtosApi = {
  listar: async (params?: {
    categoria_id?: string;
    cor?: string;
    tamanho?: string;
    ordenar?: string;
    ordem?: string;
    limite?: number;
    offset?: number;
  }) => {
    const response = await api.get<ProdutoListItem[]>('/produtos', { params });
    return response.data;
  },

  obter: async (slug: string) => {
    const response = await api.get<Produto>(`/produtos/${slug}`);
    return response.data;
  },

  gerarLinkWhatsApp: async (slug: string, varianteId?: string) => {
    const response = await api.get<{ url: string; mensagem: string }>(
      `/produtos/${slug}/whatsapp`,
      { params: { variante_id: varianteId } }
    );
    return response.data;
  },
};

export const categoriasApi = {
  listar: async () => {
    const response = await api.get<Categoria[]>('/categorias');
    return response.data;
  },
};

export interface AdminLoginPayload {
  email: string;
  password: string;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
}

export const authApi = {
  login: async (payload: AdminLoginPayload): Promise<TokenResponse> => {
    const response = await api.post<TokenResponse>('/admin/auth/login', payload);
    return response.data;
  },
};
