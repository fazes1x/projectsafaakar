import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useLanguage } from '../contexts/LanguageContext'

const SUPERVISOR_CODE = '2137S@f@@kar'

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<'resident' | 'supervisor'>('resident')
  const [address, setAddress] = useState('')
  const [supervisorCode, setSupervisorCode] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  const { signIn, signUp } = useAuth()
  const { t } = useLanguage()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      if (isLogin) {
        await signIn(email, password)
      } else {
        if (password.length < 6) {
          throw new Error('Password must be at least 6 characters')
        }

        if (role === 'supervisor') {
          if (supervisorCode !== SUPERVISOR_CODE) {
            throw new Error('Invalid supervisor code')
          }
        }

        if (role === 'resident' && !address.trim()) {
          throw new Error('Address is required for residents')
        }

        const finalAddress = role === 'supervisor' ? 'Supervisor Office' : address
        await signUp(email, password, role, finalAddress)
        setSuccess('Account created successfully! Logging you in...')
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'An error occurred'
      setError(message)
      console.error('Auth error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="logo-container">
          <img
            src="/ChatGPT Image Oct 16, 2025, 04_57_18 PM.png"
            alt="Safaakar Logo"
            className="auth-logo"
          />
        </div>
        <h1 className="app-title">{t('appName')}</h1>
        <p className="app-subtitle">Trash Collection Tracking</p>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>{t('email')}</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label>{t('password')}</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          {!isLogin && (
            <>
              <div className="form-group">
                <label>{t('role')}</label>
                <select
                  value={role}
                  onChange={(e) => {
                    setRole(e.target.value as 'resident' | 'supervisor')
                    setAddress('')
                    setSupervisorCode('')
                  }}
                  disabled={loading}
                >
                  <option value="resident">{t('resident')}</option>
                  <option value="supervisor">{t('supervisor')}</option>
                </select>
              </div>

              {role === 'resident' && (
                <div className="form-group">
                  <label>{t('address')}</label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    required
                    disabled={loading}
                    placeholder="Enter your house address"
                  />
                </div>
              )}

              {role === 'supervisor' && (
                <div className="form-group">
                  <label>{t('supervisorCode')}</label>
                  <input
                    type="password"
                    value={supervisorCode}
                    onChange={(e) => setSupervisorCode(e.target.value)}
                    required
                    disabled={loading}
                    placeholder="Enter supervisor access code"
                  />
                </div>
              )}
            </>
          )}

          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? '...' : isLogin ? t('login') : t('signup')}
          </button>

          <button
            type="button"
            className="btn-text"
            onClick={() => {
              setIsLogin(!isLogin)
              setError('')
            }}
            disabled={loading}
          >
            {isLogin ? t('signup') : t('login')}
          </button>
        </form>
      </div>
    </div>
  )
}
