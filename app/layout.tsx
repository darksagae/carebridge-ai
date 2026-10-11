import '@fontsource/atkinson-hyperlegible/400.css'
import '@fontsource/atkinson-hyperlegible/700.css'
import '@fontsource-variable/source-serif-4'
import './globals.css'
import type { Metadata, Viewport } from 'next'
import Link from 'next/link'
import { connection } from 'next/server'
import { Logo } from '@/components/logo'

export const metadata: Metadata = {
  title: { default: 'CareBridge · Walk into your appointment ready', template: '%s · CareBridge' },
  description:
    'Turn your worries and symptoms into a clear one-page brief and the right questions, so nothing gets forgotten at your appointment.',
  referrer: 'no-referrer',
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f4f7f9' },
    { media: '(prefers-color-scheme: dark)', color: '#0b141a' },
  ],
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  await connection() // per-request rendering so the CSP nonce reaches every script
  return (
    <html lang="en">
      <body className="flex min-h-dvh flex-col">
        <a
          href="#main"
          className="sr-only z-50 rounded-xl bg-teal px-4 py-2 text-on-teal focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
        >
          Skip to content
        </a>
        <header className="no-print border-b border-line bg-canvas/90 backdrop-blur">
          <div className="mx-auto flex h-18 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
            <Link href="/" className="rounded-xl" aria-label="CareBridge home">
              <Logo />
            </Link>
            <nav className="flex items-center gap-1">
              <Link href="/#how" className="btn btn-ghost hidden min-h-10 px-3 sm:inline-flex">
                How it works
              </Link>
              <Link href="/#privacy" className="btn btn-ghost hidden min-h-10 px-3 sm:inline-flex">
                Privacy
              </Link>
              <Link href="/prepare" className="btn btn-primary min-h-10 px-4">
                Prepare for a visit
              </Link>
            </nav>
          </div>
        </header>
        <main id="main" className="flex-1">
          {children}
        </main>
        <footer className="no-print border-t border-line">
          <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-8 text-sm text-ink-soft sm:px-6 md:flex-row md:justify-between">
            <p>
              <strong className="text-ink">Not for emergencies.</strong> If you think you need urgent help, call your
              local emergency number.
            </p>
            <p>CareBridge does not diagnose or give medical advice · Built for DSH Hacks V2</p>
          </div>
        </footer>
      </body>
    </html>
  )
}
