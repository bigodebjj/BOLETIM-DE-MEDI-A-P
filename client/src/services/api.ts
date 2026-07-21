import axios from 'axios';
import type { Documento, DashboardData, ConfigItem } from '../types';

const http = axios.create({ baseURL: '/api' });

export const documentService = {
  list: (filters?: Partial<Documento> & { search?: string }) =>
    http.get<Documento[]>('/documents', { params: filters }).then(r => r.data),

  getById: (id: number) =>
    http.get<Documento>(`/documents/${id}`).then(r => r.data),

  create: (doc: Partial<Documento>) =>
    http.post<Documento>('/documents', doc).then(r => r.data),

  update: (id: number, doc: Partial<Documento>) =>
    http.put<Documento>(`/documents/${id}`, doc).then(r => r.data),

  delete: (id: number) =>
    http.delete(`/documents/${id}`).then(r => r.data),

  dashboard: () =>
    http.get<DashboardData>('/documents/dashboard').then(r => r.data),
};

export const configService = {
  list: () =>
    http.get<ConfigItem[]>('/config').then(r => r.data),

  save: (items: { chave: string; valor: string }[]) =>
    http.put('/config', items),
};

export const categoriasService = {
  list: () =>
    http.get('/categorias').then(r => r.data),

  listSub: () =>
    http.get('/subcategorias').then(r => r.data),
};
