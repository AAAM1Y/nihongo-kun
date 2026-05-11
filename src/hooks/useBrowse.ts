import { useState, useEffect, useCallback } from "react"
import { fetchAllVocab } from "@/lib/dataAdapter"
import type { VocabRow, QueryOpts } from "@/lib/dataAdapter"

export const BROWSE_PAGE_SIZE = 30

export function useBrowse(clearKey: string) {
  const [browseWords, setBrowseWords] = useState<VocabRow[]>([])
  const [browsePage, setBrowsePage] = useState(0)
  const [browsePreview, setBrowsePreview] = useState<VocabRow[] | null>(null)
  const [browseLoading, setBrowseLoading] = useState(false)

  const loadBrowsePreview = useCallback(async (opts: QueryOpts) => {
    setBrowseLoading(true)
    const data = await fetchAllVocab(opts)
    setBrowsePreview(data)
    setBrowseLoading(false)
  }, [])

  const startBrowse = useCallback(async (opts: QueryOpts) => {
    setBrowsePage(0)
    const data = await fetchAllVocab(opts)
    setBrowseWords(data)
    return data
  }, [])

  useEffect(() => { setBrowsePreview(null) }, [clearKey])

  return { browseWords, setBrowseWords, browsePage, setBrowsePage, browsePreview, setBrowsePreview, browseLoading, loadBrowsePreview, startBrowse }
}
