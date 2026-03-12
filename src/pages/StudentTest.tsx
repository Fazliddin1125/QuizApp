import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'
import type { JoinResponse } from '@/types'
import { Check, X, Sigma, PanelRightClose, ChevronUp } from 'lucide-react'

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080'

type Subject = { _id: string; name: string }
type Question = { _id: string; subjectId: string }

function StudentTestSidebar({
  activeSub,
  questions,
  answered,
  total,
  correctCount,
  wrongCount,
  percent,
  selectedAnswers,
  feedback,
  sidebarOpen,
  setSidebarOpen,
  scrollToQuestion,
}: {
  activeSub: Subject
  questions: Question[]
  answered: number
  total: number
  correctCount: number
  wrongCount: number
  percent: number
  selectedAnswers: Record<string, string>
  feedback: Record<string, 'correct' | 'wrong'>
  sidebarOpen: boolean
  setSidebarOpen: (v: boolean) => void
  scrollToQuestion: (subjectId: string, index: number) => void
}) {
  const content = (
    <>
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Progress</p>
        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
          <div className="h-full rounded-full bg-blue-600 transition-all" style={{ width: `${percent}%` }} />
        </div>
        <p className="mt-2 text-sm font-medium text-slate-700">{answered}/{total} savol</p>
        <p className="text-xs text-green-600">To'g'ri javoblar: {correctCount}</p>
        <p className="text-xs text-red-600">Xato javoblar: {wrongCount}</p>
      </div>
      <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Savollar to'plami</p>
        <div className="grid grid-cols-5 gap-1.5">
          {questions.map((q, idx) => {
            const hasAnswer = !!selectedAnswers[q._id]
            const status = !hasAnswer ? 'unanswered' : feedback[q._id] === 'correct' ? 'correct' : feedback[q._id] === 'wrong' ? 'wrong' : 'answered'
            return (
              <button
                key={q._id}
                type="button"
                className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold transition',
                  status === 'correct' && 'bg-green-500 text-white',
                  status === 'wrong' && 'bg-red-500 text-white',
                  status === 'answered' && 'bg-blue-500 text-white',
                  status === 'unanswered' && 'bg-slate-200 text-slate-600'
                )}
                onClick={() => scrollToQuestion(activeSub._id, idx)}
              >
                {idx + 1}
              </button>
            )
          })}
        </div>
        <div className="mt-3 flex flex-wrap gap-3 text-[10px] text-slate-600">
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-green-500" /> To'g'ri</span>
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-red-500" /> Xato</span>
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-blue-500" /> Yechilgan</span>
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-slate-200" /> Javobsiz</span>
        </div>
      </div>
    </>
  )
  return (
    <>
      <aside className="hidden lg:block lg:space-y-0">{content}</aside>
      <div className="fixed bottom-4 right-4 z-20 lg:hidden">
        <Button size="icon" className="h-12 w-12 rounded-full bg-blue-600 shadow-lg" onClick={() => setSidebarOpen(true)}>
          <PanelRightClose className="h-5 w-5" />
        </Button>
      </div>
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)}>
          <div className="absolute right-0 top-0 h-full w-full max-w-sm overflow-y-auto bg-white p-4 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-3">
              <p className="font-semibold text-slate-800">Progress</p>
              <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(false)}><ChevronUp className="h-5 w-5 rotate-90" /></Button>
            </div>
            {content}
          </div>
        </div>
      )}
    </>
  )
}

