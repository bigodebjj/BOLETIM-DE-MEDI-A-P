import { useEffect, useState } from 'react'
import { documentService } from '../services/api'
import Modal from './Modal'
import type { Documento } from '../types'

interface DocumentListProps {
  showToast: (msg: string, type: 'success' | 'error' | 'info') => void
  onEdit: () => void
}

const MESES = ['01 JAN','02 FEV','03 MAR','04 ABR','05 MAI','06 JUN','07 JUL','08 AGO','09 SET','10 OUT','11 NOV','12 DEZ']

function DocumentList({ showToast }: DocumentListProps) {
  const [docs, setDocs] = useState<Documento[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    ano: '', mes: '', categoria: '', status: '', search: ''
  })
  const [editDoc, setEditDoc] = useState<Documento | null>(null)
  const [editForm, setEditForm] = useState<Partial<Documento>>({})

  const loadDocs = () => {
    setLoading(true)
    const activeFilters: any = {}
    Object.entries(filters).forEach(([k, v]) => { if (v) activeFilters[k] = v })

    documentService.list(activeFilters)
      .then(data => setDocs(data))
      .catch(err => showToast('Erro ao carregar: ' + err.message, 'error'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { loadDocs() }, [])

  const handleDelete = (id: number) => {
    if (!confirm(`Excluir documento #${id}?`)) return
    documentService.delete(id)
      .then(() => {
        showToast(`Documento #${id} excluído`, 'info')
        loadDocs()
      })
      .catch(err => showToast('Erro: ' + err.message, 'error'))
  }

  const openEdit = (doc: Documento) => {
    setEditDoc(doc)
    setEditForm({ ...doc })
  }

  const saveEdit = async () => {
    if (!editDoc) return
    try {
      await documentService.update(editDoc.id, editForm)
      showToast(`Documento #${editDoc.id} atualizado!`, 'success')
      setEditDoc(null)
      loadDocs()
    } catch (err: any) {
      showToast('Erro: ' + (err.response?.data?.error || err.message), 'error')
    }
  }

  return (
    <div className="card">
      <div className="card-header">
        <span><i className="fas fa-search"></i> Consultar Documentos</span>
      </div>

      <div className="filters-row">
        <select className="form-control" value={filters.ano} onChange={e => setFilters(f => ({ ...f, ano: e.target.value }))}>
          <option value="">Todos os anos</option>
          <option value="2025">2025</option>
          <option value="2026">2026</option>
        </select>
        <select className="form-control" value={filters.mes} onChange={e => setFilters(f => ({ ...f, mes: e.target.value }))}>
          <option value="">Todos os meses</option>
          {MESES.map(m => <option key={m} value={m}>{m.substring(3)}</option>)}
        </select>
        <select className="form-control" value={filters.categoria} onChange={e => setFilters(f => ({ ...f, categoria: e.target.value }))}>
          <option value="">Todas categorias</option>
          <option value="01 EQUIPE RESIDENTE">Equipe Residente</option>
          <option value="02 AQUISIÇÃO DE PEÇAS INSUMOS E SERVIÇOS">Aquisição Peças</option>
          <option value="03 DEPRECIAÇÃO">Depreciação</option>
          <option value="04 IMPOSTOS E OBRIGAÇÕES">Impostos</option>
          <option value="05 ADM LOCAL">Adm Local</option>
        </select>
        <select className="form-control" value={filters.status} onChange={e => setFilters(f => ({ ...f, status: e.target.value }))}>
          <option value="">Todos status</option>
          <option value="PENDENTE">Pendente</option>
          <option value="CONFERIDO">Conferido</option>
          <option value="APROVADO">Aprovado</option>
          <option value="ARQUIVADO">Arquivado</option>
        </select>
        <input className="form-control" placeholder="Buscar..." value={filters.search}
          onChange={e => setFilters(f => ({ ...f, search: e.target.value }))}
          onKeyDown={e => e.key === 'Enter' && loadDocs()}
          style={{ maxWidth: 200 }} />
        <button className="btn btn-primary btn-sm" onClick={loadDocs}><i className="fas fa-filter"></i>Filtrar</button>
        <button className="btn btn-outline btn-sm" onClick={() => {
          setFilters({ ano: '', mes: '', categoria: '', status: '', search: '' })
          setTimeout(loadDocs, 0)
        }}><i className="fas fa-times"></i>Limpar</button>
      </div>

      {loading ? (
        <div className="loading"><div className="spinner"></div><p>Carregando documentos...</p></div>
      ) : docs.length === 0 ? (
        <div className="empty-state">
          <i className="fas fa-file-circle-exclamation"></i>
          <p>Nenhum documento encontrado</p>
        </div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>ID</th><th>Ano</th><th>Mês</th><th>Categoria</th><th>Sub</th>
                <th>Tipo</th><th>Fornecedor</th><th>Nº Doc</th><th>Valor</th>
                <th>Arquivo</th><th>Status</th><th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {docs.map(d => (
                <tr key={d.id}>
                  <td>{d.id}</td>
                  <td>{d.ano}</td>
                  <td>{d.mes}</td>
                  <td style={{ maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis' }}>{d.categoria?.substring(3)}</td>
                  <td style={{ fontSize: '0.75rem' }}>{d.subcategoria}</td>
                  <td style={{ maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis' }}>{d.tipoDocumento}</td>
                  <td style={{ maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis' }}>{d.fornecedor}</td>
                  <td>{d.numDocumento}</td>
                  <td>{d.valor ? Number(d.valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : ''}</td>
                  <td>
                    {d.linkArquivo ? (
                      <a href={d.linkArquivo} target="_blank" rel="noopener noreferrer" className="file-link">
                        <i className="fas fa-external-link-alt"></i>
                      </a>
                    ) : '-'}
                  </td>
                  <td><span className={`status-badge status-${d.status}`}>{d.status}</span></td>
                  <td>
                    <div className="action-btns">
                      <button className="btn btn-primary btn-sm" onClick={() => openEdit(d)}>
                        <i className="fas fa-edit"></i>
                      </button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(d.id)}>
                        <i className="fas fa-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        title={`<i class="fas fa-pen-to-square"></i> Editar #${editDoc?.id || ''}`}
        open={!!editDoc}
        onClose={() => setEditDoc(null)}
      >
        <form onSubmit={e => { e.preventDefault(); saveEdit() }}>
          <div className="form-grid">
            <div className="form-group">
              <label>Ano</label>
              <select className="form-control" value={editForm.ano || ''}
                onChange={e => setEditForm(f => ({ ...f, ano: e.target.value }))}>
                <option value="2025">2025</option>
                <option value="2026">2026</option>
              </select>
            </div>
            <div className="form-group">
              <label>Mês</label>
              <select className="form-control" value={editForm.mes || ''}
                onChange={e => setEditForm(f => ({ ...f, mes: e.target.value }))}>
                {MESES.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Categoria</label>
              <select className="form-control" value={editForm.categoria || ''}
                onChange={e => setEditForm(f => ({ ...f, categoria: e.target.value }))}>
                <option value="01 EQUIPE RESIDENTE">Equipe Residente</option>
                <option value="02 AQUISIÇÃO DE PEÇAS INSUMOS E SERVIÇOS">Aquisição Peças</option>
                <option value="03 DEPRECIAÇÃO">Depreciação</option>
                <option value="04 IMPOSTOS E OBRIGAÇÕES">Impostos</option>
                <option value="05 ADM LOCAL">Adm Local</option>
              </select>
            </div>
            <div className="form-group">
              <label>Subcategoria</label>
              <input className="form-control" value={editForm.subcategoria || ''}
                onChange={e => setEditForm(f => ({ ...f, subcategoria: e.target.value }))} />
            </div>
            <div className="form-group">
              <label>Tipo Doc</label>
              <input className="form-control" value={editForm.tipoDocumento || ''}
                onChange={e => setEditForm(f => ({ ...f, tipoDocumento: e.target.value }))} />
            </div>
            <div className="form-group">
              <label>Fornecedor</label>
              <input className="form-control" value={editForm.fornecedor || ''}
                onChange={e => setEditForm(f => ({ ...f, fornecedor: e.target.value }))} />
            </div>
            <div className="form-group">
              <label>Nº Documento</label>
              <input className="form-control" value={editForm.numDocumento || ''}
                onChange={e => setEditForm(f => ({ ...f, numDocumento: e.target.value }))} />
            </div>
            <div className="form-group">
              <label>Valor</label>
              <input className="form-control" type="number" step="0.01" value={editForm.valor || ''}
                onChange={e => setEditForm(f => ({ ...f, valor: Number(e.target.value) }))} />
            </div>
            <div className="form-group">
              <label>Data Emissão</label>
              <input className="form-control" type="date" value={editForm.dataEmissao || ''}
                onChange={e => setEditForm(f => ({ ...f, dataEmissao: e.target.value }))} />
            </div>
            <div className="form-group">
              <label>Status</label>
              <select className="form-control" value={editForm.status || 'PENDENTE'}
                onChange={e => setEditForm(f => ({ ...f, status: e.target.value }))}>
                <option value="PENDENTE">Pendente</option>
                <option value="CONFERIDO">Conferido</option>
                <option value="APROVADO">Aprovado</option>
                <option value="ARQUIVADO">Arquivado</option>
              </select>
            </div>
            <div className="form-group">
              <label>Responsável</label>
              <input className="form-control" value={editForm.responsavel || ''}
                onChange={e => setEditForm(f => ({ ...f, responsavel: e.target.value }))} />
            </div>
            <div className="form-group full-width">
              <label>Observações</label>
              <textarea className="form-control" rows={2} value={editForm.observacoes || ''}
                onChange={e => setEditForm(f => ({ ...f, observacoes: e.target.value }))} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 12, justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-outline" onClick={() => setEditDoc(null)}>Cancelar</button>
            <button type="submit" className="btn btn-primary"><i className="fas fa-save"></i>Atualizar</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default DocumentList
