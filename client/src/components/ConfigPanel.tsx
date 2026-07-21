import { useEffect, useState } from 'react'
import { configService } from '../services/api'
import type { ConfigItem } from '../types'

interface ConfigPanelProps {
  showToast: (msg: string, type: 'success' | 'error' | 'info') => void
}

function ConfigPanel({ showToast }: ConfigPanelProps) {
  const [driveLink, setDriveLink] = useState('')
  const [adminEmail, setAdminEmail] = useState('')

  useEffect(() => {
    configService.list().then((items: ConfigItem[]) => {
      const drive = items.find(i => i.chave === 'DRIVE_ROOT_FOLDER_ID')
      const email = items.find(i => i.chave === 'ADMIN_EMAIL')
      if (drive) setDriveLink(drive.valor)
      if (email) setAdminEmail(email.valor)
    })
  }, [])

  const handleSave = async () => {
    try {
      await configService.save([
        { chave: 'DRIVE_ROOT_FOLDER_ID', valor: driveLink },
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
          <label><i className="fab fa-google-drive"></i>Link da Pasta no Google Drive</label>
          <input className="form-control" value={driveLink}
            onChange={e => setDriveLink(e.target.value)}
            placeholder="https://drive.google.com/drive/folders/..." />
          <small style={{ color: 'var(--gray)', fontSize: '0.75rem', marginTop: 4, display: 'block' }}>
            Cole aqui o link da pasta do Google Drive onde os documentos estão armazenados
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
