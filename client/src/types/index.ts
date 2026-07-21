export interface Documento {
  id: number;
  ano: string;
  mes: string;
  categoria: string;
  subcategoria: string;
  tipoDocumento: string;
  fornecedor: string;
  numDocumento: string;
  valor: number;
  dataEmissao: string;
  dataUpload: string;
  nomeArquivo: string;
  linkArquivo: string;
  mimeType: string;
  status: string;
  responsavel: string;
  observacoes: string;
}

export interface DashboardData {
  total: number;
  porAno: Record<string, number>;
  porStatus: Record<string, number>;
  porCategoria: Record<string, number>;
  valorTotal: number;
}

export interface Categoria {
  codigo: string;
  nome: string;
}

export interface Subcategoria {
  codigo: string;
  nome: string;
}

export interface ConfigItem {
  chave: string;
  valor: string;
  descricao: string;
}

export interface UploadResult {
  id: string;
  name: string;
  url: string;
  mimeType: string;
  size: number;
}

export type TabName = 'dashboard' | 'upload' | 'list' | 'config';
