import type { Brief } from './brief'
import { visitLabel, type Intake } from './intake'

export function formatDate(iso: string) {
  if (!iso) return ''
  const date = new Date(/^\d{4}-\d{2}-\d{2}$/.test(iso) ? `${iso}T12:00:00` : iso)
  return new Intl.DateTimeFormat(undefined, { dateStyle: 'long' }).format(date)
}

/** Plain-text version of the brief, including any answers noted during the visit. */
export function briefText(intake: Intake, brief: Brief) {
  const lines = [
    `VISIT BRIEF — ${visitLabel(intake.visitType).toUpperCase()}`,
    [intake.visitDate && formatDate(intake.visitDate), intake.clinician].filter(Boolean).join(' · '),
    '',
    'IN SHORT',
    brief.summary,
    '',
  ]
  if (brief.tell.length) lines.push('TELL THE CLINICIAN', ...brief.tell.map((t) => `• ${t}`), '')
  if (intake.medications.length || intake.allergies) {
    lines.push('MEDICINES AND ALLERGIES')
    lines.push(...intake.medications.map((m) => `• ${[m.name, m.dose, m.frequency].filter(Boolean).join(' — ')}`))
    if (intake.allergies) lines.push(`• Allergies: ${intake.allergies}`)
    lines.push('')
  }
  lines.push('MY QUESTIONS')
  brief.questions.forEach((q, index) => {
    lines.push(`${q.asked ? '[x]' : '[ ]'} ${index + 1}. ${q.text}${q.priority === 'high' ? ' (important)' : ''}`)
    if (q.answer?.trim()) lines.push(`    Answer: ${q.answer.trim()}`)
  })
  if (brief.bring.length) lines.push('', 'BRING WITH ME', ...brief.bring.map((b) => `• ${b}`))
  lines.push(
    '',
    `Prepared with CareBridge on ${formatDate(brief.createdAt)}${brief.source === 'ai' ? ' (AI-assisted draft — check it)' : ''}.`,
    'Not medical advice.',
  )
  return lines.filter((line, i, all) => !(line === '' && all[i - 1] === '')).join('\n')
}
