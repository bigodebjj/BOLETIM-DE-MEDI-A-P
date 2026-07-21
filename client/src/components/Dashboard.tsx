import { useEffect, useState } from 'react'
import { documentService } from '../services/api'
import type { DashboardData } from '../types'

const CAT_COLORS: Record<string, string> = {
  '01 EQUIPE RESIDENTE': '#2B6BAE',
  '02 AQUISIÇÃO DE PEÇAS INSUMOS E SERVIÇOS': '#28a745',
  '03 DEPRECIAÇÃO': '#ffc107',
  '04 IMPOSTOS E OBRIGAÇÕES': '#dc3545',
  '05 ADM LOCAL': '#6f42c1',
}

function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    documentService.dashboard()
      .then(setData)
      .catch(err => setError(err.message))
  }, [])

  if (error) {
    return (
      <div className="card">
        <p className="empty-state"><i className="fas fa-exclamation-triangle"></i><br />Erro: {error}</p>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="card">
        <div className="loading"><div className="spinner"></div><p>Carregando dashboard...</p></div>
      </div>
    )
  }

  return (
    <>
      <div className="stats-grid">
        <div className="stat-card"><div className="number">{data.total}</div><div className="label">Total Documentos</div></div>
        <div className="stat-card"><div className="number">{data.porAno['2025'] || 0}</div><div className="label">2025</div></div>
        <div className="stat-card"><div className="number">{data.porAno['2026'] || 0}</div><div className="label">2026</div></div>
        <div className="stat-card"><div className="number">{data.porStatus['PENDENTE'] || 0}</div><div className="label">Pendentes</div></div>
        <div className="stat-card"><div className="number">{data.valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div><div className="label">Valor Total (R$)</div></div>
      </div>

      <div className="card">
        <div className="card-header"><i className="fas fa-chart-bar"></i> Documentos por Categoria</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 10 }}>
          {Object.entries(data.porCategoria).map(([cat, count]) => (
            <div
              key={cat}
              style={{
                background: CAT_COLORS[cat] || '#6c757d',
                color: 'white',
                padding: 12,
                borderRadius: 8,
                textAlign: 'center'
              }}
            >
              <div style={{ fontSize: '1.3rem', fontWeight: 700 }}>{count}</div>
              <div style={{ fontSize: '0.75rem', opacity: 0.9 }}>{cat.substring(3)}</div>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}

export default Dashboard
