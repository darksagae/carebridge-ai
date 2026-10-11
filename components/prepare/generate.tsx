'use client'

import { FileText, LoaderCircle, Sparkles } from 'lucide-react'
import { useEffect, useState } from 'react'
import type { Brief } from '@/lib/brief'
import type { Intake } from '@/lib/intake'
import { templateBrief } from '@/lib/template'
import { SafetyBanner } from './steps'

type Mode = 'template' | 'ai'

export function GenerateStep({ intake, onBrief }: { intake: Intake; onBrief: (brief: Brief) => void }) {
  const [aiAvailable, setAiAvailable] = useState<boolean | null>(null)
  const [mode, setMode] = useState<Mode>('template')
  const [consent, setConsent] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/brief', { cache: 'no-store' })
      .then((r) => r.json())
      .then((data) => setAiAvailable(Boolean(data.ai)))
      .catch(() => setAiAvailable(false))
  }, [])

  async function generate() {
    setError(null)
    if (mode === 'template') return onBrief(templateBrief(intake))
    if (!consent) return setError('Tick the box to agree before sending your notes to the AI service.')
    setBusy(true)
    try {
      const response = await fetch('/api/brief', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ intake, consent: true }),
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data.error ?? 'The AI draft failed. Try again or use the template.')
      onBrief(data.brief as Brief)
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setBusy(false)
    }
  }

  const options: { id: Mode; icon: typeof FileText; title: string; body: string; disabled?: boolean }[] = [
    {
      id: 'template',
      icon: FileText,
      title: 'Built-in template',
      body: 'Instant and fully private: your brief is made on this device and nothing is sent anywhere.',
    },
    {
      id: 'ai',
      icon: Sparkles,
      title: 'Write it with AI',
      body:
        aiAvailable === false
          ? 'Not set up on this server. The template gives you the same structure.'
          : 'A more natural summary and tailored questions. Your notes are sent to an AI service to draft it.',
      disabled: aiAvailable === false,
    },
  ]

  return (
    <div className="space-y-6">
      <SafetyBanner intake={intake} />
      <fieldset>
        <legend className="label">How should we write your brief?</legend>
        <div className="grid gap-3 md:grid-cols-2">
          {options.map(({ id, icon: Icon, title, body, disabled }) => {
            const checked = mode === id
            return (
              <label
                key={id}
                className={`flex gap-4 rounded-3xl border-2 p-5 transition-colors has-focus-visible:outline-3 has-focus-visible:outline-brand ${
                  disabled
                    ? 'cursor-not-allowed border-line opacity-60'
                    : checked
                      ? 'cursor-pointer border-brand bg-brand-soft'
                      : 'cursor-pointer border-line hover:border-line-strong'
                }`}
              >
                <input
                  type="radio"
                  name="mode"
                  className="sr-only"
                  checked={checked}
                  disabled={disabled}
                  onChange={() => (setMode(id), setError(null))}
                />
                <span
                  className={`grid size-11 shrink-0 place-items-center rounded-2xl ${checked ? 'bg-brand text-on-brand' : 'bg-sunken text-brand'}`}
                >
                  <Icon className="size-5" aria-hidden="true" />
                </span>
                <span>
                  <span className="block font-bold">{title}</span>
                  <span className="mt-1 block text-sm text-ink-soft">{body}</span>
                </span>
              </label>
            )
          })}
        </div>
      </fieldset>

      {mode === 'ai' && (
        <label className="flex cursor-pointer gap-4 rounded-3xl bg-amber-soft p-5">
          <input
            type="checkbox"
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
            className="mt-1 size-5 shrink-0 accent-brand"
          />
          <span className="text-sm">
            I agree to send these notes to Vercel AI Gateway and its AI model provider to draft my brief. I’ve left out
            my name, ID numbers and contact details. The draft may contain mistakes and I will check it.
          </span>
        </label>
      )}

      {error && (
        <div
          role="alert"
          className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-danger-soft px-5 py-4"
        >
          <p className="font-bold text-danger">{error}</p>
          {mode === 'ai' && (
            <button type="button" className="btn btn-secondary min-h-10" onClick={() => onBrief(templateBrief(intake))}>
              Use the template instead
            </button>
          )}
        </div>
      )}

      <button
        type="button"
        className="btn btn-primary w-full text-lg sm:w-auto sm:px-8"
        onClick={generate}
        disabled={busy}
      >
        {busy ? (
          <>
            <LoaderCircle className="size-5 animate-spin" aria-hidden="true" /> Writing your brief…
          </>
        ) : (
          'Create my brief'
        )}
      </button>
    </div>
  )
}
