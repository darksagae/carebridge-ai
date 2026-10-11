'use client'

import { Check, Plus, Siren, Star, Trash2, TriangleAlert, X } from 'lucide-react'
import { useState } from 'react'
import { FREQUENCIES, GOALS, LIMITS, VISIT_TYPES, type Intake, type Medication, type Symptom } from '@/lib/intake'
import { checkSafety } from '@/lib/safety'

type StepProps = { intake: Intake; set: (patch: Partial<Intake>) => void }

const newId = () => Math.random().toString(36).slice(2, 10)

export function StepHeading({
  title,
  intro,
  headingRef,
}: {
  title: string
  intro: string
  headingRef: React.Ref<HTMLHeadingElement>
}) {
  return (
    <div className="mb-8">
      <h2 ref={headingRef} tabIndex={-1} className="font-serif text-3xl font-semibold tracking-tight sm:text-4xl">
        {title}
      </h2>
      <p className="mt-2 text-ink-soft">{intro}</p>
    </div>
  )
}

export function VisitStep({ intake, set }: StepProps) {
  return (
    <div className="space-y-8">
      <fieldset>
        <legend className="label">What is the visit for?</legend>
        <div className="grid gap-3 sm:grid-cols-2">
          {VISIT_TYPES.map((type) => {
            const checked = intake.visitType === type.id
            return (
              <label
                key={type.id}
                className={`flex cursor-pointer items-center gap-3 rounded-2xl border-2 px-4 py-3.5 font-bold transition-colors has-focus-visible:outline-3 has-focus-visible:outline-brand ${
                  checked ? 'border-brand bg-brand-soft' : 'border-line hover:border-line-strong'
                }`}
              >
                <input
                  type="radio"
                  name="visitType"
                  className="sr-only"
                  checked={checked}
                  onChange={() => set({ visitType: type.id })}
                />
                <span
                  className={`grid size-6 shrink-0 place-items-center rounded-full border-2 ${checked ? 'border-brand bg-brand text-on-brand' : 'border-line-strong'}`}
                  aria-hidden="true"
                >
                  {checked && <Check className="size-3.5" strokeWidth={3.5} />}
                </span>
                {type.label}
              </label>
            )
          })}
        </div>
      </fieldset>
      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="visitDate" className="label">
            When is it? <span className="font-normal text-ink-soft">Optional</span>
          </label>
          <input
            id="visitDate"
            type="date"
            value={intake.visitDate}
            onChange={(e) => set({ visitDate: e.target.value })}
            className="input"
          />
        </div>
        <div>
          <label htmlFor="clinician" className="label">
            Who are you seeing? <span className="font-normal text-ink-soft">Optional</span>
          </label>
          <input
            id="clinician"
            value={intake.clinician}
            maxLength={LIMITS.short}
            onChange={(e) => set({ clinician: e.target.value })}
            className="input"
            placeholder="e.g. GP, nurse, dermatology clinic"
          />
        </div>
      </div>
    </div>
  )
}

export function SafetyBanner({ intake }: { intake: Pick<Intake, 'concern' | 'symptoms'> }) {
  const { emergency, severe } = checkSafety(intake)
  if (emergency.length) {
    return (
      <div role="alert" className="flex gap-4 rounded-3xl border-2 border-danger/40 bg-danger-soft p-5">
        <Siren className="mt-0.5 size-6 shrink-0 text-danger" aria-hidden="true" />
        <div>
          <p className="font-bold text-danger">Don’t wait for your appointment if this is happening now</p>
          <p className="mt-1 text-ink">
            You mentioned {emergency.map((e) => e.label).join(', ')}. These can be signs of a medical emergency. If it
            is happening now or getting worse, call your local emergency number or go to the nearest emergency
            department.
          </p>
        </div>
      </div>
    )
  }
  if (severe) {
    return (
      <div role="status" className="flex gap-4 rounded-3xl bg-amber-soft p-5">
        <TriangleAlert className="mt-0.5 size-6 shrink-0 text-amber-ink" aria-hidden="true" />
        <p>
          You rated something 9 or 10 out of 10. If it is getting worse, contact a clinician sooner rather than waiting
          for this appointment.
        </p>
      </div>
    )
  }
  return null
}

