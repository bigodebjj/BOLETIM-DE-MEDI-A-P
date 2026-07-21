import { useState, useRef, useEffect } from 'react'
import { uploadFile } from '../firebase'
import { documentService, categoriasService } from '../services/api'
import type { Categoria, Subcategoria } from '../types'

interface DocumentFormProps {
  showToast: (msg: string, type: 'success' | 'error' | 'info') => void
  onSaved: () => void
}

const MESES = [
  '01 JAN','02 FEV','03 MAR','04 ABR','05 MAI','06 JUN',
  '07 JUL','08 AGO','09 SET','10 OUT','11 NOV','12 DEZ'
]

function DocumentForm({ showToast, onSaved }: DocumentFormProps) {
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [subcategorias, setSubcategorias] = useState<Subcategoria[]>([])
  const [file, setFile] = useState<File | null>(null)
  const [saving, setSaving] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    categoriasService.list().then(setCategorias)
    categoriasService.listSub().then(setSubcategorias)
  }, [])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSaving(true)

    const form = e.currentTarget
    const fd = new FormData(form)

    try {
      let uploadResult: { url: string; name: string; mimeType: string } | null = null
      if (file) {
        uploadResult = await uploadFile(file)
      }

      await documentService.create({
        ano: fd.get('ano') as string,
        mes: fd.get('mes') as string,
        categoria: fd.get('categoria') as string,
        subcategoria: (fd.get('subcategoria') as string) || '',
        tipoDocumento: (fd.get('tipoDocumento') as string) || '',
        fornecedor: (fd.get('fornecedor') as string) || '',
        numDocumento: (fd.get('numDocumento') as string) || '',
        valor: Number(fd.get('valor')) || 0,
        dataEmissao: (fd.get('dataEmissao') as string) || '',
        nomeArquivo: uploadResult?.name || '',
        linkArquivo: uploadResult?.url || '',
        mimeType: uploadResult?.mimeType || '',
        status: (fd.get('status') as string) || 'PENDENTE',
        responsavel: (fd.get('responsavel') as string) || '',
        observacoes: (fd.get('observacoes') as string) || '',
      })

      showToast('Documento salvo com sucesso!', 'success')
      form.reset()
      setFile(null)
      onSaved()
    } catch (err: any) {
      showToast('Erro: ' + (err.response?.data?.error || err.message), 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="card">
      <div className="card-header"><i className="fas fa-file-circle-plus"></i> Novo Documento</div>
      <form id="docForm" onSubmit={handleSubmit}>
        <div className="form-grid">
          <div className="form-group">
            <label><i className="fas fa-calendar"></i>Ano</label>
            <select className="form-control" name="ano" required defaultValue="">
              <option value="" disabled>Selecione...</option>
              <option value="2025">2025</option>
              <option value="2026">2026</option>
            </select>
          </div>
          <div className="form-group">
            <label><i className="fas fa-calendar-day"></i>Mês</label>
            <select className="form-control" name="mes" required defaultValue="">
              <option value="" disabled>Selecione...</option>
              {MESES.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label><i className="fas fa-tag"></i>Categoria</label>
            <select className="form-control" name="categoria" required defaultValue="">
              <option value="" disabled>Selecione...</option>
              {categorias.map(c => (
                <option key={c.codigo} value={`${c.codigo} ${c.nome}`}>{c.codigo} {c.nome}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label><i className="fas fa-sitemap"></i>Subcategoria</label>
            <select className="form-control" name="subcategoria" defaultValue="">
              <option value="">N/A</option>
              {subcategorias.map(s => (
                <option key={s.codigo} value={`${s.codigo} ${s.nome}`}>{s.codigo} {s.nome}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label><i className="fas fa-file-lines"></i>Tipo Documento</label>
            <input className="form-control" name="tipoDocumento" placeholder="Ex: Nota Fiscal, Relatório..." />
          </div>
          <div className="form-group">
            <label><i className="fas fa-building"></i>Fornecedor</label>
            <input className="form-control" name="fornecedor" placeholder="Nome do fornecedor" />
          </div>
          <div className="form-group">
            <label><i className="fas fa-hashtag"></i>Nº Documento</label>
            <input className="form-control" name="numDocumento" placeholder="Número do documento" />
          </div>
          <div className="form-group">
            <label><i className="fas fa-dollar-sign"></i>Valor (R$)</label>
            <input className="form-control" name="valor" type="number" step="0.01" placeholder="0,00" />
          </div>
          <div className="form-group">
            <label><i className="fas fa-calendar-check"></i>Data Emissão</label>
            <input className="form-control" name="dataEmissao" type="date" />
          </div>
          <div className="form-group">
            <label><i className="fas fa-user-tie"></i>Responsável</label>
            <input className="form-control" name="responsavel" placeholder="Quem cadastrou" />
          </div>
          <div className="form-group">
            <label><i className="fas fa-flag"></i>Status</label>
            <select className="form-control" name="status" defaultValue="PENDENTE">
              <option value="PENDENTE">Pendente</option>
              <option value="CONFERIDO">Conferido</option>
              <option value="APROVADO">Aprovado</option>
              <option value="ARQUIVADO">Arquivado</option>
            </select>
          </div>
          <div className="form-group full-width">
            <label><i className="fas fa-upload"></i>Arquivo (PDF, imagem, planilha)</label>
            <div
              className="upload-area"
              onClick={() => fileInputRef.current?.click()}
              onDragOver={e => { e.preventDefault(); e.currentTarget.classList.add('drag-over') }}
              onDragLeave={e => e.currentTarget.classList.remove('drag-over')}
              onDrop={e => {
                e.preventDefault()
                e.currentTarget.classList.remove('drag-over')
                if (e.dataTransfer.files.length) {
                  setFile(e.dataTransfer.files[0])
                }
              }}
            >
              <i className="fas fa-cloud-upload-alt"></i>
              <p>Clique para selecionar ou arraste o arquivo aqui</p>
              <div className="file-name">{file?.name || ''}</div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              style={{ display: 'none' }}
              onChange={e => setFile(e.target.files?.[0] || null)}
            />
          </div>
          <div className="form-group full-width">
            <label><i className="fas fa-comment"></i>Observações</label>
            <textarea className="form-control" name="observacoes" placeholder="Observações adicionais..." rows={3}></textarea>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10, marginTop: 16, justifyContent: 'flex-end' }}>
          <button type="button" className="btn btn-outline" onClick={() => {
            const form = document.getElementById('docForm') as HTMLFormElement
            form.reset()
            setFile(null)
          }}>
            <i className="fas fa-eraser"></i>Limpar
          </button>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? <><i className="fas fa-spinner fa-spin"></i> Salvando...</> : <><i className="fas fa-save"></i>Salvar Documento</>}
          </button>
        </div>
      </form>
    </div>
  )
}

export default DocumentForm
