import { PrepareApp } from '@/components/prepare/prepare-app'

export default function Home() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 md:py-10 print:p-0">
      <h1 className="sr-only">Prepare for your appointment</h1>
      <PrepareApp />
    </div>
  )
}
