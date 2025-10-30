import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { useLanguage } from '../contexts/LanguageContext'

export default function Score() {
  const { user, profile } = useAuth()
  const { t } = useLanguage()
  const [collectedDays, setCollectedDays] = useState(0)
  const [totalDays, setTotalDays] = useState(0)
  const [score, setScore] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user && profile?.role === 'resident') {
      loadScore()
    } else {
      setLoading(false)
    }
  }, [user, profile])

  const loadScore = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('trash_pickups')
        .select('status')
        .eq('user_id', user.id)

      if (error) throw error

      const total = data.length
      const collected = data.filter(p => p.status === 'collected').length

      setTotalDays(total)
      setCollectedDays(collected)
      setScore(total > 0 ? Math.round((collected / total) * 100) : 0)
    } catch (error) {
      console.error('Error loading score:', error)
    } finally {
      setLoading(false)
    }
  }

  if (profile?.role !== 'resident') {
    return (
      <div className="dashboard-container">
        <div className="error-message">
          This feature is only available for residents
        </div>
      </div>
    )
  }

  if (loading) {
    return <div className="loading">Loading...</div>
  }

  return (
    <div className="dashboard-container score-page">
      <h2>{t('complianceScore')}</h2>

      <div className="score-card">
        <div className="score-circle">
          <svg viewBox="0 0 200 200" className="score-svg">
            <circle
              cx="100"
              cy="100"
              r="90"
              fill="none"
              stroke="#e5e7eb"
              strokeWidth="20"
            />
            <circle
              cx="100"
              cy="100"
              r="90"
              fill="none"
              stroke="#22c55e"
              strokeWidth="20"
              strokeDasharray={`${2 * Math.PI * 90}`}
              strokeDashoffset={`${2 * Math.PI * 90 * (1 - score / 100)}`}
              strokeLinecap="round"
              transform="rotate(-90 100 100)"
              className="score-progress"
            />
          </svg>
          <div className="score-value">
            <span className="score-number">{score}%</span>
          </div>
        </div>

        <div className="score-details">
          <div className="score-stat">
            <div className="stat-label">{t('collectedDays')}</div>
            <div className="stat-value">{collectedDays}</div>
          </div>

          <div className="score-stat">
            <div className="stat-label">{t('totalDays')}</div>
            <div className="stat-value">{totalDays}</div>
          </div>
        </div>

        <div className="score-message">
          {score >= 90 && (
            <p className="message-excellent">
              Excellent! You're doing a great job maintaining cleanliness.
            </p>
          )}
          {score >= 70 && score < 90 && (
            <p className="message-good">
              Good work! Keep up the consistency.
            </p>
          )}
          {score >= 50 && score < 70 && (
            <p className="message-average">
              You're on track, but there's room for improvement.
            </p>
          )}
          {score < 50 && totalDays > 0 && (
            <p className="message-poor">
              Please try to mark your trash collection more regularly.
            </p>
          )}
          {totalDays === 0 && (
            <p className="message-new">
              Start marking your daily trash collection to track your score!
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
