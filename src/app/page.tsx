import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, Bot, BrainCircuit, Sparkles, Wand2, Zap } from "lucide-react";

import { Button } from "@/components/ui/button";
import { isSupabaseAuthEnabled } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

export default async function LandingPage() {
  if (isSupabaseAuthEnabled()) {
    const supabase = await createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (session) {
      redirect("/practice");
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 md:px-6 flex h-14 items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold">
            <Bot className="h-5 w-5 text-primary" />
            <span>Rimev</span>
          </Link>
          <nav className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium text-muted-foreground hover:text-foreground">
              Sign In
            </Link>
            <Button asChild size="sm">
              <Link href="/signup">Get Started</Link>
            </Button>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-24 md:py-32 lg:py-40">
          <div className="container mx-auto px-4 md:px-6 relative z-10 flex flex-col items-center text-center">
            <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm font-medium text-primary mb-8">
              <Sparkles className="mr-2 h-4 w-4" />
              The AI Spaced Repetition Engine
            </div>
            <h1 className="max-w-4xl text-5xl font-extrabold tracking-tight sm:text-6xl md:text-7xl lg:text-8xl">
              Master anything, <br className="hidden sm:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-indigo-500">
                adaptively.
              </span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground sm:text-xl">
              Rimev generates personalized flashcards in real-time, instantly adapting to your proficiency level, and logically suggesting your next curriculum topics.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <Button asChild size="lg" className="h-12 px-8 text-base">
                <Link href="/signup">
                  Create Free Account
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="h-12 px-8 text-base">
                <Link href="/ai">
                  Try as Guest
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
          
          {/* Decorative background elements */}
          <div className="absolute left-1/2 top-1/2 -z-10 h-[800px] w-[800px] -translate-x-1/2 -translate-y-1/2 opacity-20 blur-[100px]">
            <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-primary to-indigo-500" />
          </div>
        </section>

        {/* Features Section */}
        <section className="container mx-auto px-4 md:px-6 py-24 md:py-32 border-t">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
              A curriculum built just for you
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              No more downloading stale flashcard decks. Tell Rimev what you want to learn, and the AI handles the rest.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            <div className="relative overflow-hidden rounded-2xl border bg-card p-8 shadow-sm transition-shadow hover:shadow-md">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <Zap className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Continuous Generation</h3>
              <p className="text-muted-foreground leading-relaxed">
                As you study, Rimev silently generates new flashcards in the background. You&apos;ll never run out of material or hit a loading screen.
              </p>
            </div>

            <div className="relative overflow-hidden rounded-2xl border bg-card p-8 shadow-sm transition-shadow hover:shadow-md">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500/10">
                <BrainCircuit className="h-6 w-6 text-indigo-500" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Dynamic Difficulty</h3>
              <p className="text-muted-foreground leading-relaxed">
                Rimev tracks exactly which concepts you struggle with. Master the basics, and the AI seamlessly ramps up the vocabulary and grammar complexity.
              </p>
            </div>

            <div className="relative overflow-hidden rounded-2xl border bg-card p-8 shadow-sm transition-shadow hover:shadow-md">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/10">
                <Wand2 className="h-6 w-6 text-purple-500" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Curriculum Progression</h3>
              <p className="text-muted-foreground leading-relaxed">
                Finished learning Greetings? The Next Topic Wand analyzes your progress and automatically suggests logical progression paths, like Ordering Food.
              </p>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t py-10">
        <div className="container mx-auto px-4 md:px-6 flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
          <div className="flex items-center gap-2 font-semibold">
            <Bot className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Rimev AI</span>
          </div>
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Rimev. All rights reserved. · Developed by{' '}
            <a
              href="https://pvnpll.in"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium underline underline-offset-4 hover:text-foreground transition-colors"
            >
              pvnpll
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
