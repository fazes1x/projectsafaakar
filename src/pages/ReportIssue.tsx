import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { useLanguage } from '../contexts/LanguageContext'

export default function ReportIssue() {
  const { user, profile } = useAuth()
  const { t } = useLanguage()
  const [comment, setComment] = useState('')
  const [photo, setPhoto] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setPhoto(e.target.files[0])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !profile) return

    setLoading(true)
    setError('')
    setSuccess(false)

    try {
      let photoUrl = null

      if (photo) {
        const fileExt = photo.name.split('.').pop()
        const fileName = `${user.id}-${Date.now()}.${fileExt}`

        const { error: uploadError } = await supabase.storage
          .from('report-photos')
          .upload(fileName, photo)

        if (uploadError) throw uploadError

        const { data: urlData } = supabase.storage
          .from('report-photos')
          .getPublicUrl(fileName)

        photoUrl = urlData.publicUrl
      }

      const { error: insertError } = await supabase
        .from('reports')
        .insert([
          {
            user_id: user.id,
            address: profile.address,
            comment: comment || null,
            photo_url: photoUrl,
            status: 'open',
          },
        ])

      if (insertError) throw insertError

      setSuccess(true)
      setComment('')
      setPhoto(null)

      const fileInput = document.getElementById('photo-input') as HTMLInputElement
      if (fileInput) fileInput.value = ''

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit report')
    } finally {
      setLoading(false)
    }
  }

  if (profile?.role !== 'resident') {
    return (
      <div className="dashboard-container">
        <div className="error-message">
          Only residents can submit reports
        </div>
      </div>
    )
  }

  return (
    <div className="dashboard-container">
      <h2>{t('reportIssue')}</h2>

      <form onSubmit={handleSubmit} className="report-form">
        <div className="form-group">
          <label>{t('uploadPhoto')}</label>
          <input
            id="photo-input"
            type="file"
            accept="image/*"
            onChange={handlePhotoChange}
            disabled={loading}
          />
          {photo && <p className="file-name">{photo.name}</p>}
        </div>

        <div className="form-group">
          <label>{t('comment')}</label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={4}
            disabled={loading}
            placeholder="Describe the issue..."
          />
        </div>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">Report submitted successfully!</div>}

        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'Submitting...' : t('submitReport')}
        </button>
      </form>
    </div>
  )
}
