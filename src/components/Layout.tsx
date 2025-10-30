import { Link, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useLanguage } from '../contexts/LanguageContext'

export default function Layout() {
  const { profile, signOut } = useAuth()
  const { t, language, setLanguage } = useLanguage()
  const location = useLocation()

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'ur' : 'en')
  }

  const isActive = (path: string) => location.pathname === path

  return (
    <div className="app-layout">
      <header className="app-header">
        <div className="header-content">
          <div className="header-left">
            <img
              src="/ChatGPT Image Oct 16, 2025, 04_57_18 PM.png"
              alt="Safaakar Logo"
              className="header-logo"
            />
            <h1 className="header-title">{t('appName')}</h1>
          </div>

          <div className="header-actions">
            <button onClick={toggleLanguage} className="btn-language">
              {language === 'en' ? 'اردو' : 'English'}
            </button>
            <button onClick={handleSignOut} className="btn-logout">
              {t('logout')}
            </button>
          </div>
        </div>
      </header>

      <nav className="app-nav">
        {profile?.role === 'resident' && (
          <>
            <Link
              to="/"
              className={`nav-link ${isActive('/') ? 'active' : ''}`}
            >
              {t('home')}
            </Link>
            <Link
              to="/report"
              className={`nav-link ${isActive('/report') ? 'active' : ''}`}
            >
              {t('reportIssue')}
            </Link>
            <Link
              to="/my-reports"
              className={`nav-link ${isActive('/my-reports') ? 'active' : ''}`}
            >
              {t('reports')}
            </Link>
            <Link
              to="/education"
              className={`nav-link ${isActive('/education') ? 'active' : ''}`}
            >
              {t('education')}
            </Link>
            <Link
              to="/score"
              className={`nav-link ${isActive('/score') ? 'active' : ''}`}
            >
              {t('myScore')}
            </Link>
          </>
        )}

        {profile?.role === 'supervisor' && (
          <>
            <Link
              to="/"
              className={`nav-link ${isActive('/') ? 'active' : ''}`}
            >
              {t('dashboard')}
            </Link>
            <Link
              to="/reports"
              className={`nav-link ${isActive('/reports') ? 'active' : ''}`}
            >
              {t('reports')}
            </Link>
            <Link
              to="/education"
              className={`nav-link ${isActive('/education') ? 'active' : ''}`}
            >
              {t('education')}
            </Link>
          </>
        )}
      </nav>

      <main className="app-main">
        <Outlet />
      </main>
    </div>
  )
}
