import { useEffect } from 'react'

export function usePageTitle(title: string) {
  useEffect(() => {
    const base = 'QuizApp'
    document.title = title ? `${title} – ${base}` : base
  }, [title])
}

