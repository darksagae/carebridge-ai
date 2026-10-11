// What the person tells us about their visit. Shared by browser and server.
import { z } from 'zod'

export const VISIT_TYPES = [
  { id: 'new_problem', label: 'A new problem', phrase: 'about a new health concern' },
  { id: 'follow_up', label: 'A follow-up', phrase: 'for a follow-up visit' },
  { id: 'test_results', label: 'Test results', phrase: 'to discuss test results' },
  { id: 'chronic_review', label: 'Ongoing condition review', phrase: 'for a review of an ongoing condition' },
  { id: 'specialist', label: 'Specialist appointment', phrase: 'for a specialist appointment' },
  { id: 'other', label: 'Something else', phrase: 'for an appointment' },
] as const
export type VisitType = (typeof VISIT_TYPES)[number]['id']

export const FREQUENCIES = [
  { id: 'constant', label: 'All the time' },
  { id: 'daily', label: 'Every day' },
  { id: 'weekly', label: 'A few times a week' },
  { id: 'occasional', label: 'Now and then' },
] as const
export type Frequency = (typeof FREQUENCIES)[number]['id']

export const GOALS = [
  { id: 'understand_cause', label: 'Understand what’s causing it' },
  { id: 'treatment_options', label: 'Hear my treatment options' },
  { id: 'medication_review', label: 'Review my medicines' },
  { id: 'test_results', label: 'Understand my results' },
  { id: 'referral', label: 'Ask about a referral' },
  { id: 'sick_note', label: 'Get a note for work or school' },
  { id: 'reassurance', label: 'Know whether to worry' },
] as const
export type Goal = (typeof GOALS)[number]['id']

export const LIMITS = {
  concern: 1000,
  symptoms: 8,
  medications: 15,
  questions: 10,
  short: 80,
  note: 200,
  allergies: 300,
  question: 200,
} as const

const ids = <T extends readonly { id: string }[]>(list: T) =>
  list.map((item) => item.id) as [T[number]['id'], ...T[number]['id'][]]
const short = (max: number = LIMITS.short) => z.string().trim().max(max)

export const symptomSchema = z.object({
  id: z.string().max(40),
  name: short().min(1, 'Name each symptom.'),
  started: short().default(''),
  frequency: z.enum(ids(FREQUENCIES)).default('occasional'),
  severity: z.number().int().min(0).max(10).default(5),
  notes: short(LIMITS.note).default(''),
})

export const medicationSchema = z.object({
  id: z.string().max(40),
  name: short().min(1, 'Name each medicine.'),
  dose: short().default(''),
  frequency: short().default(''),
})

export const intakeSchema = z.object({
  visitType: z.enum(ids(VISIT_TYPES), { error: 'Choose what the visit is for.' }),
  visitDate: z
    .string()
    .regex(/^(\d{4}-\d{2}-\d{2})?$/, 'Use a valid date.')
    .default(''),
  clinician: short().default(''),
  concern: z
    .string()
    .trim()
    .min(10, 'Describe your main concern in at least 10 characters.')
    .max(LIMITS.concern, `Keep your main concern under ${LIMITS.concern} characters.`),
  symptoms: z.array(symptomSchema).max(LIMITS.symptoms).default([]),
  medications: z.array(medicationSchema).max(LIMITS.medications).default([]),
  allergies: short(LIMITS.allergies).default(''),
  goals: z
    .array(z.enum(ids(GOALS)))
    .max(GOALS.length)
    .default([]),
  questions: z.array(short(LIMITS.question).min(1)).max(LIMITS.questions).default([]),
})

export type Intake = z.infer<typeof intakeSchema>
export type Symptom = Intake['symptoms'][number]
export type Medication = Intake['medications'][number]

export const EMPTY_INTAKE: Intake = {
  visitType: 'new_problem',
  visitDate: '',
  clinician: '',
  concern: '',
  symptoms: [],
  medications: [],
  allergies: '',
  goals: [],
  questions: [],
}

export const visitPhrase = (type: VisitType) => VISIT_TYPES.find((v) => v.id === type)?.phrase ?? 'for an appointment'
export const visitLabel = (type: VisitType) => VISIT_TYPES.find((v) => v.id === type)?.label ?? 'Appointment'
export const frequencyLabel = (id: Frequency) => FREQUENCIES.find((f) => f.id === id)?.label ?? ''
