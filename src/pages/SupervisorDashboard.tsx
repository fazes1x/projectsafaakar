import { useState, useEffect } from 'react'
import { supabase, Profile, TrashPickup, Report } from '../lib/supabase'
import { useLanguage } from '../contexts/LanguageContext'

type ResidentData = {
  profile: Profile
  todayPickup: TrashPickup | null
  hasOpenReport: boolean
  reportData?: Report
}

export default function SupervisorDashboard() {
  const { t } = useLanguage()
  const [residents, setResidents] = useState<ResidentData[]>([])
  const [filter, setFilter] = useState<'all' | 'collected' | 'pending' | 'reported'>('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadResidents()

    const channel = supabase
      .channel('dashboard-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'trash_pickups' },
        () => {
          loadResidents()
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'reports' },
        () => {
          loadResidents()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const loadResidents = async () => {
    try {
      const today = new Date().toISOString().split('T')[0]

      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'resident')
        .order('address')

      if (profilesError) throw profilesError

      const { data: pickups, error: pickupsError } = await supabase
        .from('trash_pickups')
        .select('*')
        .eq('date', today)

      if (pickupsError) throw pickupsError

      const { data: reports, error: reportsError } = await supabase
        .from('reports')
        .select('*')
        .eq('status', 'open')

      if (reportsError) throw reportsError

      const residentData: ResidentData[] = profiles.map((profile) => {
        const todayPickup = pickups.find((p) => p.user_id === profile.id) || null
        const openReport = reports.find((r) => r.user_id === profile.id)

        return {
          profile,
          todayPickup,
          hasOpenReport: !!openReport,
          reportData: openReport,
        }
      })

      setResidents(residentData)
    } catch (error) {
      console.error('Error loading residents:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredResidents = residents.filter((resident) => {
    if (filter === 'all') return true
    if (filter === 'collected') return resident.todayPickup?.status === 'collected'
    if (filter === 'pending') return !resident.todayPickup || resident.todayPickup.status === 'pending'
    if (filter === 'reported') return resident.hasOpenReport
    return true
  })

  if (loading) {
    return <div className="loading">Loading...</div>
  }

  return (
    <div className="dashboard-container">
      <h2>{t('supervisorDashboard')}</h2>

      <div className="filter-bar">
        <button
          className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          {t('all')} ({residents.length})
        </button>
        <button
          className={`filter-btn ${filter === 'collected' ? 'active' : ''}`}
          onClick={() => setFilter('collected')}
        >
          {t('collected')} ({residents.filter(r => r.todayPickup?.status === 'collected').length})
        </button>
        <button
          className={`filter-btn ${filter === 'pending' ? 'active' : ''}`}
          onClick={() => setFilter('pending')}
        >
          {t('pending')} ({residents.filter(r => !r.todayPickup || r.todayPickup.status === 'pending').length})
        </button>
        <button
          className={`filter-btn ${filter === 'reported' ? 'active' : ''}`}
          onClick={() => setFilter('reported')}
        >
          {t('issueReported')} ({residents.filter(r => r.hasOpenReport).length})
        </button>
      </div>

      <div className="residents-table">
        <table>
          <thead>
            <tr>
              <th>{t('address')}</th>
              <th>{t('status')}</th>
              <th>{t('issueReported')}</th>
              <th>{t('viewPhoto')}</th>
            </tr>
          </thead>
          <tbody>
            {filteredResidents.map((resident) => (
              <tr key={resident.profile.id}>
                <td>{resident.profile.address}</td>
                <td>
                  <span className={`status-badge ${resident.todayPickup?.status || 'pending'}`}>
                    {resident.todayPickup?.status === 'collected' ? t('collected') : t('pending')}
                  </span>
                </td>
                <td>
                  {resident.hasOpenReport ? (
                    <span className="report-badge">{t('yes')}</span>
                  ) : (
                    t('no')
                  )}
                </td>
                <td>
                  {resident.reportData?.photo_url ? (
                    <a
                      href={resident.reportData.photo_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="photo-link"
                    >
                      {t('viewPhoto')}
                    </a>
                  ) : (
                    '-'
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredResidents.length === 0 && (
          <div className="empty-state">No residents found</div>
        )}
      </div>
    </div>
  )
}