export default function StudentTest() {
  const navigate = useNavigate()
  const [session, setSession] = useState<JoinResponse | null>(null)
  const [activeSubjectId, setActiveSubjectId] = useState<string>('')
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({})
  const [feedback, setFeedback] = useState<Record<string, 'correct' | 'wrong'>>({})
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    if (!session) return
    const fullName = `${(session as any).studentName || ''} ${(session as any).studentSurname || ''}`.trim()
    const title = fullName ? `${fullName} — ${session.testName}` : session.testName
    document.title = title ? `${title} – QuizApp` : 'QuizApp'
  }, [session])

  useEffect(() => {
    const raw = localStorage.getItem('studentSession')
    if (!raw) {
      navigate('/', { replace: true })
      return
    }
    try {
      const data = JSON.parse(raw) as JoinResponse
      setSession(data)
      if (data.subjects.length) setActiveSubjectId(data.subjects[0]._id)
      setSecondsLeft(data.durationMinutes * 60)
    } catch {
      navigate('/', { replace: true })
    }
  }, [navigate])

  useEffect(() => {
    if (secondsLeft == null || secondsLeft <= 0) return
    const t = setInterval(() => setSecondsLeft((s) => (s == null ? 0 : s - 1)), 1000)
    return () => clearInterval(t)
  }, [secondsLeft])

  const submitAnswer = useCallback(
    async (questionId: string, selectedKey: string) => {
      if (!session) return
      setSelectedAnswers((prev) => ({ ...prev, [questionId]: selectedKey }))
      setLoading(true)
      try {
        const res = await fetch(`${BASE}/api/student/answer`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId: session.sessionId,
            questionId,
            selectedKey,
          }),
        })
        const data = await res.json()
        if (session.showCorrectAnswer) setFeedback((prev) => ({ ...prev, [questionId]: data.isCorrect ? 'correct' : 'wrong' }))
      } finally {
        setLoading(false)
      }
    },
    [session]
  )

  const scrollToQuestion = (subjectId: string, index: number) => {
    const el = document.getElementById(`savol-${subjectId}-${index}`)
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    setSidebarOpen(false)
  }

  if (!session) return <div className="flex min-h-screen items-center justify-center bg-slate-50"><p className="text-slate-500">Yuklanmoqda…</p></div>

  const activeSub = session.subjects.find((s) => s._id === activeSubjectId)
  const sidebarQuestions = activeSub ? session.questions.filter((q) => q.subjectId === activeSub._id) : []
  const sidebarAnswered = sidebarQuestions.filter((q) => selectedAnswers[q._id]).length
  const sidebarTotal = sidebarQuestions.length
  const sidebarCorrect = sidebarQuestions.filter((q) => feedback[q._id] === 'correct').length
  const sidebarWrong = sidebarQuestions.filter((q) => feedback[q._id] === 'wrong').length
  const sidebarPercent = sidebarTotal ? Math.round((sidebarAnswered / sidebarTotal) * 100) : 0

  const formatTime = (s: number) => {
    const h = Math.floor(s / 3600)
    const m = Math.floor((s % 3600) / 60)
    const sec = s % 60
    if (h > 0) return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`
    return `${m}:${sec.toString().padStart(2, '0')}`
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b bg-white shadow-sm">
        <div className="mx-auto max-w-6xl px-3 py-3 sm:px-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white">
                <Sigma className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-base font-bold text-slate-900 sm:text-lg">{session.testName}</h1>
                <p className="text-xs text-slate-500">Test</p>
              </div>
            </div>
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 rounded-lg bg-slate-100 px-3 py-1.5">
                <span className="text-xs font-medium text-slate-600">Qolgan vaqt</span>
                <span className={cn('font-mono text-sm font-semibold', secondsLeft != null && secondsLeft <= 60 && 'text-red-600')}>
                  {secondsLeft != null ? formatTime(secondsLeft) : '—'}
                </span>
              </div>
              <Button size="sm" className="shrink-0 bg-blue-600 hover:bg-blue-700" onClick={() => navigate('/', { replace: true })}>
                Tugallash
              </Button>
            </div>
          </div>
          <Tabs value={activeSubjectId} onValueChange={setActiveSubjectId} className="mt-2">
            <TabsList className="flex w-full flex-wrap gap-1 rounded-lg bg-slate-100 p-1 sm:flex-nowrap">
              {session.subjects.map((s) => (
                <TabsTrigger key={s._id} value={s._id} className="flex-1 rounded-md px-3 py-1.5 text-xs font-medium data-[state=active]:bg-blue-600 data-[state=active]:text-white sm:text-sm">
                  {s.name}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-3 py-4 sm:px-4 lg:grid lg:grid-cols-[1fr,280px] lg:gap-6">
        {/* Main: questions */}
        <Tabs value={activeSubjectId} onValueChange={setActiveSubjectId} className="lg:col-span-1">
          {session.subjects.map((sub) => {
            const questions = session.questions.filter((q) => q.subjectId === sub._id)
            return (
              <TabsContent key={sub._id} value={sub._id} className="mt-4 lg:mt-0">
                <div className="space-y-5">
                  {questions.map((q, idx) => {
                    const selected = selectedAnswers[q._id]
                    const fb = feedback[q._id]
                    return (
                      <Card key={q._id} id={`savol-${sub._id}-${idx}`} className="overflow-hidden border-slate-200 bg-white shadow-sm">
                        <CardHeader className="pb-2">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-sm font-bold text-slate-800">{idx + 1}-SAVOL</span>
                          </div>
                          <CardTitle className="mt-2 text-base font-semibold leading-snug text-slate-900">
                            {q.text}
                          </CardTitle>
                          {q.imageUrl ? (
                            <div className="mt-3 flex justify-center">
                              <img
                                src={q.imageUrl}
                                alt=""
                                className="max-h-56 cursor-zoom-in rounded-lg border border-slate-200 object-contain"
                                onClick={() => setPreviewUrl(q.imageUrl as string)}
                              />
                            </div>
                          ) : null}
                        </CardHeader>
                        <CardContent className="space-y-2 pt-0">
                          {q.options.map((opt) => {
                            const isSelected = selected === opt.key
                            const isCorrect = fb === 'correct' && isSelected
                            const isWrong = fb === 'wrong' && isSelected
                            return (
                              <Button
                                key={opt.key}
                                variant="outline"
                                className={cn(
                                  'h-auto w-full justify-start rounded-lg border-2 py-3 text-left text-sm',
                                  !selected && 'border-slate-200 bg-slate-50 hover:border-slate-300 hover:bg-slate-100',
                                  isCorrect && 'border-green-500 bg-green-50 text-green-800 hover:bg-green-50',
                                  isWrong && 'border-red-500 bg-red-50 text-red-800 hover:bg-red-50'
                                )}
                                disabled={!!selected || loading}
                                onClick={() => submitAnswer(q._id, opt.key)}
                              >
                                <span className="mr-3 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 border-slate-300 bg-white text-xs font-bold text-slate-700">
                                  {opt.key}
                                </span>
                                <span className="flex-1">{opt.text}</span>
                                {fb !== undefined && isSelected && (
                                  <span className={cn('ml-2 flex items-center gap-1 text-xs font-semibold', isCorrect ? 'text-green-600' : 'text-red-600')}>
                                    {isCorrect ? <><Check className="h-4 w-4" /> To‘g‘ri</> : <><X className="h-4 w-4" /> Noto‘g‘ri</>}
                                  </span>
                                )}
                              </Button>
                            )
                          })}
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </TabsContent>
            )
          })}
        </Tabs>

        {/* Sidebar: progress + grid — desktop always visible, mobile as drawer */}
        {activeSub ? (
          <StudentTestSidebar
            activeSub={activeSub}
            questions={sidebarQuestions}
            answered={sidebarAnswered}
            total={sidebarTotal}
            correctCount={sidebarCorrect}
            wrongCount={sidebarWrong}
            percent={sidebarPercent}
            selectedAnswers={selectedAnswers}
            feedback={feedback}
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
            scrollToQuestion={scrollToQuestion}
          />
        ) : null}
      </div>

      {previewUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={() => setPreviewUrl(null)}>
          <div className="max-h-[85vh] max-w-2xl" onClick={(e) => e.stopPropagation()}>
            <img src={previewUrl} alt="" className="max-h-[80vh] w-full rounded-xl object-contain shadow-2xl" />
          </div>
        </div>
      )}
    </div>
  )
}
