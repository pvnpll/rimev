"use client";

import { APP_VERSION } from "@/lib/app-version";
import { SettingsSubpage } from "@/features/settings/components/settings-subpage";
import { Card, CardContent } from "@/components/ui/card";

export function AboutSettingsPageContent() {
  return (
    <SettingsSubpage title="About" description="Learn more about Rimev.">
      <Card>
        <CardContent className="space-y-2 pt-6 text-sm text-muted-foreground">
          <p>Mobile-first learning app with Practice mode and Daily Review.</p>
          <p>Practice endlessly on open, run Daily Review when cards are due, and manage decks from Settings.</p>
          <p className="pt-2 text-xs">Rimev v{APP_VERSION}</p>
          <p className="text-xs">
            Developed by{' '}
            <a
              href="https://pvnpll.in"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium underline underline-offset-4 hover:text-foreground transition-colors"
            >
              pvnpll
            </a>
          </p>
        </CardContent>
      </Card>
    </SettingsSubpage>
  );
}
