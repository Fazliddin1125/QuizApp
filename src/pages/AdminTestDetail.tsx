import { useEffect, useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ArrowLeft, BarChart3 } from 'lucide-react'
import { api } from '@/lib/api'
import type { Test } from '@/types'
import type { Subject } from '@/types'
import type { Question } from '@/types'
import SubjectForm from '@/components/SubjectForm'
import QuestionForm from '@/components/QuestionForm'

export default function AdminTestDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [test, setTest] = useState<Test | null>(null)
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [questionsBySubject, setQuestionsBySubject] = useState<Record<string, Question[]>>({})
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('')

  const loadTest = () => {
    if (!id) return Promise.resolve()
    return api.get<Test>(`/api/tests/${id}`).then(setTest).catch(() => navigate('/admin')) as Promise<void>
  }

  const loadSubjects = () => {
    if (!id) return
    api.get<Subject[]>(`/api/tests/${id}/subjects`).then((list) => {
      setSubjects(list)
      if (list.length && !activeTab) setActiveTab(list[0]._id)
    })
  }

  const loadQuestions = (subjectId: string) => {
    api.get<Question[]>(`/api/subjects/${subjectId}/questions`).then((list) => {
      setQuestionsBySubject((prev) => ({ ...prev, [subjectId]: list }))
    })
  }

  useEffect(() => {
    if (!id) return
    loadTest().finally(() => setLoading(false))
  }, [id])

  useEffect(() => {
    if (!id) return
    loadSubjects()
  }, [id])

  useEffect(() => {
    subjects.forEach((s) => loadQuestions(s._id))
  }, [subjects.map((s) => s._id).join(',')])

  const addSubject = async (name: string) => {
    if (!id) return
    await api.post<Subject>(`/api/tests/${id}/subjects`, { name })
    loadSubjects()
  }

  const deleteSubject = async (subjectId: string) => {
    if (!id) return
    await api.delete(`/api/tests/${id}/subjects/${subjectId}`)
    setQuestionsBySubject((prev) => {
      const next = { ...prev }
      delete next[subjectId]
      return next
    })
    loadSubjects()
  }

  const addQuestion = async (
    subjectId: string,
    data: { text: string; imageUrl?: string | null; options: { key: string; text: string }[]; correctKey: string }
  ) => {
    await api.post<Question>(`/api/subjects/${subjectId}/questions`, data)
    loadQuestions(subjectId)
  }

  const deleteQuestion = async (subjectId: string, questionId: string) => {
    await api.delete(`/api/subjects/${subjectId}/questions/${questionId}`)
    loadQuestions(subjectId)
  }

  const toggleActive = async () => {
    if (!test || !id) return
    await api.patch<Test>(`/api/tests/${id}`, { isActive: !test.isActive })
    loadTest()
  }

  const toggleShowCorrect = async () => {
    if (!test || !id) return
    await api.patch<Test>(`/api/tests/${id}`, { showCorrectAnswer: !test.showCorrectAnswer })
    loadTest()
  }

  if (loading && !test) return <div className="flex min-h-screen items-center justify-center">Yuklanmoqda…</div>
  if (!test) return null

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="border-b bg-background">
        <div className="container mx-auto flex h-14 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/admin">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <span className="font-semibold">{test.name}</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link to={`/admin/tests/${id}/results`}>
                <BarChart3 className="mr-2 h-4 w-4" />
                Natijalar
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Sozlamalar</CardTitle>
            <p className="text-sm text-muted-foreground">
              O‘quvchilar testga kirish uchun kod: <span className="font-mono font-bold text-lg">{test.code}</span>
            </p>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-4">
            <Button variant={test.isActive ? 'destructive' : 'default'} onClick={toggleActive}>
              {test.isActive ? 'Testni to‘xtatish' : 'Testni ishga tushirish'}
            </Button>
            <Button variant="outline" onClick={toggleShowCorrect}>
              Javobni ko‘rsatish: {test.showCorrectAnswer ? 'Ha' : 'Yo‘q'}
            </Button>
          </CardContent>
        </Card>

        <div className="mb-4 flex flex-wrap items-center gap-2">
          <SubjectForm onAdd={addSubject} />
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4 flex flex-wrap">
            {subjects.map((s) => (
              <TabsTrigger key={s._id} value={s._id}>
                {s.name}
              </TabsTrigger>
            ))}
          </TabsList>

          {subjects.map((sub) => (
            <TabsContent key={sub._id} value={sub._id}>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>{sub.name}</CardTitle>
                  <Button variant="outline" size="sm" onClick={() => deleteSubject(sub._id)}>
                    O‘chirish
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  {(questionsBySubject[sub._id] || []).map((q, i) => (
                    <div key={q._id} className="rounded-lg border p-4">
                      <p className="font-medium">{i + 1}. {q.text}</p>
                      {q.imageUrl && <img src={q.imageUrl} alt="" className="mt-2 max-h-48 rounded object-contain" />}
                      <ul className="mt-2 list-inside list-disc text-sm text-muted-foreground">
                        {q.options.map((o) => (
                          <li key={o.key}>{o.key}) {o.text} {q.correctKey === o.key && '(to‘g‘ri)'}</li>
                        ))}
                      </ul>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="mt-2 text-destructive"
                        onClick={() => deleteQuestion(sub._id, q._id)}
                      >
                        O‘chirish
                      </Button>
                    </div>
                  ))}
                  <QuestionForm subjectId={sub._id} onAdd={addQuestion} />
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      </main>
    </div>
  )
}
