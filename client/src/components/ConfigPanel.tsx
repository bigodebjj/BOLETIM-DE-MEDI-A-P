import { useEffect, useState } from 'react'
import { configService } from '../services/api'
import type { ConfigItem } from '../types'

interface ConfigPanelProps {
  showToast: (msg: string, type: 'success' | 'error' | 'info') => void
}

function ConfigPanel({ showToast }: ConfigPanelProps) {
  const [driveId, setDriveId] = useState('')
  const [driveUploadUrl, setDriveUploadUrl] = useState('')
  const [adminEmail, setAdminEmail] = useState('')

  useEffect(() => {
    configService.list().then(items => {
      const drive = items.find((i: ConfigItem) => i.chave === 'DRIVE_ROOT_FOLDER_ID')
      const url = items.find((i: ConfigItem) => i.chave === 'DRIVE_UPLOAD_URL')
      const email = items.find((i: ConfigItem) => i.chave === 'ADMIN_EMAIL')
      if (drive) setDriveId(drive.valor)
      if (url) setDriveUploadUrl(url.valor)
      if (email) setAdminEmail(email.valor)
    })
  }, [])

  const handleSave = async () => {
    try {
      await configService.save([
        { chave: 'DRIVE_ROOT_FOLDER_ID', valor: driveId },
        { chave: 'DRIVE_UPLOAD_URL', valor: driveUploadUrl },
        { chave: 'ADMIN_EMAIL', valor: adminEmail }
      ])
      showToast('Configurações salvas!', 'success')
    } catch (err: any) {
      showToast('Erro: ' + (err.response?.data?.error || err.message), 'error')
    }
  }

  return (
    <div className="card">
      <div className="card-header"><i className="fas fa-sliders"></i> Configurações do App</div>
      <div className="form-grid">
        <div className="form-group full-width">
          <label><i className="fas fa-link"></i>URL do Apps Script (Google Drive)</label>
          <input className="form-control" value={driveUploadUrl}
            onChange={e => setDriveUploadUrl(e.target.value)}
            placeholder="https://script.google.com/macros/s/SEU_ID/exec" />
          <small style={{ color: 'var(--gray)', fontSize: '0.75rem', marginTop: 4, display: 'block' }}>
            Cole aqui a URL do Google Apps Script que você criou para upload no Drive
          </small>
        </div>
        <div className="form-group full-width">
          <label><i className="fab fa-google-drive"></i>ID da Pasta Raiz no Google Drive</label>
          <input className="form-control" value={driveId}
            onChange={e => setDriveId(e.target.value)}
            placeholder="Ex: 1aBcDeFgHiJkLmNoPqRsTuVwXyZ" />
          <small style={{ color: 'var(--gray)', fontSize: '0.75rem', marginTop: 4, display: 'block' }}>
            O ID está na URL da pasta: drive.google.com/drive/folders/<b>AQUI_ESTA_O_ID</b>
          </small>
        </div>
        <div className="form-group full-width">
          <label><i className="fas fa-envelope"></i>E-mail Admin</label>
          <input className="form-control" value={adminEmail}
            onChange={e => setAdminEmail(e.target.value)} placeholder="admin@email.com" />
        </div>
      </div>
      <button className="btn btn-primary" onClick={handleSave} style={{ marginTop: 16 }}>
        <i className="fas fa-save"></i>Salvar Configurações
      </button>
    </div>
  )
}

export default ConfigPanel
