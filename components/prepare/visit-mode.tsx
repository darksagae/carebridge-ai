'use client'

import { Check, X } from 'lucide-react'
import { useEffect, useRef } from 'react'
import type { Brief, BriefQuestion } from '@/lib/brief'

/** Large, distraction-free checklist for use during the appointment. */
export function VisitMode({
  brief,
  onChange,
  onClose,
}: {
  brief: Brief
  onChange: (brief: Brief) => void
  onClose: () => void
}) {
  const heading = useRef<HTMLHeadingElement>(null)
  const asked = brief.questions.filter((q) => q.asked).length
  const total = brief.questions.length

  useEffect(() => {
    heading.current?.focus()
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [onClose])

  const patch = (id: string, change: Partial<BriefQuestion>) =>
    onChange({ ...brief, questions: brief.questions.map((q) => (q.id === id ? { ...q, ...change } : q)) })

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="visit-title"
      className="fixed inset-0 z-50 overflow-y-auto bg-canvas"
    >
      <div className="sticky top-0 z-10 border-b border-line bg-canvas/95 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <div>
            <h2 id="visit-title" ref={heading} tabIndex={-1} className="font-serif text-2xl font-semibold">
              Visit mode
            </h2>
            <p className="text-sm text-ink-soft" aria-live="polite">
              {asked} of {total} questions asked
            </p>
          </div>
          <button type="button" className="btn btn-primary" onClick={onClose}>
            <X className="size-5" aria-hidden="true" /> Done
          </button>
        </div>
        <div className="h-1.5 bg-sunken">
          <div
            className="h-full bg-teal transition-[width] duration-300"
            style={{ width: `${(asked / Math.max(total, 1)) * 100}%` }}
          />
        </div>
      </div>

      <div className="mx-auto max-w-3xl space-y-8 px-4 py-8 sm:px-6">
        <section aria-labelledby="say-first">
          <h3 id="say-first" className="text-sm font-bold tracking-[0.14em] text-ink-soft uppercase">
            Start with
          </h3>
          <p className="mt-2 font-serif text-2xl leading-relaxed">{brief.summary}</p>
        </section>

        <section aria-labelledby="ask">
          <h3 id="ask" className="text-sm font-bold tracking-[0.14em] text-ink-soft uppercase">
            Ask
          </h3>
          <ol className="mt-3 space-y-4">
            {brief.questions.map((q, index) => (
              <li
                key={q.id}
                className={`rounded-3xl border-2 p-5 transition-colors ${q.asked ? 'border-teal bg-teal-soft' : 'border-line bg-surface'}`}
              >
                <label className="flex cursor-pointer gap-4">
                  <input
                    type="checkbox"
                    checked={Boolean(q.asked)}
                    onChange={(e) => patch(q.id, { asked: e.target.checked })}
                    className="peer sr-only"
                  />
                  <span
                    aria-hidden="true"
                    className={`grid size-9 shrink-0 place-items-center rounded-xl border-2 peer-focus-visible:outline-3 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-teal ${
                      q.asked ? 'border-teal bg-teal text-on-teal' : 'border-line-strong'
                    }`}
                  >
                    {q.asked ? (
                      <Check className="size-5" strokeWidth={3} />
                    ) : (
                      <span className="font-bold text-ink-soft">{index + 1}</span>
                    )}
                  </span>
                  <span className={`pt-1 text-xl ${q.priority === 'high' ? 'font-bold' : ''}`}>{q.text}</span>
                </label>
                <label htmlFor={`answer-${q.id}`} className="sr-only">
                  Answer to: {q.text}
                </label>
                <textarea
                  id={`answer-${q.id}`}
                  value={q.answer ?? ''}
                  onChange={(e) => patch(q.id, { answer: e.target.value.slice(0, 1000) })}
                  rows={2}
                  placeholder="What did they say?"
                  className="input mt-4 resize-y"
                />
              </li>
            ))}
          </ol>
        </section>

        {brief.tell.length > 0 && (
          <section aria-labelledby="mention">
            <h3 id="mention" className="text-sm font-bold tracking-[0.14em] text-ink-soft uppercase">
              Remember to mention
            </h3>
            <ul className="mt-3 space-y-2 text-lg">
              {brief.tell.map((line) => (
                <li key={line} className="flex gap-3">
                  <span className="mt-3 size-2 shrink-0 rounded-full bg-teal" aria-hidden="true" />
                  {line}
                </li>
              ))}
            </ul>
          </section>
        )}

        <button type="button" className="btn btn-primary w-full text-lg" onClick={onClose}>
          Finish and see my notes
        </button>
      </div>
    </div>
  )
}