export function ConcernStep({ intake, set, errors }: StepProps & { errors: Record<string, string> }) {
  const update = (id: string, patch: Partial<Symptom>) =>
    set({ symptoms: intake.symptoms.map((s) => (s.id === id ? { ...s, ...patch } : s)) })
  return (
    <div className="space-y-8">
      <div>
        <label htmlFor="concern" className="label">
          What is your main concern?
        </label>
        <textarea
          id="concern"
          rows={5}
          value={intake.concern}
          maxLength={LIMITS.concern}
          onChange={(e) => set({ concern: e.target.value })}
          aria-invalid={errors.concern ? true : undefined}
          aria-describedby="concern-help"
          className="input min-h-36 resize-y aria-invalid:border-danger"
          placeholder="In your own words — what’s been happening and what worries you about it?"
        />
        <p id="concern-help" className="hint mt-2 flex justify-between gap-4">
          <span className={errors.concern ? 'font-bold text-danger' : ''}>
            {errors.concern ?? 'Please leave out your name, ID numbers and contact details.'}
          </span>
          <span>
            {intake.concern.length}/{LIMITS.concern}
          </span>
        </p>
      </div>

      <SafetyBanner intake={intake} />

      <fieldset>
        <legend className="label">
          Symptoms <span className="font-normal text-ink-soft">Optional · up to {LIMITS.symptoms}</span>
        </legend>
        <p className="hint -mt-1 mb-4">Add each symptom so you can describe when it started, how often and how bad.</p>
        <ul className="space-y-4">
          {intake.symptoms.map((symptom, index) => (
            <li key={symptom.id} className="relative rounded-3xl border-2 border-line p-4 sm:p-5">
              <div>
                <div className="grid gap-4 sm:grid-cols-2 sm:pr-12">
                  <div>
                    <label htmlFor={`s-name-${symptom.id}`} className="label text-sm">
                      Symptom {index + 1}
                    </label>
                    <input
                      id={`s-name-${symptom.id}`}
                      value={symptom.name}
                      maxLength={LIMITS.short}
                      onChange={(e) => update(symptom.id, { name: e.target.value })}
                      aria-invalid={errors[`symptom-${symptom.id}`] ? true : undefined}
                      className="input aria-invalid:border-danger"
                      placeholder="e.g. Headache"
                    />
                  </div>
                  <div>
                    <label htmlFor={`s-start-${symptom.id}`} className="label text-sm">
                      When did it start?
                    </label>
                    <input
                      id={`s-start-${symptom.id}`}
                      value={symptom.started}
                      maxLength={LIMITS.short}
                      onChange={(e) => update(symptom.id, { started: e.target.value })}
                      className="input"
                      placeholder="e.g. 2 weeks ago"
                    />
                  </div>
                  <div>
                    <label htmlFor={`s-freq-${symptom.id}`} className="label text-sm">
                      How often?
                    </label>
                    <select
                      id={`s-freq-${symptom.id}`}
                      value={symptom.frequency}
                      onChange={(e) => update(symptom.id, { frequency: e.target.value as Symptom['frequency'] })}
                      className="input"
                    >
                      {FREQUENCIES.map((f) => (
                        <option key={f.id} value={f.id}>
                          {f.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor={`s-sev-${symptom.id}`} className="label flex justify-between text-sm">
                      How bad, at its worst? <span className="text-brand-strong">{symptom.severity}/10</span>
                    </label>
                    <input
                      id={`s-sev-${symptom.id}`}
                      type="range"
                      min={0}
                      max={10}
                      value={symptom.severity}
                      onChange={(e) => update(symptom.id, { severity: Number(e.target.value) })}
                      aria-valuetext={`${symptom.severity} out of 10`}
                      className="mt-3 w-full accent-brand"
                    />
                    <div className="flex justify-between text-xs text-ink-soft" aria-hidden="true">
                      <span>Mild</span>
                      <span>Worst ever</span>
                    </div>
                  </div>
                  <div className="sm:col-span-2">
                    <label htmlFor={`s-notes-${symptom.id}`} className="label text-sm">
                      Anything that makes it better or worse?{' '}
                      <span className="font-normal text-ink-soft">Optional</span>
                    </label>
                    <input
                      id={`s-notes-${symptom.id}`}
                      value={symptom.notes}
                      maxLength={LIMITS.note}
                      onChange={(e) => update(symptom.id, { notes: e.target.value })}
                      className="input"
                      placeholder="e.g. Worse after long days at a screen"
                    />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => set({ symptoms: intake.symptoms.filter((s) => s.id !== symptom.id) })}
                  className="absolute top-2 right-2 grid size-9 place-items-center rounded-xl text-ink-soft hover:bg-danger-soft hover:text-danger sm:top-3 sm:right-3 sm:size-10"
                  aria-label={`Remove symptom ${index + 1}`}
                >
                  <Trash2 className="size-5" aria-hidden="true" />
                </button>
              </div>
              {errors[`symptom-${symptom.id}`] && (
                <p className="mt-2 text-sm font-bold text-danger">{errors[`symptom-${symptom.id}`]}</p>
              )}
            </li>
          ))}
        </ul>
        {intake.symptoms.length < LIMITS.symptoms && (
          <button
            type="button"
            className="btn btn-secondary mt-4"
            onClick={() =>
              set({
                symptoms: [
                  ...intake.symptoms,
                  { id: newId(), name: '', started: '', frequency: 'daily', severity: 5, notes: '' },
                ],
              })
            }
          >
            <Plus className="size-5" aria-hidden="true" /> Add a symptom
          </button>
        )}
      </fieldset>
    </div>
  )
}

export function MedicinesStep({ intake, set, errors }: StepProps & { errors: Record<string, string> }) {
  const update = (id: string, patch: Partial<Medication>) =>
    set({ medications: intake.medications.map((m) => (m.id === id ? { ...m, ...patch } : m)) })
  return (
    <div className="space-y-8">
      <fieldset>
        <legend className="label">
          Medicines you take <span className="font-normal text-ink-soft">Include supplements and remedies</span>
        </legend>
        {intake.medications.length > 0 && (
          <ul className="space-y-3">
            {intake.medications.map((med, index) => (
              <li key={med.id} className="flex items-end gap-2 rounded-2xl bg-sunken p-3 sm:gap-3">
                <div className="grid flex-1 gap-2 sm:grid-cols-[2fr_1fr_1.2fr]">
                  <div>
                    <label htmlFor={`m-name-${med.id}`} className="mb-1 block text-sm font-bold">
                      Medicine {index + 1}
                    </label>
                    <input
                      id={`m-name-${med.id}`}
                      value={med.name}
                      maxLength={LIMITS.short}
                      onChange={(e) => update(med.id, { name: e.target.value })}
                      aria-invalid={errors[`med-${med.id}`] ? true : undefined}
                      className="input aria-invalid:border-danger"
                      placeholder="Name"
                    />
                  </div>
                  <div>
                    <label htmlFor={`m-dose-${med.id}`} className="mb-1 block text-sm font-bold">
                      Dose
                    </label>
                    <input
                      id={`m-dose-${med.id}`}
                      value={med.dose}
                      maxLength={LIMITS.short}
                      onChange={(e) => update(med.id, { dose: e.target.value })}
                      className="input"
                      placeholder="e.g. 500 mg"
                    />
                  </div>
                  <div>
                    <label htmlFor={`m-freq-${med.id}`} className="mb-1 block text-sm font-bold">
                      How often
                    </label>
                    <input
                      id={`m-freq-${med.id}`}
                      value={med.frequency}
                      maxLength={LIMITS.short}
                      onChange={(e) => update(med.id, { frequency: e.target.value })}
                      className="input"
                      placeholder="e.g. twice a day"
                    />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => set({ medications: intake.medications.filter((m) => m.id !== med.id) })}
                  className="grid size-12 shrink-0 place-items-center rounded-xl text-ink-soft hover:bg-danger-soft hover:text-danger"
                  aria-label={`Remove medicine ${index + 1}`}
                >
                  <Trash2 className="size-5" aria-hidden="true" />
                </button>
              </li>
            ))}
          </ul>
        )}
        {errors.medications && <p className="mt-2 text-sm font-bold text-danger">{errors.medications}</p>}
        {intake.medications.length < LIMITS.medications && (
          <button
            type="button"
            className="btn btn-secondary mt-4"
            onClick={() =>
              set({ medications: [...intake.medications, { id: newId(), name: '', dose: '', frequency: '' }] })
            }
          >
            <Plus className="size-5" aria-hidden="true" /> Add a medicine
          </button>
        )}
        {intake.medications.length === 0 && <p className="hint mt-3">Not taking anything? Just continue.</p>}
      </fieldset>
      <div>
        <label htmlFor="allergies" className="label">
          Allergies <span className="font-normal text-ink-soft">Optional</span>
        </label>
        <input
          id="allergies"
          value={intake.allergies}
          maxLength={LIMITS.allergies}
          onChange={(e) => set({ allergies: e.target.value })}
          className="input"
          placeholder="e.g. Penicillin — rash"
        />
      </div>
    </div>
  )
}

export function GoalsStep({ intake, set }: StepProps) {
  const [draft, setDraft] = useState('')
  const add = () => {
    const text = draft.trim()
    if (!text || intake.questions.length >= LIMITS.questions) return
    set({ questions: [...intake.questions, text.slice(0, LIMITS.question)] })
    setDraft('')
  }
  return (
    <div className="space-y-8">
      <fieldset>
        <legend className="label">What would you like from this visit?</legend>
        <p className="hint -mt-1 mb-4">Choose any that apply.</p>
        <div className="flex flex-wrap gap-2">
          {GOALS.map((goal) => {
            const checked = intake.goals.includes(goal.id)
            return (
              <label
                key={goal.id}
                className={`flex cursor-pointer items-center gap-2 rounded-full border-2 px-4 py-2 font-bold transition-colors has-focus-visible:outline-3 has-focus-visible:outline-brand ${
                  checked ? 'border-brand bg-brand text-on-brand' : 'border-line-strong hover:border-brand'
                }`}
              >
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={checked}
                  onChange={() =>
                    set({ goals: checked ? intake.goals.filter((g) => g !== goal.id) : [...intake.goals, goal.id] })
                  }
                />
                {checked && <Check className="size-4" strokeWidth={3} aria-hidden="true" />}
                {goal.label}
              </label>
            )
          })}
        </div>
      </fieldset>

      <div>
        <label htmlFor="own-question" className="label">
          Questions you already want to ask <span className="font-normal text-ink-soft">Optional</span>
        </label>
        <p className="hint -mt-1 mb-3">These go to the top of your list, marked important.</p>
        <div className="flex gap-2">
          <input
            id="own-question"
            value={draft}
            maxLength={LIMITS.question}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                add()
              }
            }}
            className="input"
            placeholder="e.g. Could my new tablets be causing this?"
          />
          <button
            type="button"
            className="btn btn-secondary shrink-0"
            onClick={add}
            disabled={!draft.trim() || intake.questions.length >= LIMITS.questions}
          >
            <Plus className="size-5" aria-hidden="true" /> Add
          </button>
        </div>
        {intake.questions.length > 0 && (
          <ul className="mt-4 space-y-2">
            {intake.questions.map((question, index) => (
              <li key={`${question}-${index}`} className="flex items-center gap-3 rounded-2xl bg-sunken px-4 py-3">
                <Star className="size-4 shrink-0 fill-brand text-brand" aria-hidden="true" />
                <span className="flex-1">{question}</span>
                <button
                  type="button"
                  onClick={() => set({ questions: intake.questions.filter((_, i) => i !== index) })}
                  className="grid size-9 shrink-0 place-items-center rounded-lg text-ink-soft hover:text-danger"
                  aria-label={`Remove question: ${question}`}
                >
                  <X className="size-4" aria-hidden="true" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
