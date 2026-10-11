import type { Metadata } from 'next'
import { PrepareApp } from '@/components/prepare/prepare-app'

export const metadata: Metadata = { title: 'Prepare for a visit' }

export default function PreparePage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 md:py-14 print:p-0">
      <h1 className="sr-only">Prepare for a visit</h1>
      <PrepareApp />
    </div>
  )
}
