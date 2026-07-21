import { useState } from 'react'
import Dashboard from './components/Dashboard'
import DocumentForm from './components/DocumentForm'
import DocumentList from './components/DocumentList'
import ConfigPanel from './components/ConfigPanel'
import Toast from './components/Toast'
import type { TabName } from './types'
import './App.css'

const TAB_INFO: Record<TabName, { label: string; icon: string; topLabel: string; topIcon: string }> = {
  dashboard: { label: 'Dashboard', icon: 'fa-chart-pie', topLabel: 'Dashboard', topIcon: 'fa-chart-pie' },
  upload: { label: 'Novo Documento', icon: 'fa-file-circle-plus', topLabel: 'Novo Documento', topIcon: 'fa-file-circle-plus' },
  list: { label: 'Consultar', icon: 'fa-magnifying-glass', topLabel: 'Consultar Documentos', topIcon: 'fa-magnifying-glass' },
  config: { label: 'Configurações', icon: 'fa-gear', topLabel: 'Configurações', topIcon: 'fa-gear' },
}

function App() {
  const [activeTab, setActiveTab] = useState<TabName>('dashboard')
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null)

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ message, type })
  }

  const tabs: { name: TabName; label: string; icon: string }[] = [
    { name: 'dashboard', label: 'Dashboard', icon: 'fa-chart-pie' },
    { name: 'upload', label: 'Novo Documento', icon: 'fa-file-circle-plus' },
    { name: 'list', label: 'Consultar', icon: 'fa-magnifying-glass' },
    { name: 'config', label: 'Configurações', icon: 'fa-gear' },
  ]

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <h1><i className="fas fa-folder-tree"></i> <span>Gestão Documental</span></h1>
          <div className="subtitle">Engcelin</div>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-label">Menu</div>
          {tabs.map(tab => (
            <button
              key={tab.name}
              className={`nav-item${activeTab === tab.name ? ' active' : ''}`}
              onClick={() => setActiveTab(tab.name)}
            >
              <i className={`fas ${tab.icon}`}></i>
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="dot"></div>
          <span>Sistema Online</span>
        </div>
      </aside>

      <main className="main">
        <div className="topbar">
          <div className="topbar-title">
            <i className={`fas ${TAB_INFO[activeTab].topIcon}`}></i>
            {TAB_INFO[activeTab].topLabel}
          </div>
          <div className="topbar-actions">
            <span className="badge"><i className="fas fa-building"></i> Engcelin Soluções e Diagnósticos</span>
          </div>
        </div>

        <div className="content">
          {activeTab === 'dashboard' && <Dashboard />}
          {activeTab === 'upload' && <DocumentForm showToast={showToast} onSaved={() => setActiveTab('list')} />}
          {activeTab === 'list' && <DocumentList showToast={showToast} onEdit={() => setActiveTab('upload')} />}
          {activeTab === 'config' && <ConfigPanel showToast={showToast} />}
        </div>
      </main>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}

export default App
