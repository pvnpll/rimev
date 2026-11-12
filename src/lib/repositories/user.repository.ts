import { prisma } from "@/lib/db/prisma";
import { normalizeUsername } from "@/lib/username";
import { generateUniqueUsername } from "@/lib/username.server";
import type { UserProfile } from "@/types/user";

function toProfile(row: {
  id: string;
  email: string;
  username: string;
  name: string | null;
}): UserProfile {
  return {
    id: row.id,
    email: row.email,
    username: row.username,
    name: row.name,
  };
}

async function assignUsernameIfMissing(userId: string): Promise<string> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { username: true },
  });

  if (user?.username) {
    return user.username;
  }

  const username = await generateUniqueUsername();
  await prisma.user.update({
    where: { id: userId },
    data: { username },
  });

  return username;
}

export const userRepository = {
  async ensureUser(input: { id: string; email: string; name?: string | null }) {
    const existing = await prisma.user.findUnique({
      where: { id: input.id },
      select: { id: true, username: true },
    });

    if (existing) {
      await prisma.user.update({
        where: { id: input.id },
        data: {
          email: input.email,
          ...(input.name !== undefined ? { name: input.name } : {}),
          ...(!existing.username ? { username: await generateUniqueUsername() } : {}),
        },
      });
      return;
    }

    await prisma.user.create({
      data: {
        id: input.id,
        email: input.email,
        name: input.name ?? undefined,
        username: await generateUniqueUsername(),
      },
    });
  },

  /** One read on the hot path; writes only when the user row is missing. */
  async syncUserIfNeeded(input: { id: string; email: string; name?: string | null }) {
    const existing = await prisma.user.findUnique({
      where: { id: input.id },
      select: { id: true },
    });

    if (existing) return;

    await prisma.user.create({
      data: {
        id: input.id,
        email: input.email,
        name: input.name ?? undefined,
        username: await generateUniqueUsername(),
      },
    });
  },

  async findById(userId: string): Promise<UserProfile | null> {
    const row = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, username: true, name: true },
    });

    if (!row) return null;

    const username = row.username ?? (await assignUsernameIfMissing(userId));
    return toProfile({ ...row, username });
  },

  async findEmailByUsername(username: string): Promise<string | null> {
    const row = await prisma.user.findUnique({
      where: { username: normalizeUsername(username) },
      select: { email: true },
    });

    return row?.email ?? null;
  },

  async updateUsername(userId: string, username: string): Promise<UserProfile> {
    const row = await prisma.user.update({
      where: { id: userId },
      data: { username: normalizeUsername(username) },
      select: { id: true, email: true, username: true, name: true },
    });

    return toProfile({
      ...row,
      username: row.username ?? username,
    });
  },

  async isUsernameTaken(username: string, excludeUserId?: string): Promise<boolean> {
    const row = await prisma.user.findUnique({
      where: { username: normalizeUsername(username) },
      select: { id: true },
    });

    if (!row) return false;
    if (excludeUserId && row.id === excludeUserId) return false;
    return true;
  },
};
