// Flags words that can describe a medical emergency so the app can point to
// urgent care. This is a cautious safety net, not triage or a diagnosis.
import type { Intake } from './intake'

const PATTERNS: { id: string; label: string; pattern: RegExp }[] = [
  { id: 'chest', label: 'chest pain or pressure', pattern: /\bchest\s+(pain|pressure|tight\w*)|\bheart\s+attack/i },
  {
    id: 'breathing',
    label: 'trouble breathing',
    pattern:
      /(can'?t|cannot|struggling to|hard to|difficult\w*|trouble)\s+(breath\w*)|short(ness)? of breath|breathless/i,
  },
  {
    id: 'stroke',
    label: 'signs of a stroke',
    pattern: /face\s+(droop\w*)|slurred\s+speech|(sudden|one[- ]sided)\s+(weakness|numbness)|\bstroke\b/i,
  },
  {
    id: 'self_harm',
    label: 'thoughts of self-harm or suicide',
    pattern: /suicid\w*|kill(ing)? myself|end my life|self[- ]?harm|want to die|hurt(ing)? myself/i,
  },
  {
    id: 'bleeding',
    label: 'heavy bleeding',
    pattern: /(heavy|severe|won'?t stop|uncontrolled)\s+bleed\w*|vomit\w* blood|coughing (up )?blood/i,
  },
  {
    id: 'consciousness',
    label: 'fainting or seizures',
    pattern: /faint(ed|ing)|feel(ing)? faint|passed out|unconscious|seizure|convuls\w*/i,
  },
  {
    id: 'allergy',
    label: 'a severe allergic reaction',
    pattern: /anaphyla\w*|(throat|tongue|lips?|face)\s+(is\s+|are\s+)?(swelling|swollen|closing)/i,
  },
]

export type SafetyCheck = { emergency: { id: string; label: string }[]; severe: boolean }

export function checkSafety(intake: Pick<Intake, 'concern' | 'symptoms'>): SafetyCheck {
  const text = [intake.concern, ...intake.symptoms.flatMap((s) => [s.name, s.notes])].join('\n')
  const emergency = PATTERNS.filter((p) => p.pattern.test(text)).map(({ id, label }) => ({ id, label }))
  return { emergency, severe: intake.symptoms.some((s) => s.severity >= 9) }
}
