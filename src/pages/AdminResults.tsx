import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ArrowLeft, LayoutGrid, Trash2, FileSpreadsheet } from 'lucide-react'
import { api } from '@/lib/api'
import { createSocket } from '@/lib/socket'
import { cn } from '@/lib/utils'
import type { ResultsResponse, ResultRow } from '@/types'

type CellDisplay = 'correct' | 'wrong' | 'unanswered'

function getCellDisplay(status: 'correct' | 'wrong' | 'unanswered'): CellDisplay {
  return status
}

export default function AdminResults() {
  const { id } = useParams<{ id: string }>()
  const [data, setData] = useState<ResultsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [liveConnected, setLiveConnected] = useState(false)
  const [clearing, setClearing] = useState(false)

  const load = () => {
    if (!id) {
      setLoading(false)
      return
    }
    setError(null)
    setLoading(true)
    api
      .get<ResultsResponse>(`/api/tests/${id}/results`)
      .then((res) => {
        setData({
          test: res.test ?? { name: '', code: '', isActive: false },
          subjects: Array.isArray(res.subjects) ? res.subjects : [],
          rows: Array.isArray(res.rows) ? res.rows : [],
        })
        setError(null)
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Natijalarni yuklab bo\'lmadi')
        setData(null)
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    if (id) load()
    else setLoading(false)
  }, [id])

  useEffect(() => {
    if (!id) return
    const socket = createSocket()
    socket.on('connect', () => setLiveConnected(true))
    socket.on('disconnect', () => setLiveConnected(false))
    socket.emit('admin:subscribe', id)
    socket.on('result:updated', () => load())
    if (socket.connected) setLiveConnected(true)
    return () => {
      socket.emit('admin:unsubscribe', id)
      socket.off('result:updated')
      socket.off('connect')
      socket.off('disconnect')
      socket.disconnect()
    }
  }, [id])

  if (!id)
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100">
        <Card className="max-w-sm">
          <CardContent className="py-6 text-center text-slate-600">
            Test tanlanmagan. <Link to="/admin" className="text-blue-600 underline">Admin</Link> orqali testni tanlang.
          </CardContent>
        </Card>
      </div>
    )

  if (loading && !data && !error)
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100">
        <p className="text-slate-500">Yuklanmoqda…</p>
      </div>
    )

  const handleClearResults = () => {
    if (!id || clearing) return
    if (!window.confirm('Barcha o\'quvchi natijalari o\'chiriladi. Testni qayta ishlatish mumkin. Davom etasizmi?')) return
    setClearing(true)
    api
      .delete(`/api/tests/${id}/results`)
      .then(() => load())
      .catch((err) => setError(err instanceof Error ? err.message : 'Xato'))
      .finally(() => setClearing(false))
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild>
              <Link to={`/admin/tests/${id}`}>
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white">
                <LayoutGrid className="h-4 w-4" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-slate-900">Real vaqtda monitoring</h1>
                <p className="text-xs text-slate-500">{data?.test?.name ?? '—'} • {data?.test?.code ?? '—'}</p>
              </div>
            </div>
          </div>
          <div
            className={cn(
              'flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium',
              liveConnected
                ? 'border-green-200 bg-green-50 text-green-800'
                : 'border-slate-200 bg-slate-50 text-slate-600'
            )}
          >
            <span
              className={cn(
                'h-2 w-2 rounded-full',
                liveConnected ? 'bg-green-500 animate-pulse' : 'bg-slate-400'
              )}
            />
            {liveConnected ? 'Ulanish: faol' : 'Ulanish: o‘chiq'}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6 space-y-4">
        {error ? (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="py-6 text-center">
              <p className="text-sm text-red-800">{error}</p>
              <Button className="mt-3" variant="outline" size="sm" onClick={() => load()}>
                Qayta urinish
              </Button>
            </CardContent>
          </Card>
        ) : data ? (
          <>
            <ResultsTable data={data} onClearResults={handleClearResults} clearing={clearing} />
            <StatusLegend />
          </>
        ) : null}
      </main>
    </div>
  )
}

