import {
  ArrowRight,
  ClipboardList,
  EyeOff,
  FileText,
  HardDrive,
  ListChecks,
  MessageCircleQuestion,
  NotebookPen,
  Printer,
  ShieldCheck,
  Sparkles,
  Trash2,
} from 'lucide-react'
import Link from 'next/link'

const STEPS = [
  {
    icon: ClipboardList,
    title: 'Answer a few questions',
    body: 'What the visit is for, what’s bothering you, your medicines and what you hope to get from it. About five minutes.',
  },
  {
    icon: FileText,
    title: 'Get your one-page brief',
    body: 'A short summary in your own words, the key facts to mention and a prioritised list of questions you can edit.',
  },
  {
    icon: ListChecks,
    title: 'Use it in the room',
    body: 'Visit mode shows one big checklist. Tick off questions as you ask them and jot down the answers.',
  },
]

const PROMISES = [
  {
    icon: HardDrive,
    title: 'Stays in your browser',
    body: 'Your notes are never saved on our server. Close the tab and they’re gone — unless you choose to keep them on this device.',
  },
  {
    icon: Sparkles,
    title: 'AI only if you say so',
    body: 'The built-in template works without sending anything anywhere. AI drafting is optional and asks for your consent first.',
  },
  {
    icon: EyeOff,
    title: 'No account, no tracking',
    body: 'No sign-up, no analytics and no third-party scripts.',
  },
  {
    icon: Trash2,
    title: 'Delete in one tap',
    body: 'Clear everything from this device whenever you like.',
  },
]

export default function Home() {
  return (
    <>
      <section className="relative overflow-hidden">
        <div aria-hidden="true" className="absolute -top-32 -right-24 size-[34rem] rounded-full bg-teal/12 blur-3xl" />
        <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 pt-14 pb-20 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:pt-20">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full bg-teal-soft px-3 py-1 text-sm font-bold text-teal-strong">
              <MessageCircleQuestion className="size-4" aria-hidden="true" /> Appointment preparation
            </p>
            <h1 className="mt-6 font-serif text-5xl leading-[1.05] font-semibold tracking-tight sm:text-6xl">
              Walk into your appointment ready.
            </h1>
            <p className="mt-6 max-w-xl text-lg text-ink-soft">
              Appointments go fast. CareBridge turns your worries and symptoms into a clear one-page brief and the right
              questions — so nothing important gets forgotten.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/prepare" className="btn btn-primary px-6 text-lg">
                Prepare for a visit <ArrowRight className="size-5" aria-hidden="true" />
              </Link>
              <a href="#how" className="btn btn-secondary px-6 text-lg">
                How it works
              </a>
            </div>
            <p className="mt-6 flex items-center gap-2 text-sm text-ink-soft">
              <ShieldCheck className="size-4 text-teal" aria-hidden="true" />
              Free · no account · your notes stay on your device
            </p>
          </div>
          <BriefPreview />
        </div>
      </section>

      <section id="how" className="scroll-mt-6 border-y border-line bg-surface">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <h2 className="font-serif text-4xl font-semibold tracking-tight">Before, during and after</h2>
          <ol className="mt-10 grid gap-6 md:grid-cols-3">
            {STEPS.map(({ icon: Icon, title, body }, index) => (
              <li key={title} className="relative rounded-3xl bg-sunken p-7">
                <span className="absolute top-6 right-7 font-serif text-5xl font-semibold text-line-strong">
                  {index + 1}
                </span>
                <span className="grid size-12 place-items-center rounded-2xl bg-teal text-on-teal">
                  <Icon className="size-6" aria-hidden="true" />
                </span>
                <h3 className="mt-6 text-xl font-bold">{title}</h3>
                <p className="mt-2 text-ink-soft">{body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section id="privacy" className="mx-auto max-w-6xl scroll-mt-6 px-4 py-20 sm:px-6">
        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <h2 className="font-serif text-4xl font-semibold tracking-tight">Your health notes are yours</h2>
            <p className="mt-4 text-ink-soft">
              CareBridge is designed so you can prepare without handing your health information to anyone.
            </p>
          </div>
          <ul className="grid gap-4 sm:grid-cols-2">
            {PROMISES.map(({ icon: Icon, title, body }) => (
              <li key={title} className="card p-6">
                <Icon className="size-6 text-teal" aria-hidden="true" />
                <h3 className="mt-4 font-bold">{title}</h3>
                <p className="mt-1 text-ink-soft">{body}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
        <div className="flex flex-col items-start gap-6 rounded-[2rem] bg-teal p-8 text-on-teal sm:p-12 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="font-serif text-3xl font-semibold">Got an appointment coming up?</h2>
            <p className="mt-2 opacity-85">Five minutes now can make the visit count.</p>
          </div>
          <Link href="/prepare" className="btn shrink-0 bg-surface px-6 text-lg text-ink hover:bg-canvas">
            Start preparing <ArrowRight className="size-5" aria-hidden="true" />
          </Link>
        </div>
      </section>
    </>
  )
}

function BriefPreview() {
  return (
    <div aria-hidden="true" className="relative mx-auto w-full max-w-md select-none lg:mx-0">
      <div className="card rotate-1 p-7 shadow-[0_40px_80px_-40px_rgb(15_37_51/0.45)]">
        <div className="flex items-center justify-between border-b border-line pb-4">
          <div>
            <p className="text-xs font-bold tracking-[0.12em] text-ink-soft uppercase">Visit brief</p>
            <p className="font-serif text-xl font-semibold">A new health concern</p>
          </div>
          <Printer className="size-5 text-ink-soft" />
        </div>
        <p className="mt-4 text-sm leading-relaxed">
          “I’m coming in about headaches most afternoons for two weeks. They’re worse after long days at a screen…”
        </p>
        <p className="mt-5 text-xs font-bold tracking-[0.12em] text-ink-soft uppercase">My questions</p>
        <ul className="mt-2 space-y-2 text-sm">
          {[
            ['Could my screen time be causing this?', true],
            ['Do I need any tests?', true],
            ['What can I do at home to help?', false],
          ].map(([q, done]) => (
            <li key={String(q)} className="flex items-center gap-2.5">
              <span
                className={`grid size-5 shrink-0 place-items-center rounded-md border-2 ${done ? 'border-teal bg-teal text-on-teal' : 'border-line-strong'}`}
              >
                {done && '✓'}
              </span>
              <span className={done ? 'text-ink-soft line-through' : ''}>{q}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="card absolute -bottom-16 -left-4 -rotate-2 px-5 py-4 sm:-left-10">
        <p className="flex items-center gap-2 text-sm font-bold">
          <NotebookPen className="size-4 text-teal" /> Answer noted
        </p>
        <p className="mt-1 text-sm text-ink-soft">“Try screen breaks; come back if no better in 2 weeks.”</p>
      </div>
    </div>
  )
}
