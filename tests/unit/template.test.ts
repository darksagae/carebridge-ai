import { describe, expect, it } from 'vitest'
import { intakeSchema } from '@/lib/intake'
import { checkSafety } from '@/lib/safety'
import { templateBrief } from '@/lib/template'
import { intake } from './fixtures'

describe('template brief', () => {
  it('summarises in the first person using only what was given', () => {
    const brief = templateBrief(intake)
    expect(brief.source).toBe('template')
    expect(brief.summary).toMatch(/^I’m coming in about a new health concern\./)
    expect(brief.summary).toContain('headache (6/10)')
    expect(brief.summary).toContain('I take 2 medicines')
    expect(brief.tell).toContain('Headache — started 2 weeks ago, every day, 6/10. Worse after screens.')
    expect(brief.tell.some((line) => line.includes('Penicillin'))).toBe(true)
  })

  it('puts the person’s own questions first and adds relevant ones without duplicates', () => {
    const brief = templateBrief(intake)
    expect(brief.questions[0]).toMatchObject({ text: 'Could my screen time be causing this?', priority: 'high' })
    const texts = brief.questions.map((q) => q.text)
    expect(texts).toContain('Can we go through my medicines to check they are all still needed?')
    expect(texts.some((t) => t.includes('interact'))).toBe(true)
    expect(new Set(texts).size).toBe(texts.length)
    expect(brief.questions.length).toBeLessThanOrEqual(12)
    expect(new Set(brief.questions.map((q) => q.id)).size).toBe(brief.questions.length)
  })

  it('tailors what to bring to the visit type', () => {
    const results = templateBrief({ ...intake, visitType: 'test_results', goals: ['test_results'] })
    expect(results.summary).toMatch(/^I’m coming in to discuss test results\./)
    expect(results.questions.map((q) => q.text)).not.toContain('Can you explain my results and what they mean for me?')
    expect(results.bring).toContain('Any letters or results you have received')
    expect(results.questions.map((q) => q.text)).toContain('What do my results mean, in plain words?')
  })
})

describe('intake validation', () => {
  it('requires a real concern and caps list sizes', () => {
    expect(intakeSchema.safeParse({ visitType: 'follow_up', concern: 'short' }).success).toBe(false)
    expect(
      intakeSchema.safeParse({
        visitType: 'follow_up',
        concern: 'A long enough concern',
        questions: Array(11).fill('q?'),
      }).success,
    ).toBe(false)
    expect(intakeSchema.safeParse({ visitType: 'nope', concern: 'A long enough concern' }).success).toBe(false)
  })
})

describe('safety check', () => {
  const check = (concern: string, severity = 3) =>
    checkSafety({
      concern,
      symptoms: [{ id: 'x', name: 'Pain', started: '', frequency: 'daily', severity, notes: '' }],
    })

  it('flags words that can describe an emergency', () => {
    expect(check('I get chest pain when I climb stairs').emergency.map((e) => e.id)).toEqual(['chest'])
    expect(check("Sometimes I can't breathe at night").emergency.map((e) => e.id)).toEqual(['breathing'])
    expect(check('I have been having thoughts of suicide').emergency.map((e) => e.id)).toEqual(['self_harm'])
    expect(check('I fainted twice this week').emergency.map((e) => e.id)).toEqual(['consciousness'])
  })

  it('stays quiet for everyday wording', () => {
    expect(check('A faint rash on my arm and a sore knee').emergency).toEqual([])
    expect(check('Follow-up for my blood pressure readings').emergency).toEqual([])
  })

  it('notices very severe ratings', () => {
    expect(check('Back ache', 9).severe).toBe(true)
    expect(check('Back ache', 8).severe).toBe(false)
  })
})
