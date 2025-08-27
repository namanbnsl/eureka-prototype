import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="relative min-h-screen">
      {/* Subtle grid background */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,rgba(120,120,255,0.08),transparent_50%),radial-gradient(ellipse_at_bottom,rgba(120,255,200,0.06),transparent_50%)]" />
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(to_bottom,transparent,transparent_60%,rgba(0,0,0,0.04)_100%)]" />

      <header className="flex items-center justify-between px-6 md:px-10 py-6">
        <Link href="/" className="font-mono text-sm md:text-base text-zinc-500 hover:text-foreground transition-colors">
          <span className="rounded-md border border-zinc-200/60 dark:border-zinc-800/60 px-2 py-1">brain.open()</span>
        </Link>
        <nav className="flex items-center gap-2">
          <Link href="/chat">
            <Button variant="outline">Open the brain</Button>
          </Link>
        </nav>
      </header>

      <main className="mx-auto max-w-5xl px-6 md:px-10 pt-10 md:pt-20 pb-24">
        <div className="flex flex-col items-center text-center gap-8">
          <p className="font-mono text-xs tracking-widest text-zinc-500">
            THE FUTURE OF EDUCATION WITH AI
          </p>
          <h1 className="text-4xl md:text-6xl font-semibold leading-tight">
            Learn faster with
            <span className="ml-2 inline-block rounded-lg border border-zinc-200/60 px-3 py-1 font-mono text-3xl md:text-5xl align-middle dark:border-zinc-800/60">
              brain.open()
            </span>
          </h1>
          <p className="max-w-2xl text-zinc-600 dark:text-zinc-300">
            An AI‑native learning OS: minimal, calm, and personal. Ask. Explore. Master.
          </p>
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <Link href="/chat">
              <Button size="lg">Start chatting</Button>
            </Link>
            <Link href="#about" className="text-sm text-zinc-600 hover:text-foreground transition-colors">
              Learn more →
            </Link>
          </div>
        </div>

        <section id="about" className="mt-24 grid gap-6 md:grid-cols-3">
          <Feature title="Socratic chat" body="Guided questions that lead you to insight, not just answers." />
          <Feature title="Memory that matters" body="Your progress and preferences persist, shaping future help." />
          <Feature title="Calm design" body="A focused interface so you can stay in flow while learning." />
        </section>
      </main>

      <footer className="px-6 md:px-10 py-8 text-center text-xs text-zinc-500">
        © {new Date().getFullYear()} brain.open()
      </footer>
    </div>
  );
}

function Feature({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-xl border border-zinc-200/70 p-5 dark:border-zinc-800/70">
      <h3 className="text-sm font-medium mb-1.5">{title}</h3>
      <p className="text-sm text-zinc-600 dark:text-zinc-300">{body}</p>
    </div>
  );
}
