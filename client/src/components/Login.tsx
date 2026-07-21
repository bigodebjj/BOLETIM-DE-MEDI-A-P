import { useState } from 'react'
import { login } from '../firebase'

interface LoginProps {
  onLogin: () => void
}

function Login({ onLogin }: LoginProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      await login(email, password)
      onLogin()
    } catch (err: any) {
      const errorMessages: Record<string, string> = {
        'auth/invalid-credential': 'Email ou senha inválidos',
        'auth/user-not-found': 'Usuário não encontrado',
        'auth/wrong-password': 'Senha incorreta',
        'auth/invalid-email': 'Email inválido',
        'auth/too-many-requests': 'Muitas tentativas. Tente novamente mais tarde',
      }
      setError(errorMessages[err.code] || err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-header">
          <div className="login-logo">
            <i className="fas fa-folder-tree"></i>
          </div>
          <h1>Gestão Documental</h1>
          <p>Engcelin Soluções e Diagnósticos</p>
        </div>

        <form onSubmit={handleSubmit}>
          {error && (
            <div className="login-error">
              <i className="fas fa-exclamation-circle"></i> {error}
            </div>
          )}

          <div className="login-field">
            <label><i className="fas fa-envelope"></i> Email</label>
            <input
              type="email"
              className="form-control"
              placeholder="seu@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="login-field">
            <label><i className="fas fa-lock"></i> Senha</label>
            <input
              type="password"
              className="form-control"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary login-btn" disabled={loading}>
            {loading ? (
              <><i className="fas fa-spinner fa-spin"></i> Entrando...</>
            ) : (
              <><i className="fas fa-right-to-bracket"></i> Entrar</>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}

export default Login
