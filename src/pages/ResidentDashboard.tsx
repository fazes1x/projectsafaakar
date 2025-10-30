import { useState, useEffect } from 'react'
import { supabase, TrashPickup } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { useLanguage } from '../contexts/LanguageContext'

export default function ResidentDashboard() {
  const { user } = useAuth()
  const { t } = useLanguage()
  const [pickup, setPickup] = useState<TrashPickup | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      loadTodayPickup()
    }
  }, [user])

  const loadTodayPickup = async () => {
    if (!user) return

    try {
      const today = new Date().toISOString().split('T')[0]

      const { data, error } = await supabase
        .from('trash_pickups')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', today)
        .maybeSingle()

      if (error) throw error

      if (!data) {
        const { data: newPickup, error: insertError } = await supabase
          .from('trash_pickups')
          .insert([
            {
              user_id: user.id,
              date: today,
              status: 'pending',
            },
          ])
          .select()
          .single()

        if (insertError) throw insertError
        setPickup(newPickup)
      } else {
        setPickup(data)
      }
    } catch (error) {
      console.error('Error loading pickup:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleStatus = async () => {
    if (!pickup) return

    const newStatus = pickup.status === 'pending' ? 'collected' : 'pending'

    try {
      const { error } = await supabase
        .from('trash_pickups')
        .update({
          status: newStatus,
          marked_at: new Date().toISOString(),
        })
        .eq('id', pickup.id)

      if (error) throw error

      setPickup({ ...pickup, status: newStatus })
    } catch (error) {
      console.error('Error updating status:', error)
    }
  }

  if (loading) {
    return <div className="loading">Loading...</div>
  }

  return (
    <div className="dashboard-container">
      <h2>{t('todayPickup')}</h2>

      <div className="pickup-card">
        <div className="pickup-status">
          <div className={`status-indicator ${pickup?.status}`}>
            {pickup?.status === 'collected' ? '✓' : '○'}
          </div>
          <span className="status-text">
            {pickup?.status === 'collected' ? t('collected') : t('pending')}
          </span>
        </div>

        <button
          onClick={toggleStatus}
          className="btn-primary"
        >
          {pickup?.status === 'collected' ? t('pending') : t('markCollected')}
        </button>

        <p className="pickup-date">
          {new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </p>
      </div>
    </div>
  )
}
