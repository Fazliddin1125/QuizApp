import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, LogOut, ClipboardList } from 'lucide-react'
import { api } from '@/lib/api'
import type { Test } from '@/types'

export default function AdminDashboard() {
  const navigate = useNavigate()
  const [tests, setTests] = useState<Test[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api
      .get<Test[]>('/api/tests')
      .then(setTests)
      .catch(() => navigate('/admin/login', { replace: true }))
      .finally(() => setLoading(false))
  }, [navigate])

  const logout = () => {
    localStorage.removeItem('adminToken')
    localStorage.removeItem('adminUser')
    navigate('/', { replace: true })
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-slate-500">Yuklanmoqda…</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="container mx-auto flex h-14 items-center justify-between px-4">
          <span className="flex items-center gap-2 font-semibold text-slate-900">
            <ClipboardList className="h-6 w-6 text-slate-600" />
            Admin
          </span>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link to="/">Bosh sahifa</Link>
            </Button>
            <Button variant="ghost" size="sm" onClick={logout}>
              <LogOut className="mr-2 h-4 w-4" />
              Chiqish
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Mening testlarim
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Platformadagi barcha test jarayonlarini boshqarish
            </p>
          </div>
          <Button asChild className="mt-4 shrink-0 sm:mt-0">
            <Link to="/admin/tests/new" className="rounded-lg bg-blue-600 hover:bg-blue-700">
              <Plus className="mr-2 h-4 w-4" />
              Yangi test yaratish
            </Link>
          </Button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {tests.map((t) => (
            <Card
              key={t._id}
              className="overflow-hidden rounded-xl border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md"
            >
              <CardHeader className="space-y-1.5 p-6 pb-2">
                <CardTitle className="text-lg font-semibold tracking-tight text-slate-900">
                  <Link
                    to={`/admin/tests/${t._id}`}
                    className="hover:text-blue-600 hover:underline"
                  >
                    {t.name}
                  </Link>
                </CardTitle>
                <p className="text-sm text-slate-500">
                  Kod: <span className="font-mono font-semibold text-slate-700">{t.code}</span>
                  {t.isActive && (
                    <span className="ml-2 rounded bg-green-100 px-1.5 py-0.5 text-xs font-medium text-green-800">
                      Aktiv
                    </span>
                  )}
                </p>
              </CardHeader>
              <CardContent className="flex gap-2 p-6 pt-4">
                <Button variant="outline" size="sm" className="flex-1 rounded-lg border-blue-600 text-blue-600 hover:bg-blue-50" asChild>
                  <Link to={`/admin/tests/${t._id}`}>Tahrirlash</Link>
                </Button>
                <Button size="sm" className="flex-1 rounded-lg bg-blue-600 hover:bg-blue-700" asChild>
                  <Link to={`/admin/tests/${t._id}/results`}>Natijalar</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {tests.length === 0 && (
          <p className="py-12 text-center text-slate-500">
            Hali test yo&apos;q. «Yangi test yaratish» orqali qo&apos;shing.
          </p>
        )}
      </main>
    </div>
  )
}
