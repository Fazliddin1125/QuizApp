import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { uploadImage } from '@/lib/api'

const OPTION_KEYS = ['A', 'B', 'C', 'D'] as const

interface QuestionFormProps {
  subjectId: string
  onAdd: (
    subjectId: string,
    data: {
      text: string
      imageUrl?: string | null
      options: { key: string; text: string }[]
      correctKey: string
    }
  ) => Promise<void>
}

export default function QuestionForm({ subjectId, onAdd }: QuestionFormProps) {
  const [text, setText] = useState('')
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [options, setOptions] = useState({ A: '', B: '', C: '', D: '' })
  const [correctKey, setCorrectKey] = useState<'A' | 'B' | 'C' | 'D'>('A')
  const [uploading, setUploading] = useState(false)
  const [loading, setLoading] = useState(false)
  const [uploadError, setUploadError] = useState('')

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setUploadError('')
    try {
      const { url } = await uploadImage(file)
      setImageUrl(url)
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Rasm yuklashda xato')
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!text.trim()) return
    const opts = OPTION_KEYS.map((k) => ({ key: k, text: options[k].trim() || k }))
    if (opts.some((o) => !o.text)) return
    setLoading(true)
    try {
      await onAdd(subjectId, {
        text: text.trim(),
        imageUrl: imageUrl || undefined,
        options: opts,
        correctKey,
      })
      setText('')
      setImageUrl(null)
      setOptions({ A: '', B: '', C: '', D: '' })
      setCorrectKey('A')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border border-dashed p-4">
      <h4 className="font-medium">Yangi savol</h4>
      <div>
        <Label>Savol matni</Label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Savol yozing..."
          className="mt-1 min-h-20 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
          rows={3}
        />
      </div>
      <div>
        <Label>Rasm (ixtiyoriy)</Label>
        <input type="file" accept="image/*" onChange={handleFile} className="mt-1 text-sm" />
        {uploading && <span className="ml-2 text-sm text-muted-foreground">Yuklanmoqda…</span>}
        {uploadError && <p className="mt-1 text-xs text-destructive">{uploadError}</p>}
        {imageUrl && (
          <div className="mt-2">
            <img src={imageUrl} alt="" className="max-h-32 rounded object-contain" />
            <Button type="button" variant="ghost" size="sm" onClick={() => setImageUrl(null)}>
              O‘chirish
            </Button>
          </div>
        )}
      </div>
      <div>
        <Label>Variantlar</Label>
        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          {OPTION_KEYS.map((k) => (
            <div key={k} className="flex items-center gap-2">
              <span className="w-6 font-medium">{k}</span>
              <Input
                value={options[k]}
                onChange={(e) => setOptions((p) => ({ ...p, [k]: e.target.value }))}
                placeholder={`Variant ${k}`}
              />
              <label className="flex items-center gap-1 text-sm">
                <input
                  type="radio"
                  name="correct"
                  checked={correctKey === k}
                  onChange={() => setCorrectKey(k)}
                />
                To‘g‘ri
              </label>
            </div>
          ))}
        </div>
      </div>
      <Button type="submit" disabled={loading || uploading}>
        Qo‘shish
      </Button>
    </form>
  )
}
