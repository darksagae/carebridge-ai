import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl px-4 py-24 text-center sm:px-6">
      <p className="font-serif text-7xl font-semibold text-teal">404</p>
      <h1 className="mt-4 font-serif text-3xl font-semibold">This page doesn’t exist</h1>
      <p className="mt-3 text-ink-soft">The link may be broken, or the page may have moved.</p>
      <Link href="/" className="btn btn-primary mt-8">
        Back to home
      </Link>
    </div>
  )
}
