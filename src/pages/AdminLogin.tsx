import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { api } from '@/lib/api'
import type { User } from '@/types'
import { usePageTitle } from '@/lib/usePageTitle'
import { AppHeader } from '@/components/AppHeader'

export default function AdminLogin() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  usePageTitle('O‘qituvchi — kirish')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const data = await api.post<{ user: User; accessToken: string }>('/api/auth/login', {
        email,
        password,
      })
      localStorage.setItem('adminToken', data.accessToken)
      localStorage.setItem('adminUser', JSON.stringify(data.user))
      navigate('/admin', { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Xato')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <AppHeader />
      <div className="flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>O‘qituvchi — kirish</CardTitle>
          <p className="text-sm text-muted-foreground">
            Akkauntingiz bo‘lsa, kirish. Yo‘q bo‘lsa,{' '}
            <Link to="/admin/register" className="text-primary underline">
              ro‘yxatdan o‘ting
            </Link>
            .
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Email</Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@example.com"
              />
            </div>
            <div>
              <Label>Parol</Label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Kiritilmoqda…' : 'Kirish'}
            </Button>
          </form>
        </CardContent>
      </Card>
      </div>
    </div>
  )
}
