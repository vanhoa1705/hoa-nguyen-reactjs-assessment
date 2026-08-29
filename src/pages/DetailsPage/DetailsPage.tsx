import { useNavigate, useParams } from 'react-router-dom'

export default function DetailsPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-surface-muted">
      <p className="text-text-secondary">Details Page — breed {id}</p>
      <button onClick={() => navigate(-1)} className="mt-4 text-brand-primary underline">
        Back
      </button>
    </div>
  )
}
