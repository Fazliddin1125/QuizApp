import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface SubjectFormProps {
  onAdd: (name: string) => Promise<void>
  trigger?: React.ReactNode
}

export default function SubjectForm({ onAdd, trigger }: SubjectFormProps) {
  const [name, setName] = useState('')
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    setLoading(true)
    try {
      await onAdd(name.trim())
      setName('')
      setOpen(false)
    } finally {
      setLoading(false)
    }
  }

  if (!open) {
    return (
      <button
        type="button"
        className="inline-flex items-center justify-center rounded-md px-3 py-1 text-sm font-medium text-muted-foreground hover:bg-background/50"
        onClick={() => setOpen(true)}
      >
        {trigger ?? '+ Fan'}
      </button>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="inline-flex items-center gap-2">
      <Input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Fan nomi"
        className="h-8 w-40"
        autoFocus
      />
      <Button type="submit" size="sm" disabled={loading}>
        Qo'shish
      </Button>
      <Button type="button" variant="ghost" size="sm" onClick={() => { setOpen(false); setName('') }}>
        Bekor
      </Button>
    </form>
  )
}
