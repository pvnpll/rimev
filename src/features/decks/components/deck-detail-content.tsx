"use client";

import Link from "next/link";
import { ArrowLeft, Download, Globe, Sparkles, UserRound } from "lucide-react";

import { DeckVisibilityToggle } from "@/features/decks/components/deck-visibility-toggle";
import { ImportPublicDeckButton } from "@/features/decks/components/import-public-deck-button";
import { useDeck, useUpdateDeck } from "@/features/decks/hooks/use-decks";
import { useAuthSession } from "@/features/auth/hooks/use-auth-session";
import { useLessons } from "@/features/lessons/hooks/use-lessons";
import { LessonsSection } from "@/features/lessons/components/lesson-list";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { InlineTitleEditor } from "@/components/ui/inline-title-editor";
import { Skeleton } from "@/components/ui/skeleton";

export function DeckDetailContent({ deckId }: { deckId: string }) {
  const { isAuthenticated } = useAuthSession();
  const { data: deck, isLoading: deckLoading, isError, error } = useDeck(deckId);
  const updateDeck = useUpdateDeck(deckId);
  useLessons(deckId);

  if (deckLoading) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-full max-w-md" />
        <Skeleton className="h-64 rounded-2xl" />
      </div>
    );
  }

  if (isError || !deck) {
    return (
      <p className="text-destructive">
        {error instanceof Error ? error.message : "Deck not found"}
      </p>
    );
  }

  const backHref = deck.isOwner ? "/decks" : "/explore";
  const backLabel = deck.isOwner ? "All Decks" : "Explore";
  const creditedAuthor = deck.sourceAuthorUsername ?? deck.authorUsername;

  return (
    <div className="space-y-8">
      <div>
        <Button asChild variant="ghost" size="sm" className="mb-4 -ml-2">
          <Link href={backHref}>
            <ArrowLeft className="h-4 w-4" />
            {backLabel}
          </Link>
        </Button>
        <div className="flex items-start gap-4">
          <div
            className="mt-2 h-4 w-4 shrink-0 rounded-full"
            style={{ backgroundColor: deck.color }}
          />
          <div>
            {deck.isOwner ? (
              <InlineTitleEditor
                value={deck.title}
                titleClassName="text-3xl font-bold tracking-tight"
                isSaving={updateDeck.isPending}
                error={
                  updateDeck.isError && updateDeck.error instanceof Error
                    ? updateDeck.error.message
                    : null
                }
                onSave={async (title) => {
                  await updateDeck.mutateAsync({ title });
                }}
              />
            ) : (
              <h1 className="text-3xl font-bold tracking-tight">{deck.title}</h1>
            )}
            {deck.subject && <p className="text-muted-foreground">{deck.subject}</p>}
            {deck.description && (
              <p className="mt-2 text-sm text-muted-foreground">{deck.description}</p>
            )}
          </div>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Button asChild size="lg">
            <Link href={`/practice?deckId=${deckId}`}>
              <Sparkles className="h-4 w-4" />
              Practice deck
            </Link>
          </Button>
          {deck.isOwner && (
            <Button asChild variant="outline" size="lg">
              <a href={`/api/decks/${deckId}/export`} download>
                <Download className="h-4 w-4" />
                Export deck
              </a>
            </Button>
          )}
          {deck.isPublic && deck.isOwner && (
            <Badge variant="outline" className="gap-1">
              <Globe className="h-3 w-3" />
              Public
            </Badge>
          )}
          {creditedAuthor && (
            <Badge variant="secondary" className="gap-1">
              <UserRound className="h-3 w-3" />@{creditedAuthor}
            </Badge>
          )}
        </div>
      </div>

      {deck.isOwner ? (
        <>
          {deck.sourceDeckId ? (
            <Card>
              <CardContent className="py-6 text-sm text-muted-foreground">
                {deck.sourceAuthorUsername
                  ? `Originally by @${deck.sourceAuthorUsername}. `
                  : "Imported from a public deck. "}
                Practice and run Daily Review here — your progress is saved to your library. Visibility is
                controlled by the original author.
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Visibility</CardTitle>
                <CardDescription>
                  Choose whether this deck appears in Explore for other learners.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <DeckVisibilityToggle deckId={deckId} isPublic={deck.isPublic} />
              </CardContent>
            </Card>
          )}
        </>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Add to your library</CardTitle>
            <CardDescription>
              {isAuthenticated
                ? "Import this deck to practice, run Daily Review, and save your own progress. The original author stays credited on your copy."
                : "Sign in to import this deck, run Daily Review, and save your own progress. You can practice it now without an account."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ImportPublicDeckButton deckId={deckId} importedDeckId={deck.importedDeckId} />
          </CardContent>
        </Card>
      )}

      <LessonsSection deckId={deckId} canEdit={deck.isOwner} />
    </div>
  );
}
