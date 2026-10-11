// Builds a visit brief entirely in the browser, with no AI and no network.
// Question wording is neutral and never suggests a diagnosis or treatment.
import { questionId, type Brief, type BriefQuestion } from './brief'
import { frequencyLabel, visitPhrase, type Goal, type Intake, type VisitType } from './intake'

const BY_VISIT: Record<VisitType, string[]> = {
  new_problem: [
    'What do you think could be causing this?',
    'Do I need any tests, and what will they tell us?',
    'What can I do at home to help, and what should I avoid?',
    'Which symptoms mean I should come back sooner or get urgent care?',
  ],
  follow_up: [
    'Is this improving the way you expected?',
    'Should anything about my treatment or care plan change?',
    'When should my next check-up be?',
  ],
  test_results: [
    'What do my results mean, in plain words?',
    'Is anything outside the normal range, and why might that be?',
    'Do I need any more tests or a repeat test?',
    'Can I have a copy of my results?',
  ],
  chronic_review: [
    'How well is my condition controlled right now?',
    'What should I aim for before my next review?',
    'Which warning signs mean I should contact you before then?',
  ],
  specialist: [
    'What is your view of what is going on?',
    'What are my options, and the pros and cons of each?',
    'What happens next, and who will contact me?',
  ],
  other: ['What should I know or do after today?', 'Who do I contact if I have questions later?'],
}

const BY_GOAL: Record<Goal, string> = {
  understand_cause: 'What is the most likely cause, and what else could it be?',
  treatment_options: 'What are my options, including waiting and watching?',
  medication_review: 'Can we go through my medicines to check they are all still needed?',
  test_results: 'Can you explain my results and what they mean for me?',
  referral: 'Do I need to see a specialist, and how long might that take?',
  sick_note: 'Can I have a note for work or school?',
  reassurance: 'Is there anything here I should be worried about?',
}

const clip = (text: string, max: number) => (text.length > max ? `${text.slice(0, max - 1).trimEnd()}…` : text)
const sentence = (text: string) => {
  const trimmed = text.trim().replace(/\s+/g, ' ')
  return /[.!?]$/.test(trimmed) ? trimmed : `${trimmed}.`
}

export function describeSymptom(s: Intake['symptoms'][number]) {
  const parts = [s.started && `started ${s.started}`, frequencyLabel(s.frequency).toLowerCase(), `${s.severity}/10`]
  return `${s.name} — ${parts.filter(Boolean).join(', ')}${s.notes ? `. ${sentence(s.notes)}` : ''}`
}

export function templateBrief(intake: Intake, now = new Date()): Brief {
  const summary = [
    `I’m coming in ${visitPhrase(intake.visitType)}.`,
    `My main concern: ${sentence(clip(intake.concern, 400))}`,
    intake.symptoms.length
      ? `The symptom${intake.symptoms.length > 1 ? 's' : ''} bothering me most: ${intake.symptoms
          .slice()
          .sort((a, b) => b.severity - a.severity)
          .slice(0, 3)
          .map((s) => `${s.name.toLowerCase()} (${s.severity}/10)`)
          .join(', ')}.`
      : '',
    intake.medications.length
      ? `I take ${intake.medications.length} medicine${intake.medications.length > 1 ? 's' : ''}.`
      : '',
  ]
    .filter(Boolean)
    .join(' ')

  const tell = [
    ...intake.symptoms.map(describeSymptom),
    intake.allergies ? `Allergies: ${intake.allergies}` : '',
    intake.medications.length
      ? `Medicines: ${intake.medications.map((m) => [m.name, m.dose, m.frequency].filter(Boolean).join(' ')).join('; ')}`
      : '',
  ]
    .filter(Boolean)
    .slice(0, 10)
    .map((line) => clip(line, 240))

  const seen = new Set<string>()
  const questions: BriefQuestion[] = []
  const add = (text: string, priority: 'high' | 'normal') => {
    const key = text.toLowerCase().replace(/\W/g, '')
    if (!text.trim() || seen.has(key) || questions.length >= 12) return
    seen.add(key)
    questions.push({ id: questionId(), text: clip(text.trim(), 240), priority })
  }
  intake.questions.forEach((q) => add(q, 'high'))
  intake.goals
    // A results visit already asks about results, so skip the near-duplicate.
    .filter((goal) => !(goal === 'test_results' && intake.visitType === 'test_results'))
    .forEach((goal) => add(BY_GOAL[goal], 'normal'))
  BY_VISIT[intake.visitType].forEach((q) => add(q, 'normal'))
  if (intake.medications.length >= 2)
    add('Could any of my medicines interact, or cause side effects I’m noticing?', 'normal')
  if (intake.symptoms.length) add('Which symptoms mean I should come back sooner or get urgent care?', 'normal')

  const bring = [
    intake.medications.length ? 'Your medicines or their packets, with doses' : '',
    intake.visitType === 'test_results' ? 'Any letters or results you have received' : '',
    intake.visitType === 'specialist' ? 'Your referral letter' : '',
    intake.symptoms.length ? 'Photos or notes of symptoms that come and go' : '',
    'This brief, printed or on your phone',
    'Someone you trust, if you would like support',
  ].filter(Boolean)

  return { summary, tell, questions, bring, source: 'template', createdAt: now.toISOString() }
}
