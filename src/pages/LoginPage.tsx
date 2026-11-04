import { useState, type FormEvent } from 'react'
import { Navigate } from 'react-router-dom'
import { ChefHat, CircleAlert, ShieldCheck } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { getFriendlyError } from '../utils/errors'

export default function LoginPage() {
  const { token, signIn } = useAuth()
  const [username, setUsername] = useState('emilys')
  const [password, setPassword] = useState('emilyspass')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  if (token) return <Navigate to="/" replace />

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setError('')
    try { await signIn(username.trim(), password) }
    catch (err) { setError(getFriendlyError(err, true)) }
    finally { setLoading(false) }
  }

  return (
    <main className="login-page">
      <section className="login-visual">
        <div className="brand brand-light"><span className="brand-mark"><ChefHat size={22} /></span><span>Sabor<span className="brand-accent"> da Casa</span></span></div>
        <div className="login-hero-copy">
          <span className="hero-kicker"><span className="live-dot" /> PAINEL DO RESTAURANTE</span>
          <h1>Seu cardápio.<br /><em>Do seu jeito.</em></h1>
          <p>Organize seus pratos, atualize os detalhes e mantenha cada sabor pronto para conquistar novos pedidos.</p>
          <div className="hero-stats">
            <div><strong>01</strong><span>Um só painel</span></div>
            <div><strong>∞</strong><span>Novas possibilidades</span></div>
          </div>
        </div>
        <div className="login-visual-footer">FEITO PARA QUEM AMA SERVIR BEM <span>✳</span></div>
      </section>
      <section className="login-panel">
        <div className="login-panel-inner">
          <div className="mobile-brand brand"><span className="brand-mark"><ChefHat size={22} /></span><span>Sabor<span className="brand-accent"> da Casa</span></span></div>
          <div className="login-heading">
            <span className="eyebrow">BEM-VINDO DE VOLTA</span>
            <h2>Entre na sua cozinha.</h2>
            <p>Acesse sua conta para gerenciar o cardápio.</p>
          </div>
          <form className="login-form" onSubmit={submit}>
            <label>Usuário
              <input value={username} onChange={e => setUsername(e.target.value)} autoComplete="username" placeholder="Seu usuário" required />
            </label>
            <label>Senha
              <input value={password} onChange={e => setPassword(e.target.value)} type="password" autoComplete="current-password" placeholder="Sua senha" required />
            </label>
            {error && <div className="alert alert-error" role="alert"><CircleAlert size={18} /><span>{error}</span></div>}
            <button className="button button-primary login-submit" type="submit" disabled={loading}>{loading ? <><span className="spinner" /> Entrando...</> : <>Entrar no painel <span aria-hidden="true">→</span></>}</button>
          </form>
          <div className="login-tip"><ShieldCheck size={18} /><div><strong>Acesso de demonstração</strong><span>Usuário e senha de teste do DummyJSON já preenchidos.</span></div></div>
          <p className="login-footnote">Ao entrar, você concorda em usar este painel para fins de demonstração acadêmica.</p>
        </div>
      </section>
    </main>
  )
}
