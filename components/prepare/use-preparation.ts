'use client'

import { useCallback, useEffect, useState } from 'react'
import type { Brief } from '@/lib/brief'
import { EMPTY_INTAKE, VISIT_TYPES, type Intake } from '@/lib/intake'

export type View = 'intake' | 'brief' | 'visit'
export type Preparation = { intake: Intake; brief: Brief | null; step: number; view: View }

const KEY = 'carebridge:v1'
const INITIAL: Preparation = { intake: EMPTY_INTAKE, brief: null, step: 0, view: 'intake' }

function read(storage: Storage): Preparation | null {
  try {
    const raw = storage.getItem(KEY)
    if (!raw) return null
    const saved = JSON.parse(raw) as Preparation
    // Drafts may be incomplete, so keep each field whose type matches instead of
    // validating the whole intake strictly.
    const intake = { ...EMPTY_INTAKE }
    for (const key of Object.keys(EMPTY_INTAKE) as (keyof Intake)[]) {
      const value = saved.intake?.[key]
      if (typeof value === typeof EMPTY_INTAKE[key] && Array.isArray(value) === Array.isArray(EMPTY_INTAKE[key])) {
        ;(intake as Record<string, unknown>)[key] = value
      }
    }
    if (!VISIT_TYPES.some((v) => v.id === intake.visitType)) intake.visitType = EMPTY_INTAKE.visitType
    return {
      intake,
      brief: saved.brief && Array.isArray(saved.brief.questions) ? saved.brief : null,
      step: Number.isInteger(saved.step) ? Math.min(Math.max(saved.step, 0), 4) : 0,
      view: saved.view === 'brief' || saved.view === 'visit' ? saved.view : 'intake',
    }
  } catch {
    return null
  }
}

function safely(fn: () => void) {
  try {
    fn()
  } catch {
    // Storage can be unavailable (private mode, blocked site data). The app still works in memory.
  }
}

/**
 * Keeps the preparation in this tab (sessionStorage) by default, or on this
 * device (localStorage) when the person opts in. Nothing is sent to a server.
 */
export function usePreparation() {
  const [state, setState] = useState<Preparation>(INITIAL)
  const [remember, setRemember] = useState(false)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    let saved: Preparation | null = null
    let local = false
    safely(() => {
      saved = read(localStorage)
      local = saved !== null
      saved ??= read(sessionStorage)
    })
    if (saved) setState(saved)
    setRemember(local)
    setLoaded(true)
  }, [])

  useEffect(() => {
    if (!loaded) return
    safely(() => {
      const value = JSON.stringify(state)
      if (remember) {
        localStorage.setItem(KEY, value)
        sessionStorage.removeItem(KEY)
      } else {
        sessionStorage.setItem(KEY, value)
        localStorage.removeItem(KEY)
      }
    })
  }, [state, remember, loaded])

  const update = useCallback((patch: Partial<Preparation> | ((s: Preparation) => Partial<Preparation>)) => {
    setState((current) => ({ ...current, ...(typeof patch === 'function' ? patch(current) : patch) }))
  }, [])

  const clear = useCallback(() => {
    safely(() => {
      localStorage.removeItem(KEY)
      sessionStorage.removeItem(KEY)
    })
    setRemember(false)
    setState(INITIAL)
  }, [])

  return { state, update, remember, setRemember, clear, loaded }
}
