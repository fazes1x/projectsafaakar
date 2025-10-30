import { useState, useEffect } from 'react'
import { supabase, Report, Profile } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { useLanguage } from '../contexts/LanguageContext'

type ReportWithProfile = Report & {
  reporter?: Profile
}

export default function Reports() {
  const { user, profile } = useAuth()
  const { t } = useLanguage()
  const [reports, setReports] = useState<ReportWithProfile[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (profile?.role === 'supervisor') {
      loadReports()

      const channel = supabase
        .channel('reports-changes')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'reports' },
          () => {
            loadReports()
          }
        )
        .subscribe()

      return () => {
        supabase.removeChannel(channel)
      }
    } else if (profile?.role === 'resident') {
      loadMyReports()
    }
  }, [profile])

  const loadReports = async () => {
    try {
      const { data, error } = await supabase
        .from('reports')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      const profileIds = [...new Set(data.map(r => r.user_id))]
      const { data: profiles } = await supabase
        .from('profiles')
        .select('*')
        .in('id', profileIds)

      const reportsWithProfiles = data.map(report => ({
        ...report,
        reporter: profiles?.find(p => p.id === report.user_id)
      }))

      setReports(reportsWithProfiles)
    } catch (error) {
      console.error('Error loading reports:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadMyReports = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('reports')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setReports(data)
    } catch (error) {
      console.error('Error loading reports:', error)
    } finally {
      setLoading(false)
    }
  }

  const markResolved = async (reportId: string) => {
    if (!user || profile?.role !== 'supervisor') return

    try {
      const { error } = await supabase
        .from('reports')
        .update({
          status: 'resolved',
          resolved_at: new Date().toISOString(),
          resolved_by: user.id,
        })
        .eq('id', reportId)

      if (error) throw error

      setReports(reports.map(r =>
        r.id === reportId
          ? { ...r, status: 'resolved' as const, resolved_at: new Date().toISOString() }
          : r
      ))
    } catch (error) {
      console.error('Error resolving report:', error)
    }
  }

  if (loading) {
    return <div className="loading">Loading...</div>
  }

  return (
    <div className="dashboard-container">
      <h2>{t('reportedIssues')}</h2>

      {reports.length === 0 ? (
        <div className="empty-state">No reports found</div>
      ) : (
        <div className="reports-grid">
          {reports.map((report) => (
            <div key={report.id} className={`report-card ${report.status}`}>
              <div className="report-header">
                <span className={`status-badge ${report.status}`}>
                  {report.status === 'open' ? t('open') : t('resolved')}
                </span>
                <span className="report-date">
                  {new Date(report.created_at).toLocaleDateString()}
                </span>
              </div>

              {profile?.role === 'supervisor' && report.reporter && (
                <div className="report-address">
                  <strong>{t('address')}:</strong> {report.reporter.address}
                </div>
              )}

              {report.comment && (
                <div className="report-comment">
                  <strong>{t('comment')}:</strong>
                  <p>{report.comment}</p>
                </div>
              )}

              {report.photo_url && (
                <div className="report-photo">
                  <img src={report.photo_url} alt="Report" />
                </div>
              )}

              {profile?.role === 'supervisor' && report.status === 'open' && (
                <button
                  onClick={() => markResolved(report.id)}
                  className="btn-secondary"
                >
                  {t('markResolved')}
                </button>
              )}

              {report.resolved_at && (
                <div className="resolved-info">
                  {t('resolved')} on {new Date(report.resolved_at).toLocaleDateString()}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
