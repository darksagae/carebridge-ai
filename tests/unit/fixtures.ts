import { intakeSchema, type Intake } from '@/lib/intake'

export const intake: Intake = intakeSchema.parse({
  visitType: 'new_problem',
  concern: 'Fictional: headaches most afternoons for the last two weeks.',
  symptoms: [
    {
      id: 's1',
      name: 'Headache',
      started: '2 weeks ago',
      frequency: 'daily',
      severity: 6,
      notes: 'Worse after screens',
    },
    { id: 's2', name: 'Tiredness', started: 'a month ago', frequency: 'constant', severity: 4, notes: '' },
  ],
  medications: [
    { id: 'm1', name: 'Paracetamol', dose: '500 mg', frequency: 'as needed' },
    { id: 'm2', name: 'Vitamin D', dose: '', frequency: 'daily' },
  ],
  allergies: 'Penicillin',
  goals: ['understand_cause', 'medication_review'],
  questions: ['Could my screen time be causing this?'],
})
