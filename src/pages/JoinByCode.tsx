import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { User, Clock, Lock, BarChart3, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080'

export default function JoinByCode() {
  const { code } = useParams<{ code: string }>()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [surname, setSurname] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    const c = (code || '').trim()
    if (c.length !== 6) {
      setError('6 xonali kod kiriting')
      return
    }
    if (!name.trim() || !surname.trim()) {
      setError('Ism va familiyani kiriting')
      return
    }
    setLoading(true)
    try {
      const res = await fetch(`${BASE}/api/join/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: c,
          studentName: name.trim(),
          studentSurname: surname.trim(),
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Xato')
      localStorage.setItem('studentSession', JSON.stringify(data))
      navigate('/student/test', { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Xato')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 p-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-lg">
        <h1 className="text-left text-lg font-bold uppercase tracking-wide text-slate-800">
          Ism va familiya
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Kod: <span className="font-mono font-semibold text-slate-700">{(code || '').padEnd(6, ' ').slice(0, 6)}</span>
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div className="relative">
            <User className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ism"
              autoFocus
              className={cn(
                'h-12 rounded-xl border-slate-300 bg-white pl-10 text-slate-900 placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-blue-500'
              )}
            />
          </div>
          <div className="relative">
            <Input
              value={surname}
              onChange={(e) => setSurname(e.target.value)}
              placeholder="Familiya"
              className="h-12 rounded-xl border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-blue-500"
            />
          </div>

          {error && (
            <p className="text-sm text-red-600">{error}</p>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="h-12 w-full rounded-xl bg-blue-600 text-base font-semibold hover:bg-blue-700"
          >
            {loading ? 'Kiritilmoqda…' : 'Testni boshlash'}
            <ArrowRight className="ml-2 h-5 w-5 text-white" />
          </Button>
        </form>

        <div className="mt-8 flex items-center justify-center gap-8 border-t border-slate-100 pt-6">
          <div className="flex flex-col items-center gap-1.5 text-slate-600">
            <Clock className="h-5 w-5" />
            <span className="text-xs font-medium uppercase tracking-wide">Vaqtli</span>
          </div>
          <div className="flex flex-col items-center gap-1.5 text-slate-600">
            <Lock className="h-5 w-5" />
            <span className="text-xs font-medium uppercase tracking-wide">Xavfsiz</span>
          </div>
          <div className="flex flex-col items-center gap-1.5 text-slate-600">
            <BarChart3 className="h-5 w-5" />
            <span className="text-xs font-medium uppercase tracking-wide">Tahlil</span>
          </div>
        </div>
      </div>
    </div>
  )
}
