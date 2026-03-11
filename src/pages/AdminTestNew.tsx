import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { api } from '@/lib/api'
import type { Test } from '@/types'

export default function AdminTestNew() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [durationInput, setDurationInput] = useState('45')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    const parsed = parseInt(durationInput.trim(), 10)
    if (durationInput.trim() === '' || isNaN(parsed) || parsed < 1) {
      setError('Vaqtni kiriting (kamida 1 daqiqa)')
      return
    }
    const durationMinutes = parsed
    setLoading(true)
    try {
      const test = await api.post<Test>('/api/tests', { name, durationMinutes })
      navigate(`/admin/tests/${test._id}`, { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Xato')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto max-w-lg px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>Yangi test</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Test nomi</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Masalan: 9-sinf matematika"
              />
            </div>
            <div>
              <Label>Vaqt (daqiqa)</Label>
              <Input
                type="number"
                min={1}
                value={durationInput}
                onChange={(e) => setDurationInput(e.target.value)}
                placeholder="45"
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" disabled={loading}>
              {loading ? 'Yaratilmoqda…' : 'Yaratish'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
