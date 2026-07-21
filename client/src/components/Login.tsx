import { useState } from 'react'
import { login, register } from '../firebase'

interface LoginProps {
  onLogin: () => void
}

function Login({ onLogin }: LoginProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isRegister, setIsRegister] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      if (isRegister) {
        await register(email, password)
      } else {
        await login(email, password)
      }
      onLogin()
    } catch (err: any) {
      const errorMessages: Record<string, string> = {
        'auth/invalid-credential': 'Email ou senha inválidos',
        'auth/user-not-found': 'Usuário não encontrado',
        'auth/wrong-password': 'Senha incorreta',
        'auth/email-already-in-use': 'Email já cadastrado',
        'auth/weak-password': 'Senha deve ter pelo menos 6 caracteres',
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
              minLength={6}
            />
          </div>

          <button type="submit" className="btn btn-primary login-btn" disabled={loading}>
            {loading ? (
              <><i className="fas fa-spinner fa-spin"></i> {isRegister ? 'Cadastrando...' : 'Entrando...'}</>
            ) : (
              <><i className="fas fa-right-to-bracket"></i> {isRegister ? 'Cadastrar' : 'Entrar'}</>
            )}
          </button>
        </form>

        <div className="login-footer">
          {isRegister ? (
            <span>Já tem conta? <button onClick={() => { setIsRegister(false); setError('') }}>Entrar</button></span>
          ) : (
            <span>Não tem conta? <button onClick={() => { setIsRegister(true); setError('') }}>Cadastrar</button></span>
          )}
        </div>
      </div>
    </div>
  )
}

export default Login
