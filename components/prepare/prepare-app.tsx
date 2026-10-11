'use client'

import { ArrowLeft, ArrowRight, Check, HardDrive, Trash2 } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import type { Brief } from '@/lib/brief'
import { visitLabel, type Intake } from '@/lib/intake'
import { BriefView } from './brief-view'
import { GenerateStep } from './generate'
import { ConcernStep, GoalsStep, MedicinesStep, StepHeading, VisitStep } from './steps'
import { usePreparation } from './use-preparation'
import { VisitMode } from './visit-mode'

const STEPS = [
  { title: 'About your visit', intro: 'A little context helps you and your clinician focus.' },
  { title: 'What’s going on', intro: 'Describe what you want help with. Add symptoms one by one.' },
  { title: 'Medicines and allergies', intro: 'Clinicians nearly always ask. Having it written down saves time.' },
  { title: 'What you want from it', intro: 'Knowing your goals helps make sure they’re covered.' },
  { title: 'Create your brief', intro: 'Choose how to write it. You can edit everything afterwards.' },
] as const

const NAV = ['Visit', 'Concerns', 'Medicines', 'Goals', 'Brief']

function validate(step: number, intake: Intake): Record<string, string> {
  const errors: Record<string, string> = {}
  if (step === 1) {
    if (intake.concern.trim().length < 10) errors.concern = 'Describe your main concern in at least 10 characters.'
    for (const s of intake.symptoms)
      if (!s.name.trim()) errors[`symptom-${s.id}`] = 'Give this symptom a name, or remove it.'
  }
  if (step === 2 && intake.medications.some((m) => !m.name.trim())) {
    errors.medications = 'Give each medicine a name, or remove the empty row.'
    for (const m of intake.medications) if (!m.name.trim()) errors[`med-${m.id}`] = 'Required'
  }
  return errors
}

