import { useEffect, useState } from 'react'
import { configService } from '../services/api'
import type { ConfigItem } from '../types'

interface ConfigPanelProps {
  showToast: (msg: string, type: 'success' | 'error' | 'info') => void
}

function ConfigPanel({ showToast }: ConfigPanelProps) {
  const [driveFolderId, setDriveFolderId] = useState('')
  const [driveUploadUrl, setDriveUploadUrl] = useState('')
  const [adminEmail, setAdminEmail] = useState('')

  useEffect(() => {
    configService.list().then((items: ConfigItem[]) => {
      const folderId = items.find(i => i.chave === 'DRIVE_ROOT_FOLDER_ID')
      const url = items.find(i => i.chave === 'DRIVE_UPLOAD_URL')
      const email = items.find(i => i.chave === 'ADMIN_EMAIL')
      if (folderId) setDriveFolderId(folderId.valor)
      if (url) setDriveUploadUrl(url.valor)
      if (email) setAdminEmail(email.valor)
    })
  }, [])

  const handleSave = async () => {
    try {
      await configService.save([
        { chave: 'DRIVE_ROOT_FOLDER_ID', valor: driveFolderId },
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

      <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 8, padding: 14, marginBottom: 20, fontSize: '0.82rem', color: '#1e40af' }}>
        <strong><i className="fas fa-info-circle"></i> Como configurar o Google Drive:</strong>
        <ol style={{ margin: '8px 0 0 18px', lineHeight: 1.8 }}>
          <li>Acesse <a href="https://script.google.com" target="_blank" style={{ color: '#1e40af' }}>script.google.com</a> e crie um novo projeto</li>
          <li>Cole o código do arquivo <code>google-apps-script.js</code> do repositório</li>
          <li>Clique em <b>Implementar</b> &gt; <b>Implementar como aplicativo da Web</b></li>
          <li>Configure: Executar como <b>Eu mesmo</b>, Quem acessa: <b>Qualquer pessoa</b></li>
          <li>Copie a URL gerada e cole abaixo</li>
        </ol>
      </div>

      <div className="form-grid">
        <div className="form-group full-width">
          <label><i className="fas fa-link"></i>URL do Google Apps Script</label>
          <input className="form-control" value={driveUploadUrl}
            onChange={e => setDriveUploadUrl(e.target.value)}
            placeholder="https://script.google.com/macros/s/SEU_ID/exec" />
        </div>
        <div className="form-group full-width">
          <label><i className="fab fa-google-drive"></i>ID da Pasta no Google Drive</label>
          <input className="form-control" value={driveFolderId}
            onChange={e => setDriveFolderId(e.target.value)}
            placeholder="Ex: 1aBcDeFgHiJkLmNoPqRsTuVwXyZ" />
          <small style={{ color: 'var(--gray)', fontSize: '0.75rem', marginTop: 4, display: 'block' }}>
            O ID está na URL: drive.google.com/drive/folders/<b>AQUI_ESTA_O_ID</b>
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
