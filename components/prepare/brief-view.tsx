'use client'

import {
  ArrowDown,
  ArrowUp,
  Check,
  ClipboardCopy,
  Download,
  ListChecks,
  Pencil,
  Plus,
  Printer,
  RotateCcw,
  Sparkles,
  Star,
  Trash2,
} from 'lucide-react'
import { useState } from 'react'
import { questionId, type Brief, type BriefQuestion } from '@/lib/brief'
import { briefText, formatDate } from '@/lib/export'
import { LIMITS, visitLabel, type Intake } from '@/lib/intake'
import { SafetyBanner } from './steps'

export function BriefView({
  intake,
  brief,
  onChange,
  onVisit,
  onEdit,
  onReset,
}: {
  intake: Intake
  brief: Brief
  onChange: (brief: Brief) => void
  onVisit: () => void
  onEdit: () => void
  onReset: () => void
}) {
  const [copied, setCopied] = useState(false)
  const [confirmReset, setConfirmReset] = useState(false)
  const asked = brief.questions.filter((q) => q.asked).length
  const answered = brief.questions.some((q) => q.answer?.trim())

  async function copy() {
    try {
      await navigator.clipboard.writeText(briefText(intake, brief))
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopied(false)
    }
  }

  function download() {
    const url = URL.createObjectURL(new Blob([briefText(intake, brief)], { type: 'text/plain;charset=utf-8' }))
    const link = document.createElement('a')
    link.href = url
    link.download = `visit-brief${intake.visitDate ? `-${intake.visitDate}` : ''}.txt`
    link.click()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  }

  const setQuestions = (questions: BriefQuestion[]) => onChange({ ...brief, questions })

  return (
    <div className="grid items-start gap-6 lg:grid-cols-[1fr_19rem] print:block">
      <div className="space-y-5">
        <div className="no-print">
          <SafetyBanner intake={intake} />
        </div>
        {brief.source === 'ai' && (
          <p className="no-print flex items-center gap-2 rounded-2xl bg-amber-soft px-4 py-3 text-sm">
            <Sparkles className="size-4 shrink-0 text-amber-ink" aria-hidden="true" />
            Drafted by AI{brief.model ? ` (${brief.model})` : ''}. Read it through and fix anything that isn’t right.
          </p>
        )}

        <article className="card print-plain p-6 sm:p-10" aria-labelledby="brief-title">
          <header className="flex flex-wrap items-end justify-between gap-3 border-b-2 border-ink pb-5">
            <div>
              <p className="text-sm font-bold tracking-[0.14em] text-ink-soft uppercase">Visit brief</p>
              <h2 id="brief-title" className="font-serif text-3xl font-semibold">
                {visitLabel(intake.visitType)}
              </h2>
            </div>
            <p className="text-right text-ink-soft">
              {intake.visitDate && <span className="block font-bold text-ink">{formatDate(intake.visitDate)}</span>}
              {intake.clinician}
            </p>
          </header>

          <Section title="In short">
            <EditableText
              value={brief.summary}
              label="summary"
              onSave={(summary) => onChange({ ...brief, summary })}
              className="font-serif text-xl leading-relaxed"
            />
          </Section>

          {brief.tell.length > 0 && (
            <Section title="Tell the clinician">
              <ul className="space-y-2">
                {brief.tell.map((line) => (
                  <li key={line} className="flex gap-3">
                    <span className="mt-2.5 size-1.5 shrink-0 rounded-full bg-teal" aria-hidden="true" />
                    {line}
                  </li>
                ))}
              </ul>
            </Section>
          )}

          {(intake.medications.length > 0 || intake.allergies) && (
            <Section title="Medicines and allergies">
              {intake.medications.length > 0 && (
                <table className="w-full text-left">
                  <thead className="text-sm text-ink-soft">
                    <tr>
                      <th className="py-1 pr-4 font-bold">Medicine</th>
                      <th className="py-1 pr-4 font-bold">Dose</th>
                      <th className="py-1 font-bold">How often</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {intake.medications.map((m) => (
                      <tr key={m.id}>
                        <td className="py-2 pr-4 font-bold">{m.name}</td>
                        <td className="py-2 pr-4">{m.dose || '—'}</td>
                        <td className="py-2">{m.frequency || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
              {intake.allergies && (
                <p className="mt-3">
                  <strong>Allergies:</strong> {intake.allergies}
                </p>
              )}
            </Section>
          )}

          <Section title={`My questions${asked ? ` · ${asked} asked` : ''}`}>
            <QuestionList questions={brief.questions} onChange={setQuestions} />
          </Section>

          {brief.bring.length > 0 && (
            <Section title="Bring with me">
              <ul className="grid gap-2 sm:grid-cols-2">
                {brief.bring.map((item) => (
                  <li key={item} className="flex gap-3">
                    <span
                      className="mt-1 grid size-5 shrink-0 place-items-center rounded-md border-2 border-line-strong"
                      aria-hidden="true"
                    />
                    {item}
                  </li>
                ))}
              </ul>
            </Section>
          )}

          <p className="mt-8 border-t border-line pt-4 text-sm text-ink-soft">
            Prepared with CareBridge on {formatDate(brief.createdAt)}
            {brief.source === 'ai' ? ' · AI-assisted draft' : ''}. Not medical advice.
          </p>
        </article>
      </div>

      <aside className="no-print space-y-4 lg:sticky lg:top-6">
        <div className="card space-y-3 p-5">
          <button type="button" className="btn btn-primary w-full text-lg" onClick={onVisit}>
            <ListChecks className="size-5" aria-hidden="true" /> {asked ? 'Back to visit mode' : 'Start visit mode'}
          </button>
          <p className="text-sm text-ink-soft">
            {answered
              ? 'Your notes from the visit are saved with the brief. Download them to keep a copy.'
              : 'Use visit mode in the room to tick off questions and note the answers.'}
          </p>
        </div>
        <div className="card space-y-2 p-5">
          <button type="button" className="btn btn-secondary w-full" onClick={() => window.print()}>
            <Printer className="size-5" aria-hidden="true" /> Print or save as PDF
          </button>
          <button type="button" className="btn btn-secondary w-full" onClick={copy}>
            {copied ? (
              <Check className="size-5 text-teal" aria-hidden="true" />
            ) : (
              <ClipboardCopy className="size-5" aria-hidden="true" />
            )}
            <span aria-live="polite">{copied ? 'Copied' : 'Copy as text'}</span>
          </button>
          <button type="button" className="btn btn-secondary w-full" onClick={download}>
            <Download className="size-5" aria-hidden="true" /> {answered ? 'Download with my notes' : 'Download'}
          </button>
        </div>
        <div className="card space-y-2 p-5">
          <button type="button" className="btn btn-ghost w-full" onClick={onEdit}>
            <Pencil className="size-5" aria-hidden="true" /> Change my answers
          </button>
          {confirmReset ? (
            <div className="space-y-2 rounded-2xl bg-danger-soft p-3">
              <p className="text-sm">Delete this brief and all your answers from this device?</p>
              <div className="flex gap-2">
                <button
                  type="button"
                  className="btn flex-1 bg-danger text-white hover:brightness-110"
                  onClick={onReset}
                >
                  Delete
                </button>
                <button type="button" className="btn btn-ghost" onClick={() => setConfirmReset(false)}>
                  Keep
                </button>
              </div>
            </div>
          ) : (
            <button type="button" className="btn btn-ghost w-full text-danger" onClick={() => setConfirmReset(true)}>
              <RotateCcw className="size-5" aria-hidden="true" /> Start over
            </button>
          )}
        </div>
      </aside>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-8 break-inside-avoid">
      <h3 className="mb-3 text-sm font-bold tracking-[0.14em] text-ink-soft uppercase">{title}</h3>
      {children}
    </section>
  )
}

function EditableText({
  value,
  label,
  onSave,
  className,
}: {
  value: string
  label: string
  onSave: (value: string) => void
  className?: string
}) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(value)
  if (editing) {
    return (
      <div className="space-y-2">
        <label htmlFor={`edit-${label}`} className="sr-only">
          Edit {label}
        </label>
        <textarea
          id={`edit-${label}`}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          rows={4}
          maxLength={900}
          className="input"
        />
        <div className="flex gap-2">
          <button
            type="button"
            className="btn btn-primary min-h-10"
            onClick={() => (onSave(draft.trim() || value), setEditing(false))}
          >
            Save
          </button>
          <button type="button" className="btn btn-ghost min-h-10" onClick={() => (setDraft(value), setEditing(false))}>
            Cancel
          </button>
        </div>
      </div>
    )
  }
  return (
    <div className="group flex gap-3">
      <p className={`flex-1 ${className ?? ''}`}>{value}</p>
      <button
        type="button"
        onClick={() => (setDraft(value), setEditing(true))}
        className="no-print grid size-9 shrink-0 place-items-center rounded-lg text-ink-soft hover:bg-sunken hover:text-ink"
        aria-label={`Edit ${label}`}
      >
        <Pencil className="size-4" aria-hidden="true" />
      </button>
    </div>
  )
}

function QuestionList({ questions, onChange }: { questions: BriefQuestion[]; onChange: (q: BriefQuestion[]) => void }) {
  const [draft, setDraft] = useState('')
  const [editing, setEditing] = useState<string | null>(null)
  const [editText, setEditText] = useState('')

  const move = (index: number, by: number) => {
    const next = [...questions]
    const [item] = next.splice(index, 1)
    next.splice(index + by, 0, item)
    onChange(next)
  }
  const patch = (id: string, change: Partial<BriefQuestion>) =>
    onChange(questions.map((q) => (q.id === id ? { ...q, ...change } : q)))
  const add = () => {
    const text = draft.trim()
    if (!text || questions.length >= 15) return
    onChange([...questions, { id: questionId(), text: text.slice(0, LIMITS.question), priority: 'normal' }])
    setDraft('')
  }

  return (
    <>
      <ol className="space-y-2">
        {questions.map((q, index) => (
          <li key={q.id} className="group rounded-2xl border border-line p-3 print:border-0 print:p-1">
            <div className="flex items-start gap-3">
              <span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-full bg-sunken text-sm font-bold">
                {q.asked ? <Check className="size-4 text-teal" strokeWidth={3} aria-label="Asked" /> : index + 1}
              </span>
              {editing === q.id ? (
                <form
                  className="flex flex-1 gap-2"
                  onSubmit={(e) => {
                    e.preventDefault()
                    if (editText.trim()) patch(q.id, { text: editText.trim().slice(0, LIMITS.question) })
                    setEditing(null)
                  }}
                >
                  <label htmlFor={`q-edit-${q.id}`} className="sr-only">
                    Edit question {index + 1}
                  </label>
                  <input
                    id={`q-edit-${q.id}`}
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    className="input min-h-10"
                    autoFocus
                  />
                  <button className="btn btn-primary min-h-10 px-3">Save</button>
                </form>
              ) : (
                <div className="min-w-0 flex-1">
                  <p className={`pt-0.5 ${q.priority === 'high' ? 'font-bold' : ''} ${q.asked ? 'text-ink-soft' : ''}`}>
                    {q.text}
                  </p>
                  {q.answer?.trim() && (
                    <p className="mt-1 border-l-4 border-teal pl-3 text-sm whitespace-pre-wrap text-ink-soft">
                      {q.answer.trim()}
                    </p>
                  )}
                </div>
              )}
              <div className="no-print flex shrink-0 items-center">
                <IconButton
                  label={q.priority === 'high' ? `Unmark important: ${q.text}` : `Mark important: ${q.text}`}
                  pressed={q.priority === 'high'}
                  onClick={() => patch(q.id, { priority: q.priority === 'high' ? 'normal' : 'high' })}
                >
                  <Star className={`size-4 ${q.priority === 'high' ? 'fill-teal text-teal' : ''}`} />
                </IconButton>
                <span className="hidden sm:contents">
                  <IconButton label={`Move up: ${q.text}`} disabled={index === 0} onClick={() => move(index, -1)}>
                    <ArrowUp className="size-4" />
                  </IconButton>
                  <IconButton
                    label={`Move down: ${q.text}`}
                    disabled={index === questions.length - 1}
                    onClick={() => move(index, 1)}
                  >
                    <ArrowDown className="size-4" />
                  </IconButton>
                </span>
                <IconButton label={`Edit: ${q.text}`} onClick={() => (setEditing(q.id), setEditText(q.text))}>
                  <Pencil className="size-4" />
                </IconButton>
                <IconButton
                  label={`Delete: ${q.text}`}
                  danger
                  onClick={() => onChange(questions.filter((x) => x.id !== q.id))}
                >
                  <Trash2 className="size-4" />
                </IconButton>
              </div>
            </div>
          </li>
        ))}
      </ol>
      <div className="no-print mt-3 flex gap-2">
        <label htmlFor="new-question" className="sr-only">
          Add a question
        </label>
        <input
          id="new-question"
          value={draft}
          maxLength={LIMITS.question}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              add()
            }
          }}
          placeholder="Add another question"
          className="input"
        />
        <button type="button" className="btn btn-secondary shrink-0" onClick={add} disabled={!draft.trim()}>
          <Plus className="size-5" aria-hidden="true" /> Add
        </button>
      </div>
    </>
  )
}

function IconButton({
  label,
  onClick,
  children,
  disabled,
  pressed,
  danger,
}: {
  label: string
  onClick: () => void
  children: React.ReactNode
  disabled?: boolean
  pressed?: boolean
  danger?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      aria-pressed={pressed}
      title={label.split(':')[0]}
      className={`grid size-9 place-items-center rounded-lg text-ink-soft hover:bg-sunken disabled:opacity-30 ${
        danger ? 'hover:text-danger' : 'hover:text-ink'
      }`}
    >
      {children}
    </button>
  )
}