export function PrepareApp() {
  const { state, update, remember, setRemember, clear, loaded } = usePreparation()
  const [errors, setErrors] = useState<Record<string, string>>({})
  const heading = useRef<HTMLHeadingElement>(null)
  const firstRender = useRef(true)
  const { intake, brief, step, view } = state

  useEffect(() => {
    if (!loaded) return
    if (firstRender.current) {
      firstRender.current = false
      return
    }
    if (view === 'intake') heading.current?.focus()
    window.scrollTo({ top: 0 })
  }, [step, view, loaded])

  const set = (patch: Partial<Intake>) => {
    update((s) => ({ intake: { ...s.intake, ...patch } }))
    if (Object.keys(errors).length) setErrors({})
  }

  const goTo = (target: number) => {
    if (target > step) {
      for (let s = step; s < target; s++) {
        const problems = validate(s, intake)
        if (Object.keys(problems).length) {
          setErrors(problems)
          if (s !== step) update({ step: s })
          return
        }
      }
    }
    setErrors({})
    update({ step: target })
  }

  const setBrief = (next: Brief) => update({ brief: next, view: 'brief' })

  if (!loaded) {
    return <div className="card h-96 animate-pulse" aria-label="Loading" />
  }

  if (view !== 'intake' && brief) {
    return (
      <>
        <div className="no-print mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-sm font-bold tracking-[0.14em] text-brand-strong uppercase">Ready</p>
            <h1 className="font-serif text-4xl font-semibold tracking-tight">Your visit brief</h1>
          </div>
          <StorageToggle remember={remember} setRemember={setRemember} />
        </div>
        <BriefView
          intake={intake}
          brief={brief}
          onChange={(b) => update({ brief: b })}
          onVisit={() => update({ view: 'visit' })}
          onEdit={() => update({ view: 'intake', step: 0 })}
          onReset={clear}
        />
        {view === 'visit' && (
          <VisitMode brief={brief} onChange={(b) => update({ brief: b })} onClose={() => update({ view: 'brief' })} />
        )}
      </>
    )
  }

  return (
    <div className="grid items-start gap-8 lg:grid-cols-[1fr_18rem]">
      <div className="card p-6 sm:p-10">
        <div className="mb-8 lg:hidden">
          <div className="flex justify-between text-sm font-bold">
            <span>{NAV[step]}</span>
            <span className="text-ink-soft">
              Step {step + 1} of {STEPS.length}
            </span>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-sunken">
            <div
              className="h-full rounded-full bg-brand transition-[width] duration-300"
              style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
            />
          </div>
        </div>

        <StepHeading title={STEPS[step].title} intro={STEPS[step].intro} headingRef={heading} />

        {step === 0 && <VisitStep intake={intake} set={set} />}
        {step === 1 && <ConcernStep intake={intake} set={set} errors={errors} />}
        {step === 2 && <MedicinesStep intake={intake} set={set} errors={errors} />}
        {step === 3 && <GoalsStep intake={intake} set={set} />}
        {step === 4 && <GenerateStep intake={intake} onBrief={setBrief} />}

        <div className="mt-10 flex items-center justify-between gap-3 border-t border-line pt-6">
          {step > 0 ? (
            <button type="button" className="btn btn-ghost -ml-3" onClick={() => goTo(step - 1)}>
              <ArrowLeft className="size-5" aria-hidden="true" /> Back
            </button>
          ) : (
            <span />
          )}
          {step < STEPS.length - 1 && (
            <button type="button" className="btn btn-primary px-6" onClick={() => goTo(step + 1)}>
              Continue <ArrowRight className="size-5" aria-hidden="true" />
            </button>
          )}
          {step === STEPS.length - 1 && brief && (
            <button type="button" className="btn btn-secondary" onClick={() => update({ view: 'brief' })}>
              Back to my brief
            </button>
          )}
        </div>
      </div>

      <aside className="space-y-4 lg:sticky lg:top-6">
        <nav aria-label="Steps" className="card hidden p-3 lg:block">
          <ol className="space-y-1">
            {NAV.map((label, index) => {
              const status = index < step ? 'done' : index === step ? 'current' : 'todo'
              return (
                <li key={label}>
                  <button
                    type="button"
                    onClick={() => goTo(index)}
                    aria-current={status === 'current' ? 'step' : undefined}
                    className={`flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left font-bold transition-colors ${
                      status === 'current' ? 'bg-brand-soft text-brand-strong' : 'text-ink-soft hover:bg-sunken'
                    }`}
                  >
                    <span
                      className={`grid size-7 shrink-0 place-items-center rounded-full text-sm ${
                        status === 'done'
                          ? 'bg-brand text-on-brand'
                          : status === 'current'
                            ? 'border-2 border-brand'
                            : 'border-2 border-line-strong'
                      }`}
                    >
                      {status === 'done' ? <Check className="size-4" strokeWidth={3} aria-hidden="true" /> : index + 1}
                    </span>
                    {label}
                  </button>
                </li>
              )
            })}
          </ol>
        </nav>
        {intake.concern.trim().length >= 10 && (
          <div className="card hidden p-5 text-sm lg:block">
            <p className="font-bold">So far</p>
            <p className="mt-1 text-ink-soft">{visitLabel(intake.visitType)}</p>
            <p className="mt-2 line-clamp-3">{intake.concern}</p>
            <p className="mt-2 text-ink-soft">
              {intake.symptoms.length} symptoms · {intake.medications.length} medicines · {intake.questions.length} own
              questions
            </p>
          </div>
        )}
        <div className="card space-y-3 p-5">
          <StorageToggle remember={remember} setRemember={setRemember} />
          <button type="button" className="btn btn-ghost min-h-10 w-full text-sm text-danger" onClick={clear}>
            <Trash2 className="size-4" aria-hidden="true" /> Clear everything
          </button>
        </div>
      </aside>
    </div>
  )
}

function StorageToggle({ remember, setRemember }: { remember: boolean; setRemember: (value: boolean) => void }) {
  return (
    <label className="flex cursor-pointer items-start gap-3 text-sm">
      <input
        type="checkbox"
        checked={remember}
        onChange={(e) => setRemember(e.target.checked)}
        className="mt-0.5 size-5 shrink-0 accent-brand"
      />
      <span>
        <span className="flex items-center gap-1.5 font-bold">
          <HardDrive className="size-4" aria-hidden="true" /> Keep on this device
        </span>
        <span className="text-ink-soft">
          {remember ? 'Saved until you clear it. Avoid on shared devices.' : 'Off: cleared when you close this tab.'}
        </span>
      </span>
    </label>
  )
}
