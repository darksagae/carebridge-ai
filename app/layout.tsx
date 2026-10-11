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
  themeColor: '#ffffff',
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  await connection() // per-request rendering so the CSP nonce reaches every script
  return (
    <html lang="en">
      <body className="flex min-h-dvh flex-col">
        <a
          href="#main"
          className="sr-only z-50 rounded-xl bg-brand px-4 py-2 text-on-brand focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
        >
          Skip to content
        </a>
        <header className="no-print border-b border-line bg-canvas/90 backdrop-blur">
          <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
            <Link href="/" className="rounded-xl" aria-label="CareBridge home">
              <Logo />
            </Link>
          </div>
        </header>
        <main id="main" className="flex-1">
          {children}
        </main>
        <footer className="no-print border-t border-line">
          <p className="mx-auto max-w-6xl px-4 py-5 text-sm text-ink-soft sm:px-6">
            <strong className="text-ink">Not for emergencies</strong> — call your local emergency number. CareBridge
            does not diagnose or give medical advice. Your notes stay in this browser.
          </p>
        </footer>
      </body>
    </html>
  )
}
