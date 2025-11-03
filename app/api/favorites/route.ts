import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';
import { db } from '@/db';
import { favorites } from '@/db/schema';
import { and, eq } from 'drizzle-orm';

type Kind = 'experts' | 'trials' | 'publications';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const userId = parseInt(String(session.user.id));
  const rows = await db.select().from(favorites).where(eq(favorites.userId, userId));
  const out: Record<Kind, string[]> = { experts: [], trials: [], publications: [] } as any;
  for (const r of rows) {
    const k = r.kind as Kind;
    if (!out[k]) out[k] = [] as any;
    out[k].push(r.itemId);
  }
  return NextResponse.json(out);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const userId = parseInt(String(session.user.id));
  const body = await req.json().catch(() => null);
  const kind: Kind | undefined = body?.kind;
  const itemId: string | undefined = body?.itemId;
  if (!kind || !itemId) return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  try {
    const exists = await db.select().from(favorites).where(and(eq(favorites.userId, userId), eq(favorites.kind, kind), eq(favorites.itemId, itemId))).limit(1);
    if (!exists[0]) {
      await db.insert(favorites).values({ userId, kind, itemId });
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: 'Failed to add favorite' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const userId = parseInt(String(session.user.id));
  const body = await req.json().catch(() => null);
  const kind: Kind | undefined = body?.kind;
  const itemId: string | undefined = body?.itemId;
  if (!kind || !itemId) return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  try {
    await db.delete(favorites).where(and(eq(favorites.userId, userId), eq(favorites.kind, kind), eq(favorites.itemId, itemId)));
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: 'Failed to remove favorite' }, { status: 500 });
  }
}
