import { useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { LayoutGrid, GraduationCap, Plus, ArrowRight } from "lucide-react"

export default function Landing() {
  const navigate = useNavigate()
  const [codeDigits, setCodeDigits] = useState<string[]>(Array(6).fill(""))
  const inputsRef = useRef<Array<HTMLInputElement | null>>([])

  const handleDigitChange = (idx: number, value: string) => {
    const v = value.replace(/\D/g, "").slice(-1)
    const next = [...codeDigits]
    next[idx] = v
    setCodeDigits(next)
    if (v && idx < 5) inputsRef.current[idx + 1]?.focus()
  }

  const handleKeyDown = (idx: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !codeDigits[idx] && idx > 0) {
      inputsRef.current[idx - 1]?.focus()
    }
  }

  const accessCode = codeDigits.join("")
  const isReady = accessCode.length === 6

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault()
    if (!isReady) return
    navigate(`/join/${accessCode}`)
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header — fixed */}
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white">
              <LayoutGrid className="h-5 w-5" />
            </div>
            <span className="text-lg font-bold text-slate-900">QuizApp</span>
          </div>
          <nav className="flex items-center gap-6">
            <a href="#" className="text-sm font-medium text-slate-700 hover:text-slate-900">Asosiy</a>
            <a href="#" className="text-sm font-medium text-slate-700 hover:text-slate-900">Qo&apos;llanma</a>
            <a href="#" className="text-sm font-medium text-slate-700 hover:text-slate-900">Bog&apos;lanish</a>
            <Button
              size="sm"
              className="rounded-lg bg-blue-600 px-4 hover:bg-blue-700"
              onClick={() => navigate("/admin/login")}
            >
              Kirish
            </Button>
          </nav>
        </div>
      </header>

      {/* Main — centered, desktop max width */}
      <main className="mx-auto w-full max-w-xl flex-1 px-4 py-12 md:py-16">
        <section className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
            Testga qo&apos;shilish
          </h1>
          <p className="mt-3 text-sm text-slate-600 md:text-base">
            Davom etish uchun o&apos;qituvchingiz tomonidan berilgan 6 xonali maxfiy kodni kiriting
          </p>
        </section>

        <form onSubmit={handleJoin} className="mt-8 space-y-6">
          <div className="flex justify-center gap-2 md:gap-3">
            {codeDigits.map((d, i) => (
              <Input
                key={i}
                ref={(el) => { inputsRef.current[i] = el }}
                inputMode="numeric"
                maxLength={1}
                value={d}
                placeholder="•"
                onChange={e => handleDigitChange(i, e.target.value)}
                onKeyDown={e => handleKeyDown(i, e)}
                className="h-12 w-12 rounded-xl border-slate-300 bg-white text-center text-xl font-semibold tracking-widest text-slate-900 placeholder:text-slate-300 focus-visible:ring-2 focus-visible:ring-blue-500 md:h-14 md:w-14 md:text-2xl"
              />
            ))}
          </div>
          <div className="flex justify-center">
            <Button
              type="submit"
              disabled={!isReady}
              className="h-12 rounded-xl bg-blue-600 px-8 text-base font-semibold hover:bg-blue-700 disabled:opacity-50"
            >
              Testni boshlash
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </form>

        {/* O'qituvchilar uchun card */}
        <section className="mt-12 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                <GraduationCap className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-slate-900">O&apos;qituvchilar uchun</h2>
                <p className="mt-1 text-sm text-slate-600">
                  O&apos;zingizning shaxsiy testlaringizni yarating va o&apos;quvchilaringiz bilimini tekshiring.
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              className="shrink-0 rounded-xl border-blue-600 text-blue-600 hover:bg-blue-50 hover:text-blue-700"
              onClick={() => navigate("/admin")}
            >
              <Plus className="mr-2 h-4 w-4" />
              Test yaratish
            </Button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6">
        <p className="text-center text-sm text-slate-500">
          © 2024 QuizApp. Barcha huquqlar himoyalangan.
        </p>
      </footer>
    </div>
  )
}