function ResultsTable({
  data,
  onClearResults,
  clearing,
}: {
  data: ResultsResponse
  onClearResults: () => void
  clearing: boolean
}) {
  const subjects = Array.isArray(data.subjects) ? data.subjects : []
  const rows = Array.isArray(data.rows) ? data.rows : []

  const handleExportCsv = () => {
    if (!rows.length || !subjects.length) return

    const subjectColumns: { id: string; name: string }[] = subjects.map((s) => ({
      id: s._id,
      name: s.name,
    }))

    const header = [
      'Oquvchi',
      ...subjectColumns.flatMap((s) => [
        `${s.name} (1010)`,
        `${s.name} (%)`,
      ]),
    ]

    const csvRows: string[] = []
    csvRows.push(header.join(','))

    rows.forEach((row) => {
      const base = `${row.studentName} ${row.studentSurname}`.trim()
      const cells: string[] = [base]

      subjectColumns.forEach((s) => {
        const st = row.subjectStats.find((x) => x.subjectId === s.id)
        if (!st) {
          cells.push('', '')
          return
        }
        const answers = st.cells
          .map((c) => (c.status === 'correct' ? '1' : '0'))
          .join('')
        cells.push(`"${answers}"`, String(st.percent))
      })

      csvRows.push(cells.join(','))
    })

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `natijalar_${data.test?.code || 'test'}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }
  return (
            <Card className="overflow-hidden border-0 bg-white shadow-sm">
              <div className="flex items-center justify-between border-b bg-slate-50/80 px-4 py-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExportCsv}
                  disabled={rows.length === 0 || subjects.length === 0}
                  className="flex items-center gap-1.5"
                >
                  <FileSpreadsheet className="h-3.5 w-3.5" />
                  Excelga eksport (CSV)
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onClearResults}
                  disabled={clearing || rows.length === 0}
                  className="text-red-600 border-red-200 hover:bg-red-50"
                >
                  <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                  Barcha natijalarni tozalash
                </Button>
              </div>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-sm">
                    <thead>
                      <tr className="border-b bg-slate-50/80">
                        <th className="px-4 py-3 text-left font-semibold uppercase tracking-wide text-slate-600">
                          Ism va familiya
                        </th>
                        {subjects.map((s) => (
                          <th key={s._id} className="px-4 py-3 text-left font-semibold uppercase tracking-wide text-slate-600">
                            {s.name.toUpperCase()}
                          </th>
                        ))}
                        <th className="px-4 py-3 text-left font-semibold uppercase tracking-wide text-slate-600">
                          Umumiy ball (%)
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((row: ResultRow) => {
                        const answeredCount = row.subjectStats.reduce((sum, st) => sum + st.correct + st.wrong, 0)
                        const currentQ = answeredCount < row.totalQuestions ? answeredCount + 1 : null
                        const subtitle = currentQ
                          ? `• ${currentQ}-savol`
                          : '• Tugallandi'
                        return (
                          <tr key={row.sessionId} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50">
                            <td className="px-4 py-3">
                              <div>
                                <p className="font-medium text-slate-900">
                                  {row.studentName} {row.studentSurname}
                                </p>
                                <p className="text-xs text-slate-500">{subtitle}</p>
                              </div>
                            </td>
                            {row.subjectStats.map((st) => (
                              <td key={st.subjectId} className="px-4 py-3">
                                <div className="flex flex-col gap-1.5">
                                  <div className="flex flex-wrap gap-0.5">
                                    {st.cells.map((c, i) => {
                                      const display = getCellDisplay(c.status)
                                      return (
                                        <span
                                          key={i}
                                          className={cn(
                                            'inline-flex h-5 w-5 items-center justify-center rounded-sm text-[10px] font-medium',
                                            display === 'correct' && 'bg-green-500 text-white',
                                            display === 'wrong' && 'bg-red-500 text-white',
                                            display === 'unanswered' && 'bg-slate-200 text-slate-600'
                                          )}
                                          title={
                                            display === 'correct'
                                              ? `Savol ${i + 1} — To‘g‘ri`
                                              : display === 'wrong'
                                                ? `Savol ${i + 1} — Noto‘g‘ri`
                                                : `Savol ${i + 1} — Javobsiz`
                                          }
                                        >
                                          {i + 1}
                                        </span>
                                      )
                                    })}
                                  </div>
                                  <span className="text-xs font-medium text-slate-600">{st.percent}%</span>
                                </div>
                              </td>
                            ))}
                            <td className="px-4 py-3">
                              <span
                                className={cn(
                                  'font-bold',
                                  row.totalPercent >= 50 ? 'text-green-600' : 'text-slate-900'
                                )}
                              >
                                {row.totalPercent}% jami
                              </span>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
                {rows.length === 0 && (
                  <div className="px-4 py-10 text-center">
                    <p className="text-sm font-medium text-slate-600">Hali hech kim qo‘shilmagan</p>
                    <p className="mt-1 text-xs text-slate-500">
                      Testni «Testni ishga tushirish» qilib, o‘quvchilar 6 xonali kod orqali kirgach, natijalar shu yerda real vaqtda ko‘rinadi.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
  )
}

function StatusLegend() {
  return (
    <Card className="mt-6 border-0 bg-white shadow-sm">
      <CardContent className="px-4 py-3">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
          Holatlar
        </p>
        <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600">
          <span className="flex items-center gap-2">
            <span className="h-4 w-3 rounded-sm bg-green-500" />
            To‘g‘ri
          </span>
          <span className="flex items-center gap-2">
            <span className="h-4 w-3 rounded-sm bg-red-500" />
            Noto‘g‘ri
          </span>
          <span className="flex items-center gap-2">
            <span className="h-4 w-3 rounded-sm bg-slate-200" />
            Javobsiz
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
