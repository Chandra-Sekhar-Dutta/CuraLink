import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';
import { db } from '@/db';
import { patientProfiles } from '@/db/schema';
import { and, eq } from 'drizzle-orm';

function toCsv(list: string[] | undefined) {
  return (list || []).map((s) => s.trim()).filter(Boolean).join(',');
}

function fromCsv(csv: string | null) {
  if (!csv) return [] as string[];
  return csv.split(',').map((s) => s.trim()).filter(Boolean);
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const userId = parseInt(String(session.user.id));

  try {
    const rows = await db.select().from(patientProfiles).where(eq(patientProfiles.userId, userId)).limit(1);
    const row = rows[0];
    if (!row) return NextResponse.json({ profile: null });
    return NextResponse.json({
      profile: {
        conditionNarrative: row.conditionNarrative || '',
        conditions: fromCsv(row.conditionsCsv),
        city: row.city || '',
        country: row.country || '',
        showGlobal: !!row.showGlobal,
      }
    });
  } catch (e) {
    return NextResponse.json({ error: 'Failed to load profile' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const userId = parseInt(String(session.user.id));

  const body = await req.json().catch(() => null);
  if (!body || !Array.isArray(body.conditions)) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }

  const payload = {
    userId,
    conditionNarrative: (body.conditionNarrative ?? ''),
    conditionsCsv: toCsv(body.conditions as string[]),
    city: (body.city ?? '').slice(0, 255) || null,
    country: (body.country ?? '').slice(0, 255) || null,
    showGlobal: !!body.showGlobal,
  };

  try {
    const existing = await db.select().from(patientProfiles).where(eq(patientProfiles.userId, userId)).limit(1);
    if (existing[0]) {
      await db.update(patientProfiles).set({
        conditionNarrative: payload.conditionNarrative,
        conditionsCsv: payload.conditionsCsv,
        city: payload.city,
        country: payload.country,
        showGlobal: payload.showGlobal,
        updatedAt: new Date(),
      }).where(eq(patientProfiles.userId, userId));
    } else {
      await db.insert(patientProfiles).values({ ...payload });
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: 'Failed to save profile' }, { status: 500 });
  }
}
