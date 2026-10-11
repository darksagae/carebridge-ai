export function LogoMark({ className = 'size-9' }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden="true">
      <rect width="40" height="40" rx="12" className="fill-brand" />
      <path
        d="M8 27c3-7 7.5-10.5 12-10.5S29 20 32 27"
        fill="none"
        className="stroke-on-brand"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path d="M13 21.5V27M20 16.5V27M27 21.5V27" className="stroke-on-brand" strokeWidth="2.4" strokeLinecap="round" />
      <path d="M8 27h24" className="stroke-on-brand" strokeWidth="3" strokeLinecap="round" />
    </svg>
  )
}

export function Logo() {
  return (
    <span className="flex items-center gap-2.5">
      <LogoMark />
      <span className="font-serif text-xl font-semibold tracking-tight">CareBridge</span>
    </span>
  )
}
