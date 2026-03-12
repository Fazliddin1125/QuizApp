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
    <div className="min-h-screen bg-slate-50">
      <AppHeader />
      <main className="mx-auto flex min-h-[calc(100vh-56px)] max-w-6xl items-center px-4 py-10">
        <div className="hidden flex-1 flex-col gap-4 pr-10 text-slate-800 md:flex">
          <h1 className="text-3xl font-bold tracking-tight">
            O‘qituvchilar uchun qulay <span className="text-blue-600">test platforma</span>
          </h1>
          <p className="text-sm leading-relaxed text-slate-600">
            Testlarni tez yarating, o‘quvchilarni real vaqtda kuzating va natijalarni Excelga eksport qiling.
          </p>
          <ul className="mt-2 space-y-1 text-sm text-slate-600">
            <li>• Kod orqali oson ulanish</li>
            <li>• Har bir savol bo‘yicha batafsil statistika</li>
            <li>• Onlayn nazorat va natijalar paneli</li>
          </ul>
        </div>

        <div className="flex w-full flex-1 justify-center">
          <Card className="w-full max-w-md border-slate-200 shadow-lg">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl font-semibold text-slate-900">
                O‘qituvchi — kirish
              </CardTitle>
              <p className="mt-1 text-sm text-slate-500">
                Akkauntingiz bo‘lsa, email va parol bilan kiring. Yangi foydalanuvchi bo‘lsangiz,{' '}
                <Link to="/admin/register" className="font-medium text-blue-600 underline-offset-2 hover:underline">
                  ro‘yxatdan o‘ting
                </Link>
                .
              </p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium text-slate-700">Email</Label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="teacher@example.com"
                    className="h-11 rounded-lg border-slate-300 bg-white text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium text-slate-700">Parol</Label>
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="h-11 rounded-lg border-slate-300 bg-white text-sm"
                  />
                </div>
                {error && (
                  <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                    {error}
                  </p>
                )}
                <Button
                  type="submit"
                  className="h-11 w-full rounded-lg bg-blue-600 text-sm font-semibold hover:bg-blue-700"
                  disabled={loading}
                >
                  {loading ? 'Kiritilmoqda…' : 'Kirish'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
