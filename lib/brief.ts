import { z } from 'zod'

export const briefQuestionSchema = z.object({
  text: z.string().trim().min(3).max(240),
  priority: z.enum(['high', 'normal']).default('normal'),
})

export const briefSchema = z.object({
  summary: z.string().trim().min(10).max(900),
  tell: z.array(z.string().trim().min(2).max(240)).max(10),
  questions: z.array(briefQuestionSchema).min(1).max(12),
  bring: z.array(z.string().trim().min(2).max(160)).max(8),
})

export type BriefQuestion = z.infer<typeof briefQuestionSchema> & { id: string; asked?: boolean; answer?: string }

export type Brief = Omit<z.infer<typeof briefSchema>, 'questions'> & {
  questions: BriefQuestion[]
  source: 'ai' | 'template'
  model?: string
  createdAt: string
}

let counter = 0
export const questionId = () => `q${Date.now().toString(36)}${(counter++).toString(36)}`
