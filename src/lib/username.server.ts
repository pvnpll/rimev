import { randomUUID } from "crypto";

import { prisma } from "@/lib/db/prisma";

const ADJECTIVES = [
  "swift",
  "bright",
  "calm",
  "bold",
  "keen",
  "lucky",
  "merry",
  "noble",
  "quiet",
  "rapid",
  "sunny",
  "witty",
];

const NOUNS = [
  "badger",
  "crane",
  "falcon",
  "heron",
  "lynx",
  "otter",
  "panda",
  "raven",
  "tiger",
  "wolf",
  "finch",
  "koala",
];

function randomItem<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)]!;
}

function randomSuffix(): string {
  return String(Math.floor(Math.random() * 9000) + 1000);
}

export async function generateUniqueUsername(): Promise<string> {
  for (let attempt = 0; attempt < 30; attempt += 1) {
    const candidate = `${randomItem(ADJECTIVES)}-${randomItem(NOUNS)}-${randomSuffix()}`;
    const existing = await prisma.user.findUnique({
      where: { username: candidate },
      select: { id: true },
    });
    if (!existing) {
      return candidate;
    }
  }

  return `learner-${randomUUID().slice(0, 8)}`;
}
